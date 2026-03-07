"""
PDF parser for VTU result PDFs.

Supports the VTU 2022/24 scheme grading system:
  O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0
"""

import io
import re
import pdfplumber
from sqlalchemy.orm import Session
from typing import Optional

# ---------------------------------------------------------------------------
# Grade → points mapping
# ---------------------------------------------------------------------------
GRADE_POINTS: dict[str, int] = {
    "O": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5,
    "P": 4,
    "F": 0,
}


# ---------------------------------------------------------------------------
# Database credit lookup
# ---------------------------------------------------------------------------
def get_credits_from_db(course_code: str, db: Session) -> Optional[int]:
    """
    Fetch credits for a course code from the course_reference table.
    Returns None if course not found in database.
    """
    from app.models import CourseReference
    
    course = db.query(CourseReference).filter(
        CourseReference.course_code == course_code.upper()
    ).first()
    
    if course:
        return course.credits
    return None

# ---------------------------------------------------------------------------
# Marks to Grade conversion (VTU 2022 scheme)
# ---------------------------------------------------------------------------
def _marks_to_grade(marks: int) -> str:
    """Convert total marks to letter grade based on VTU scheme."""
    if marks >= 90:
        return "O"
    elif marks >= 80:
        return "A+"
    elif marks >= 70:
        return "A"
    elif marks >= 60:
        return "B+"
    elif marks >= 50:
        return "B"
    elif marks >= 45:
        return "C"
    elif marks >= 40:
        return "P"
    else:
        return "F"


# ---------------------------------------------------------------------------
# Credit inference from subject code
# ---------------------------------------------------------------------------
def _infer_credits(subject_code: str, db: Optional[Session] = None) -> int:
    """
    Infer credits from database or fallback to pattern matching.
    
    Args:
        subject_code: The course code to look up
        db: Database session for lookup (optional)
        
    Returns:
        Credits for the course (0 for non-credit courses)
    """
    code_upper = subject_code.upper()

    # First try database lookup if session provided
    if db is not None:
        db_credits = get_credits_from_db(code_upper, db)
        if db_credits is not None:
            return db_credits
    
    # Fallback: Pattern-based inference for unknown courses
    # This ensures backward compatibility if DB is not available
    
    # Non-credit courses (NSS, Physical Education, Yoga, Indian Knowledge System)
    non_credit_patterns = ['NSS', 'NSK', 'PEK', 'YOK', 'BIKS', 'YOGA', 'PHYSICAL']
    if any(pattern in code_upper for pattern in non_credit_patterns):
        return 0
    
    # Lab subjects have 'L' in the code and are typically 1 credit
    if 'L' in code_upper and len(code_upper) >= 6:
        return 1
    
    # BSCK (Skill subjects) are typically 1 credit
    if 'BSCK' in code_upper:
        return 1
    
    # AEC/SEC courses (e.g., BCS358A, BCS456A, BCS657A)
    if any(x in code_upper for x in ['358', '456', '657']):
        return 1
    
    # Mini-projects are typically 2 credits
    if '586' in code_upper:
        return 2
    
    # Major projects Phase II are typically 6 credits
    if '786' in code_upper:
        return 6
    
    # Internship courses are typically 10 credits
    if '803' in code_upper:
        return 10
    
    # Theory subjects are typically 3-4 credits (default to 3)
    return 3


# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------
# Pattern for semester extraction from VTU PDFs
# Matches: "Semester: III", "Sem: 3", "SEMESTER 3" etc.
_SEMESTER_PATTERN = re.compile(
    r"(?:semester|sem)\s*:?\s*([IVX]+|[1-8])",
    re.IGNORECASE
)

# Roman numeral to integer mapping
_ROMAN_TO_INT = {
    "I": 1, "II": 2, "III": 3, "IV": 4,
    "V": 5, "VI": 6, "VII": 7, "VIII": 8
}

# Pattern 1: Marks-based format (e.g., VTU provisional results)
# Matches: BCS301 ... 44 30 74 P
# Subject code, followed by marks columns, total marks, and result
_MARKS_PATTERN = re.compile(
    r"([A-Z]{2,4}[A-Z0-9]{3,6})"  # subject code (e.g., BCS301, BCSL305)
    r"(?:.*?)"                     # any content in between (subject name, internal/external marks)
    r"\s+(\d{1,3})"                # total marks (1-3 digits)
    r"\s+([PF])"                   # result (P/F)
    r"(?:\s+\d{4}-\d{2}-\d{2})?",  # optional date
    re.IGNORECASE
)

# Pattern 2: Grade-based format (old parser format)
# Matches: 21CS41 4 A+
_GRADE_PATTERN = re.compile(
    r"([A-Z0-9]{5,10})"                  # subject code
    r"\s+"                               # whitespace
    r"([1-9])"                           # credits
    r"\s+"
    r"(O|A\+|B\+|A|B|C|P|F)(?=\s|$)",   # grade
    re.IGNORECASE,
)


