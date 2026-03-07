from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.database import get_db
from app.models import Result, User
from app.schemas import ParsedResult, SaveResultRequest, ResultOut, SubjectResult, UserCreate, UserOut, UserLogin, Token
from app.pdf_parser import parse_vtu_pdf, _extract_text, _MARKS_PATTERN, _GRADE_PATTERN
from app.auth import hash_password, verify_password, create_access_token, get_current_user
import re

router = APIRouter()


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

@router.post("/auth/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if USN already exists
    existing = db.query(User).filter(User.usn == payload.usn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with USN '{payload.usn}' already exists.",
        )
    
    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email '{payload.email}' already exists.",
            )

    # Hash password and create user
    password_hash = hash_password(payload.password)
    user = User(
        name=payload.name,
        usn=payload.usn,
        email=payload.email,
        password_hash=password_hash
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists with the provided credentials.",
        )
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.usn})
    
    return Token(
        access_token=access_token,
        user=UserOut.model_validate(user)
    )


@router.post("/auth/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Login with USN and password"""
    user = db.query(User).filter(User.usn == payload.usn).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect USN or password",
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.usn})
    
    return Token(
        access_token=access_token,
        user=UserOut.model_validate(user)
    )


@router.get("/auth/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user


# ---------------------------------------------------------------------------
# Users (kept for backward compatibility)
# ---------------------------------------------------------------------------

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.usn == payload.usn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with USN '{payload.usn}' already exists.",
        )
    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email '{payload.email}' already exists.",
            )

    password_hash = hash_password(payload.password)
    user = User(name=payload.name, usn=payload.usn, email=payload.email, password_hash=password_hash)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists with the provided credentials.",
        )
    db.refresh(user)
    return user


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


# ---------------------------------------------------------------------------
# Upload PDF → parse + calculate SGPA
# ---------------------------------------------------------------------------

@router.post("/debug-pdf")
async def debug_pdf(file: UploadFile = File(...)):
    """Debug endpoint to see extracted text and pattern matches from PDF"""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted.",
        )
    
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )
    
    try:
        # Extract raw text
        text = _extract_text(file_bytes)
        
        # Try to find matches with both patterns
        matches = []
        for match in _MARKS_PATTERN.finditer(text):
            matches.append({
                "pattern": "marks-based",
                "subject_code": match.group(1),
                "total_marks": match.group(2),
                "result": match.group(3),
                "full_match": match.group(0)
            })
        
        for match in _GRADE_PATTERN.finditer(text):
            matches.append({
                "pattern": "grade-based",
                "subject_code": match.group(1),
                "credits": match.group(2),
                "grade": match.group(3),
                "full_match": match.group(0)
            })
        
        return {
            "extracted_text": text[:2000] + ("..." if len(text) > 2000 else ""),  # First 2000 chars
            "full_text_length": len(text),
            "matches_found": len(matches),
            "matches": matches[:20],  # First 20 matches
            "expected_pattern": "Subject code (5-10 chars) + whitespace + credits (1-9) + whitespace + grade (O/A+/A/B+/B/C/P/F)",
            "example": "21CS41   4   A+"
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug error: {exc}",
        )


@router.post("/upload", response_model=ParsedResult)
async def upload_result(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Be lenient: some browsers send application/octet-stream for PDFs
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are accepted.",
            )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        subjects, sgpa, total_credits, semester = parse_vtu_pdf(file_bytes, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Parsing error: {exc}",
        )

    return ParsedResult(
        subjects=[SubjectResult(**s) for s in subjects],
        sgpa=sgpa,
        total_credits=total_credits,
        semester=semester,
    )


# ---------------------------------------------------------------------------
# Save result to database
# ---------------------------------------------------------------------------

@router.post("/save-result", response_model=ResultOut, status_code=status.HTTP_201_CREATED)
def save_result(payload: SaveResultRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Check if result already exists for this user and semester
    existing_result = db.query(Result).filter(
        Result.user_id == payload.user_id,
        Result.semester == payload.semester
    ).first()

    if existing_result:
        # Update existing result
        existing_result.sgpa = payload.sgpa
        existing_result.total_credits = payload.total_credits
        existing_result.subjects = [s.model_dump() for s in payload.subjects]
        existing_result.uploaded_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_result)
        return existing_result
    else:
        # Create new result
        result = Result(
            user_id=payload.user_id,
            semester=payload.semester,
            sgpa=payload.sgpa,
            total_credits=payload.total_credits,
            subjects=[s.model_dump() for s in payload.subjects],
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return result


# ---------------------------------------------------------------------------
# Upload and Auto-Save (for authenticated users)
# ---------------------------------------------------------------------------

@router.post("/upload-and-save", response_model=ResultOut)
async def upload_and_save(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a PDF, parse it, extract semester automatically, and save to database.
    This endpoint requires authentication and automatically saves the result.
    If a result for this semester already exists, it will be updated.
    """
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are accepted.",
            )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        subjects, sgpa, total_credits, semester = parse_vtu_pdf(file_bytes, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Parsing error: {exc}",
        )

    # Check if result already exists for this user and semester
    existing_result = db.query(Result).filter(
        Result.user_id == current_user.id,
        Result.semester == semester
    ).first()

    if existing_result:
        # Update existing result
        existing_result.sgpa = sgpa
        existing_result.total_credits = total_credits
        existing_result.subjects = subjects
        existing_result.uploaded_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_result)
        return existing_result
    else:
        # Create new result
        result = Result(
            user_id=current_user.id,
            semester=semester,
            sgpa=sgpa,
            total_credits=total_credits,
            subjects=subjects,
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return result


# ---------------------------------------------------------------------------
# Get all results for a user
# ---------------------------------------------------------------------------

@router.get("/results/{user_id}", response_model=list[ResultOut])
def get_results(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    results = (
        db.query(Result)
        .filter(Result.user_id == user_id)
        .order_by(Result.semester)
        .all()
    )
    return results


# ---------------------------------------------------------------------------
# Course Reference Endpoints
# ---------------------------------------------------------------------------

@router.get("/courses/{course_code}")
def get_course_info(course_code: str, db: Session = Depends(get_db)):
    """Get course information by course code"""
    from app.models import CourseReference
    
    course = db.query(CourseReference).filter(
        CourseReference.course_code == course_code.upper()
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=404,
            detail=f"Course '{course_code}' not found in database."
        )
    
    return {
        "course_code": course.course_code,
        "course_title": course.course_title,
        "credits": course.credits,
        "semester": course.semester,
        "stream": course.stream
    }


@router.get("/courses")
def list_courses(
    semester: int | None = None,
    credits: int | None = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List courses with optional filters"""
    from app.models import CourseReference
    
    query = db.query(CourseReference)
    
    if semester is not None:
        query = query.filter(CourseReference.semester == semester)
    
    if credits is not None:
        query = query.filter(CourseReference.credits == credits)
    
    courses = query.limit(limit).all()
    
    return {
        "count": len(courses),
        "courses": [
            {
                "course_code": c.course_code,
                "course_title": c.course_title,
                "credits": c.credits,
                "semester": c.semester,
                "stream": c.stream
            }
            for c in courses
        ]
    }
