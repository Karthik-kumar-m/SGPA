"""
PDF parser for VTU result PDFs.

Supports the VTU 2022/24 scheme grading system:
  O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0
"""

import io
import re
import pdfplumber


# Explicit credit overrides for known subject codes.
_CREDIT_OVERRIDES: dict[str, int] = {
    "BCS301": 4,
    "BCS302": 4,
    "BCS303": 4,
    "BCS306A": 3,
}

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
def _infer_credits(subject_code: str) -> int:
    """Infer credits from subject code pattern."""
    code_upper = subject_code.upper()

    # Exact-code overrides always take precedence.
    if code_upper in _CREDIT_OVERRIDES:
        return _CREDIT_OVERRIDES[code_upper]
    
    # Physical Education has 0 credits (not included in SGPA calculation)
    if 'BPEK' in code_upper or 'PE' in code_upper:
        return 0
    
    # Lab subjects have 'L' in the code and are 1 credit
    if 'L' in code_upper and len(code_upper) >= 6:
        return 1
    
    # BSCK (Skill subjects) are 1 credit
    if 'BSCK' in code_upper:
        return 1
    
    # Project/Mini-project subjects ending with A/B/C are usually 1 credit,
    # unless overridden above.
    if code_upper.endswith('A') or code_upper.endswith('B') or code_upper.endswith('C'):
        return 1
    
    # Open electives (BSEK, BOEK) are typically 2 credits
    if any(x in code_upper for x in ['BSEK', 'BOEK']):
        return 2
    
    # Theory subjects are typically 3 credits
    return 3


# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------
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


def parse_vtu_pdf(file_bytes: bytes) -> tuple[list[dict], float, int]:
    """
    Parse a VTU result PDF and return:
        (subjects_list, sgpa, total_credits)

    subjects_list items:
        {subject_code, credits, grade, grade_points}

    Raises:
        ValueError: if no subject data can be extracted.
    """
    text = _extract_text(file_bytes)
    subjects = _extract_subjects(text)

    if not subjects:
        raise ValueError(
            "No subject data found in the PDF. "
            "Ensure the file is a valid VTU result PDF."
        )

    sgpa, total_credits = _calculate_sgpa(subjects)
    return subjects, sgpa, total_credits


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


def _extract_subjects(text: str) -> list[dict]:
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
        
        credits = _infer_credits(code)
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
            credits = int(match.group(2))
            grade = _normalize_grade(match.group(3))

            if code in seen_codes:
                continue
            seen_codes.add(code)

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
    total_credits = sum(s["credits"] for s in subjects)
    weighted_sum = sum(s["credits"] * s["grade_points"] for s in subjects)

    if total_credits == 0:
        return 0.0, 0

    sgpa = round(weighted_sum / total_credits, 2)
    return sgpa, total_credits