def _normalize_grade(raw: str) -> str:
    return raw.upper()


def _extract_semester(text: str) -> int:
    """
    Extract semester number from VTU PDF text.
    
    Tries to find patterns like "Semester: III", "Sem: 3", etc.
    Also infers from course codes if direct extraction fails.
    
    Returns:
        Semester number (1-8)
        
    Raises:
        ValueError: if semester cannot be determined
    """
    # Try direct semester extraction
    match = _SEMESTER_PATTERN.search(text)
    if match:
        sem_str = match.group(1).upper()
        # Check if it's a roman numeral
        if sem_str in _ROMAN_TO_INT:
            return _ROMAN_TO_INT[sem_str]
        # Otherwise it's a digit
        try:
            semester = int(sem_str)
            if 1 <= semester <= 8:
                return semester
        except ValueError:
            pass
    
    # Fallback: Infer from course codes (e.g., BCS301 -> semester 3)
    # Extract all course codes and check their 3rd digit
    course_pattern = re.compile(r"B[A-Z]{2,3}([1-8])\d{2}", re.IGNORECASE)
    matches = course_pattern.findall(text)
    if matches:
        # Take the most common semester digit
        from collections import Counter
        semester_counts = Counter(int(m) for m in matches)
        if semester_counts:
            most_common_sem = semester_counts.most_common(1)[0][0]
            return most_common_sem
    
    raise ValueError(
        "Could not determine semester from PDF. "
        "Please ensure the PDF contains semester information."
    )


def parse_vtu_pdf(file_bytes: bytes, db: Optional[Session] = None) -> tuple[list[dict], float, int, int]:
    """
    Parse a VTU result PDF and return:
        (subjects_list, sgpa, total_credits, semester)

    subjects_list items:
        {subject_code, credits, grade, grade_points}

    Args:
        file_bytes: PDF file content as bytes
        db: Database session for credit lookup (optional but recommended)

    Raises:
        ValueError: if no subject data can be extracted or semester cannot be determined.
    """
    text = _extract_text(file_bytes)
    
    # Extract semester first
    semester = _extract_semester(text)
    
    # Extract subjects
    subjects = _extract_subjects(text, db)

    if not subjects:
        raise ValueError(
            "No subject data found in the PDF. "
            "Ensure the file is a valid VTU result PDF."
        )

    sgpa, total_credits = _calculate_sgpa(subjects)
    return subjects, sgpa, total_credits, semester


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_text(file_bytes: bytes) -> str:
    pages: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                pages.append(page_text)
    return "\n".join(pages)


def _extract_subjects(text: str, db: Optional[Session] = None) -> list[dict]:
    subjects: list[dict] = []
    seen_codes: set[str] = set()

    # Try marks-based pattern first (newer VTU format)
    for match in _MARKS_PATTERN.finditer(text):
        code = match.group(1).upper()
        total_marks = int(match.group(2))
        result = match.group(3).upper()

        # Deduplicate
        if code in seen_codes:
            continue
        seen_codes.add(code)

        # Skip if failed
        if result == 'F':
            grade = 'F'
        else:
            grade = _marks_to_grade(total_marks)
        
        credits = _infer_credits(code, db)
        grade_pts = GRADE_POINTS.get(grade, 0)
        
        subjects.append(
            {
                "subject_code": code,
                "credits": credits,
                "grade": grade,
                "grade_points": grade_pts,
            }
        )

    # If no matches, try the old grade-based pattern
    if not subjects:
        for match in _GRADE_PATTERN.finditer(text):
            code = match.group(1).upper()
            credits_from_pdf = int(match.group(2))
            grade = _normalize_grade(match.group(3))

            if code in seen_codes:
                continue
            seen_codes.add(code)

            # Use DB credits if available, else use PDF credits
            credits = _infer_credits(code, db)
            if credits is None or (db is None):
                credits = credits_from_pdf
            
            grade_pts = GRADE_POINTS.get(grade, 0)
            subjects.append(
                {
                    "subject_code": code,
                    "credits": credits,
                    "grade": grade,
                    "grade_points": grade_pts,
                }
            )

    return subjects


def _calculate_sgpa(subjects: list[dict]) -> tuple[float, int]:
    """
    Calculate SGPA excluding non-credit courses (Yoga, NSS, PE, etc.).
    
    Args:
        subjects: List of subject dictionaries with credits and grade_points
        
    Returns:
        Tuple of (sgpa, total_credits)
    """
    # Filter out non-credit courses (credits = 0)
    credit_subjects = [s for s in subjects if s["credits"] > 0]
    
    if not credit_subjects:
        return 0.0, 0
    
    total_credits = sum(s["credits"] for s in credit_subjects)
    weighted_sum = sum(s["credits"] * s["grade_points"] for s in credit_subjects)

    if total_credits == 0:
        return 0.0, 0

    sgpa = round(weighted_sum / total_credits, 2)
    return sgpa, total_credits
