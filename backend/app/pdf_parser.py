"""
PDF parser for VTU result PDFs.

Supports the VTU 2022/24 scheme grading system:
  O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0
"""

import io
import re
import pdfplumber

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
# Regex
# ---------------------------------------------------------------------------
# Matches lines like:
#   21CS41   4   A+
#   21CS42   3   O
#   22MAT41  4   B+
#
# Subject code: alphanumeric, 5-10 chars
# Credits     : single digit 1-9
# Grade       : O | A+ | A | B+ | B | C | P | F   (case-insensitive)
_SUBJECT_PATTERN = re.compile(
    r"([A-Z0-9]{5,10})"                  # subject code
    r"\s+"                                # whitespace (possibly multi-line gaps)
    r"([1-9])"                            # credits
    r"\s+"
    r"(O|A\+|B\+|A|B|C|P|F)(?=\s|$)",   # grade – longer variants first, lookahead for separator
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

    for match in _SUBJECT_PATTERN.finditer(text):
        code = match.group(1).upper()
        credits = int(match.group(2))
        grade = _normalize_grade(match.group(3))

        # Deduplicate (same subject may appear more than once in some PDFs)
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
