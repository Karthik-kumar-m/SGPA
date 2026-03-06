from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Result, User
from app.schemas import ParsedResult, SaveResultRequest, ResultOut, SubjectResult, UserCreate, UserOut
from app.pdf_parser import parse_vtu_pdf

router = APIRouter()


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.usn == payload.usn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with USN '{payload.usn}' already exists.",
        )
    user = User(name=payload.name, usn=payload.usn, email=payload.email)
    db.add(user)
    db.commit()
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

@router.post("/upload", response_model=ParsedResult)
async def upload_result(file: UploadFile = File(...)):
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
        subjects, sgpa, total_credits = parse_vtu_pdf(file_bytes)
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
    )


# ---------------------------------------------------------------------------
# Save result to database
# ---------------------------------------------------------------------------

@router.post("/save-result", response_model=ResultOut, status_code=status.HTTP_201_CREATED)
def save_result(payload: SaveResultRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

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
