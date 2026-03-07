# VTU Course Reference Database

## Overview

The SGPA calculator now uses a PostgreSQL/SQLite `course_reference` table to store official VTU 2022 scheme course data. This ensures accurate credit calculations and proper handling of non-credit mandatory courses like Yoga, NSS, Physical Education, and Indian Knowledge System.

## Features

✅ **98 VTU 2022 Scheme Courses** - All courses from semesters 1-8  
✅ **Accurate Credits** - Credits fetched from database instead of hardcoded values  
✅ **Non-Credit Course Handling** - Yoga, NSS, PE, and IKS courses marked with 0 credits  
✅ **SGPA Calculation** - Automatically excludes 0-credit courses from SGPA computation  
✅ **Flexible Lookup** - Fallback to pattern matching if course not in database  

## Database Schema

### CourseReference Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key |
| `course_code` | String(20) | Unique course code (e.g., "BCS301") |
| `course_title` | String(200) | Full course name |
| `credits` | Integer | Number of credits (0 for non-credit courses) |
| `semester` | Integer | Semester number (1-8) |
| `stream` | String(50) | Stream/group (Physics, Chem, CSE) |

## Setup Instructions

### 1. Initialize the Database

Run the initialization script to create tables and populate course data:

```bash
cd /workspaces/SGPA/backend
python -m app.init_courses
```

Expected output:
```
VTU 2022 Scheme Course Database Initialization
==================================================
✓ Database tables created
✓ Added 98 courses to database
  - Credit courses: 85
  - Non-credit courses (Yoga/NSS/PE/IKS): 13
✓ Initialization complete!
```

### 2. Configure Database (Optional)

The system works with both SQLite (default) and PostgreSQL.

**For SQLite (default):**
```env
DATABASE_URL=sqlite:///./sgpa_vault.db
```

**For PostgreSQL:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/sgpa_vault
```

## API Endpoints

### Get Course Information

**GET** `/api/courses/{course_code}`

Retrieve details for a specific course.

**Example:**
```bash
curl http://localhost:8000/api/courses/BCS301
```

**Response:**
```json
{
    "course_code": "BCS301",
    "course_title": "Mathematics for Computer Science",
    "credits": 4,
    "semester": 3,
    "stream": "CSE"
}
```

### List Courses

**GET** `/api/courses?semester={sem}&credits={credits}&limit={limit}`

List courses with optional filters.

**Parameters:**
- `semester` (optional): Filter by semester (1-8)
- `credits` (optional): Filter by credits (0, 1, 2, 3, 4, etc.)
- `limit` (optional): Maximum results (default: 100)

**Examples:**

List all non-credit courses:
```bash
curl "http://localhost:8000/api/courses?credits=0"
```

List semester 3 courses:
```bash
curl "http://localhost:8000/api/courses?semester=3"
```

## How It Works

### 1. PDF Upload & Parsing

When a VTU result PDF is uploaded via `/api/upload`:

1. The parser extracts course codes and grades from the PDF
2. For each course code, the system queries the `course_reference` table
3. Credits are fetched from the database (not hardcoded)
4. If a course is not found, fallback pattern matching is used

### 2. SGPA Calculation

The `_calculate_sgpa()` function:

1. **Filters** out courses with `credits = 0` (Yoga, NSS, PE, IKS)
2. **Computes** weighted sum: `Σ(credits × grade_points)`
3. **Divides** by total credits to get SGPA
4. **Rounds** to 2 decimal places

**Example Calculation:**

Given these results:
- BCS301 (4 credits): A+ (9 points)
- BCS302 (4 credits): A (8 points)
- BCS303 (4 credits): O (10 points)
- BCS304 (3 credits): B+ (7 points)
- BNSK359 (0 credits): P - **Excluded from SGPA**

```
Weighted Sum = (4×9) + (4×8) + (4×10) + (3×7) = 36 + 32 + 40 + 21 = 129
Total Credits = 4 + 4 + 4 + 3 = 15  (excludes 0-credit courses)
SGPA = 129 / 15 = 8.60
```

### 3. Fallback Logic

If a course is not in the database, the system uses pattern matching:

| Pattern | Credits | Examples |
|---------|---------|----------|
| NSS/NSK/PEK/YOK/YOGA/BIKS | 0 | BNSK359, BYOK459 |
| Contains 'L' in code | 1 | BCSL305, BCSL404 |
| BSCK prefix | 1 | BSCK307 |
| Contains 358/456/657 | 1 | BCS358A, BCS456B |
| Contains 586 | 2 | BCS586 |
| Contains 786 | 6 | BCS786 |
| Contains 803 | 10 | BCS803 |
| Default (theory) | 3 | Most courses |

## VTU 2022 Scheme Credit Distribution

### Semester 3 (Total: 21 credits)

| Course Code | Credits | Course Title |
|-------------|---------|--------------|
| BCS301 | 4 | Mathematics for Computer Science |
| BCS302 | 4 | Digital Design & Computer Organization |
| BCS303 | 4 | Operating Systems |
| BCS304 | 3 | Data Structures and Applications |
| BCSL305 | 1 | Data Structures Lab |
| BCS306A/B/C | 3 | ESC/ETC/PLC |
| BSCK307 | 1 | Social Connect and Responsibility |
| BCS358A/B | 1 | AEC/SEC-III |
| BNSK/BPEK/BYOK359 | 0 | NSS/PE/Yoga (non-credit) |

### Mandatory Non-Credit Courses

These courses **must appear** in the database but are **excluded** from SGPA:

**Semesters 3, 4, 5, 6:**
- BNSK{sem}59 - NSS
- BPEK{sem}59 - Physical Education
- BYOK{sem}59 - Yoga

**Semester 6 only:**
- BIKS609 - Indian Knowledge System

## Code Integration

### Parser Function Signature

```python
from sqlalchemy.orm import Session

