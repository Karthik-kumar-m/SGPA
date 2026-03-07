# Quick Start Guide: Course Reference Database

## What Changed?

The SGPA calculator now uses a **PostgreSQL/SQLite database** to store course information instead of hardcoded values. This ensures:
- ✅ Accurate credits for all VTU 2022 scheme courses
- ✅ Proper handling of non-credit courses (Yoga, NSS, PE, IKS)
- ✅ Easy updates without code changes

## Key Course Credits (VTU 2022 Scheme)

### Semester 3 Highlights

| Course | Credits | Notes |
|--------|---------|-------|
| **BCS301** | **4** | Mathematics for Computer Science |
| **BCS302** | **4** | Digital Design & Organization |
| **BCS303** | **4** | Operating Systems |
| **BCS306A** | **3** | ESC/ETC/PLC (as requested) |
| BCS304 | 3 | Data Structures |
| BCSL305 | 1 | Data Structures Lab |
| BSCK307 | 1 | Social Connect |
| **BNSK/BPEK/BYOK359** | **0** | NSS/PE/Yoga (excluded from SGPA) |

**Total Credits (excluding non-credit):** 21

## Setup (One-Time)

```bash
cd /workspaces/SGPA/backend

# Initialize course database
python -m app.init_courses

# Expected output:
# ✓ Database tables created
# ✓ Added 98 courses to database
#   - Credit courses: 85
#   - Non-credit courses: 13
```

## How SGPA is Calculated

### Example Result:

| Course | Credits | Grade | Points | Included in SGPA? |
|--------|---------|-------|--------|-------------------|
| BCS301 | 4 | A+ | 9 | ✅ Yes |
| BCS302 | 4 | A | 8 | ✅ Yes |
| BCS303 | 4 | O | 10 | ✅ Yes |
| BCS304 | 3 | B+ | 7 | ✅ Yes |
| BCSL305 | 1 | A+ | 9 | ✅ Yes |
| BCS306A | 3 | A | 8 | ✅ Yes |
| BSCK307 | 1 | O | 10 | ✅ Yes |
| **BNSK359** | **0** | P | 4 | **❌ No (0 credits)** |

### Calculation:

```
Weighted Sum = (4×9) + (4×8) + (4×10) + (3×7) + (1×9) + (3×8) + (1×10)
             = 36 + 32 + 40 + 21 + 9 + 24 + 10
             = 172

Total Credits = 4 + 4 + 4 + 3 + 1 + 3 + 1 = 20
                (excludes 0-credit courses)

SGPA = 172 / 20 = 8.60
```

## Testing the Implementation

### Test 1: Check Course Credits

```bash
# BCS301 should have 4 credits
curl http://localhost:8000/api/courses/BCS301

# BCS306A should have 3 credits
curl http://localhost:8000/api/courses/BCS306A

# BNSK359 should have 0 credits
curl http://localhost:8000/api/courses/BNSK359
```

### Test 2: List Non-Credit Courses

```bash
# Should return 13 courses (NSS, PE, Yoga, IKS)
curl "http://localhost:8000/api/courses?credits=0"
```

### Test 3: Run Unit Tests

```bash
cd /workspaces/SGPA/backend

# Test SGPA calculation
python test_sgpa_calculation.py

# Test database lookups
python test_course_lookup.py
```

## API Usage

### Upload PDF and Calculate SGPA

```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@result.pdf"
```

**Response:**
```json
{
  "subjects": [
    {
      "subject_code": "BCS301",
      "credits": 4,
      "grade": "A+",
      "grade_points": 9
    },
    {
      "subject_code": "BNSK359",
      "credits": 0,
      "grade": "P",
      "grade_points": 4
    }
  ],
  "sgpa": 8.60,
  "total_credits": 20
}
```

Note: `total_credits` excludes 0-credit courses!

## Course Database Statistics

- **Total Courses:** 98
- **Credit Courses:** 85
- **Non-Credit Courses:** 13
  - NSS: 4 (semesters 3, 4, 5, 6)
  - Physical Education: 4 (semesters 3, 4, 5, 6)
  - Yoga: 4 (semesters 3, 4, 5, 6)
  - Indian Knowledge System: 1 (semester 6)

## Non-Credit Course Codes

These courses **appear in results** but are **excluded from SGPA**:

| Semester | NSS | Physical Education | Yoga | Other |
|----------|-----|-------------------|------|-------|
| 3 | BNSK359 | BPEK359 | BYOK359 | - |
| 4 | BNSK459 | BPEK459 | BYOK459 | - |
| 5 | BNSK559 | BPEK559 | BYOK559 | - |
| 6 | BNSK659 | BPEK659 | BYOK659 | BIKS609 |

## Troubleshooting

### "Course not found" errors

**Problem:** PDF contains course code not in database

**Solutions:**
1. Check if course code has typo in PDF
2. Add missing course to database:
   ```python
   from app.models import CourseReference
   from app.database import SessionLocal
   
   db = SessionLocal()
   new_course = CourseReference(
       course_code="NEWCODE",
       course_title="New Course",
       credits=3,
       semester=3,
       stream="CSE"
   )
   db.add(new_course)
   db.commit()
   ```
3. Fallback logic will assign default credits if DB lookup fails

### SGPA includes non-credit courses

**Problem:** Old calculation code not filtering 0-credit courses

**Solution:** Ensure using updated `_calculate_sgpa()` function:
```python
# Filter out non-credit courses
credit_subjects = [s for s in subjects if s["credits"] > 0]
```

### Wrong credits for BCS301/302/303/306A

**Fix:** Re-run initialization:
```bash
python -m app.init_courses
# Type 'yes' when prompted to clear and re-populate
```

## Summary

- ✅ **98 VTU courses** in database with accurate credits
- ✅ **BCS301, BCS302, BCS303** = 4 credits each
- ✅ **BCS306A** = 3 credits
- ✅ **Non-credit courses** (Yoga, NSS, PE, IKS) = 0 credits
- ✅ **SGPA calculation** automatically excludes 0-credit courses
- ✅ **All tests passing** (see test scripts)

📖 **Full documentation:** [COURSE_REFERENCE.md](COURSE_REFERENCE.md)