def parse_vtu_pdf(
    file_bytes: bytes, 
    db: Optional[Session] = None
) -> tuple[list[dict], float, int]:
    """
    Parse VTU PDF and calculate SGPA using database credits.
    
    Args:
        file_bytes: PDF file content
        db: Database session (required for DB credit lookup)
        
    Returns:
        (subjects_list, sgpa, total_credits)
    """
```

### Usage in Routes

```python
from app.pdf_parser import parse_vtu_pdf

@router.post("/upload")
async def upload_result(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    subjects, sgpa, total_credits = parse_vtu_pdf(file_bytes, db)
    
    # subjects will have accurate credits from DB
    # SGPA excludes 0-credit courses automatically
    ...
```

### Database Credit Lookup

```python
from app.models import CourseReference

def get_credits_from_db(course_code: str, db: Session) -> Optional[int]:
    """Fetch credits from course_reference table"""
    course = db.query(CourseReference).filter(
        CourseReference.course_code == course_code.upper()
    ).first()
    
    return course.credits if course else None
```

## Testing

### Test Course Lookup

```bash
# Check a specific course
curl http://localhost:8000/api/courses/BCS301

# List non-credit courses
curl "http://localhost:8000/api/courses?credits=0"

# List semester 3 courses
curl "http://localhost:8000/api/courses?semester=3"
```

### Test PDF Upload

The `/api/upload` endpoint now:
1. Extracts course codes from PDF
2. Fetches credits from database
3. Excludes 0-credit courses from SGPA
4. Returns accurate SGPA calculation

## Migration Notes

### From Hardcoded Credits

**Before:**
- Credits were hardcoded in `_CREDIT_OVERRIDES` dictionary
- Required code changes to update credits

**After:**
- Credits stored in database
- Update via SQL or re-run initialization script
- No code changes needed for credit updates

### Re-initializing Courses

To update course data:

```bash
cd /workspaces/SGPA/backend
python -m app.init_courses
```

The script will ask:
```
⚠ Course reference table already has 98 entries.
Do you want to clear and re-populate? (yes/no):
```

Type `yes` to refresh all course data.

## Troubleshooting

### Issue: "Course not found" errors

**Solution:** Run initialization script to populate the database.

### Issue: SGPA includes Yoga/NSS credits

**Cause:** Old code not filtering 0-credit courses.  
**Solution:** Ensure you're using the updated `_calculate_sgpa()` function that filters `credits > 0`.

### Issue: Wrong credits for BCS301/302/303

**Expected:** All have 4 credits each  
**Solution:** Verify database has correct values:
```bash
curl http://localhost:8000/api/courses/BCS301
curl http://localhost:8000/api/courses/BCS302
curl http://localhost:8000/api/courses/BCS303
```

## Summary

✅ **Database-driven credits** - No more hardcoded values  
✅ **VTU 2022 compliance** - All courses accurately represented  
✅ **Non-credit handling** - Yoga/NSS/PE/IKS properly excluded  
✅ **Easy updates** - Change credits via database, not code  
✅ **Backward compatible** - Fallback logic for unknown courses
