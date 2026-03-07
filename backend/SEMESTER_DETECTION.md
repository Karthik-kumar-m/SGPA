# Automatic Semester Detection & Duplicate Prevention

## Overview

The SGPA calculator now **automatically extracts semester information** from VTU PDFs and **prevents duplicate semester entries** for each user. This eliminates manual semester selection and ensures data integrity.

## Key Changes

### ✅ What's New

1. **Automatic Semester Extraction** - Semester is detected from the PDF content
2. **No Duplicate Semesters** - Database constraint prevents duplicate (user_id, semester) records
3. **Auto-Update on Re-upload** - Re-uploading a PDF for the same semester updates the existing record
4. **New Upload Endpoint** - `/api/upload-and-save` for authenticated users (uploads & saves in one step)

---

## How Semester Extraction Works

### Detection Methods

The parser tries multiple strategies to detect the semester:

#### 1. Direct Text Matching
Looks for patterns like:
- `Semester: III` → 3
- `Sem: 5` → 5  
- `SEMESTER IV` → 4

Supports both **roman numerals** (I-VIII) and **digits** (1-8).

#### 2. Course Code Inference
If direct matching fails, infers from course codes:
- `BCS301` → Semester **3** (from the `3` in position 4)
- `BCS502` → Semester **5**
- `BCS701` → Semester **7**

Takes the most frequently occurring  semester digit from all course codes.

---

## API Changes

### Updated: `/api/upload`

**Now returns semester in the response:**

```json
{
  "subjects": [...],
  "sgpa": 8.60,
  "total_credits": 20,
  "semester": 3  ← NEW
}
```

### New: `/api/upload-and-save`

**Authenticated endpoint that uploads, parses, and saves automatically.**

**Authentication Required:** Bearer token via `/api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:8000/api/upload-and-save \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@result.pdf"
```

**Response:**
```json
{
  "id": 1,
  "user_id": 5,
  "semester": 3,
  "sgpa": 8.60,
  "total_credits": 20,
  "subjects": [...],
  "uploaded_at": "2026-03-07T10:30:00"
}
```

**Behavior:**
- If result for this semester exists → **Updates it**
- If result is new → **Creates it**
- No duplicates possible!

### Updated: `/api/save-result`

**Now handles upsert logic (update or insert).**

Instead of failing on duplicate semester, it now:
1. Checks if a result for `(user_id, semester)` exists
2. If yes → Updates the existing record
3. If no → Creates a new record

---

## Database Schema Changes

### Added Unique Constraint

```python
class Result(Base):
    __tablename__ = "results"
    __table_args__ = (
        UniqueConstraint('user_id', 'semester', name='unique_user_semester'),
    )
```

**Effect:** 
- One user can only have **one result per semester**
- Attempts to insert duplicates will fail at the database level
- Use upsert logic in routes to handle re-uploads gracefully

---

## Migration Guide

### 1. Run Database Migration

```bash
cd /workspaces/SGPA/backend
python migrate_db.py
```

**Note:** This will drop and recreate the `results` table. Existing data will be lost (development only).

For production, use proper migrations with Alembic.

### 2. Restart Backend

The backend will auto-reload if running with `--reload`, otherwise:

```bash
cd /workspaces/SGPA/backend
uvicorn app.main:app --reload
```

### 3. Update Frontend

**Remove manual semester selection** from the upload UI. The semester is now automatically detected.

**Option 1: Use existing `/api/upload` then `/api/save-result`**
```javascript
// Upload PDF
const parseResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { subjects, sgpa, total_credits, semester } = await parseResponse.json();

// Save to database
await fetch('/api/save-result', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id,
    semester,  // ← Automatically extracted
    sgpa,
    total_credits,
    subjects
  })
});
```

**Option 2: Use new `/api/upload-and-save` (recommended)**
```javascript
const response = await fetch('/api/upload-and-save', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// Done! Result is parsed and saved automatically
const result = await response.json();
```

---

## Testing

### Test Semester Extraction

```bash
cd /workspaces/SGPA/backend
python test_semester_extraction.py
```

**Expected output:**
```
✅ All semester extraction tests passed!
```

### Test Duplicate Prevention

1. Upload a semester 3 PDF → Creates result
2. Upload another semester 3 PDF → Updates existing result
3. Check database:
   ```bash
   sqlite3 sgpa_vault.db "SELECT * FROM results WHERE user_id=1;"
   ```
   Should show only **one entry per semester**.

---

## Error Handling

### No Semester Information

If PDF doesn't contain semester info:

```json
{
  "detail": "Could not determine semester from PDF. Please ensure the PDF contains semester information."
}
```

**Solution:** Ensure the PDF is a valid VTU result with semester mentioned.

### Duplicate Semester (Old Code)

With the old code, duplicate uploads caused:
```json
{
  "detail": "UNIQUE constraint failed: results.user_id, results.semester"
}
```

**Solution with new code:** Uses upsert logic → automatically updates instead of failing.

---

## Supported Semester Formats

### ✅ Recognized Patterns

| Format | Example | Extracted |
|--------|---------|-----------|
| Roman uppercase | `Semester: III` | 3 |
| Roman lowercase | `semester: iv` | 4 |
| Digit with colon | `Sem: 5` | 5 |
| Digit without colon | `SEMESTER 6` | 6 |
| Course codes | `BCS701 BCS702` | 7 |
| Mixed | `Semester VIII Results` | 8 |

### ❌ Not Supported

- Invalid roman numerals (e.g., `Semester: X`)
- Semesters > 8 or < 1
- Ambiguous or missing information

---

## Benefits

### For Users
- ✅ No need to manually select semester
- ✅ Can't accidentally upload to wrong semester
- ✅ Re-uploading updates existing result (no duplicates)

### For Developers
- ✅ Data integrity enforced at database level
- ✅ Simpler frontend (no semester dropdown)
- ✅ Automatic error prevention

### For Database
- ✅ Clean data (one result per user per semester)
- ✅ Foreign key integrity maintained
- ✅ Easy queries (no duplicate filtering needed)

---

## Example Workflows

### Workflow 1: First Time Upload

```
1. User uploads Semester 3 PDF
2. Parser extracts: subjects, SGPA, credits, semester=3
3. Backend checks: No result exists for (user_id=1, semester=3)
4. Backend creates new result
✅ Done
```

### Workflow 2: Re-upload Same Semester

```
1. User uploads another Semester 3 PDF (improved marks)
2. Parser extracts: subjects, SGPA, credits, semester=3
3. Backend checks: Result EXISTS for (user_id=1, semester=3)
4. Backend updates existing result with new data
✅ Done (no duplicate created!)
```

### Workflow 3: Upload Different Semester

```
1. User uploads Semester 4 PDF
2. Parser extracts: subjects, SGPA, credits, semester=4
3. Backend checks: No result exists for (user_id=1, semester=4)
4. Backend creates new result
✅ Both Semester 3 and 4 results exist
```

---

## Troubleshooting

### Issue: "Could not determine semester"

**Cause:** PDF doesn't have recognizable semester information.

**Solutions:**
1. Check if PDF is a valid VTU result
2. Look for "Semester" text in PDF
3. Check if course codes follow VTU pattern (e.g., BCS301)

### Issue: Frontend still shows semester dropdown

**Cause:** Frontend not updated to use automatic detection.

**Solution:** Remove semester selection UI and use the semester from API response.

### Issue: Multiple results for same semester

**Cause:** Old data created before migration.

**Solution:**
1. Run migration: `python migrate_db.py`
2. This adds the unique constraint
3. Old duplicates will be cleaned up

---

## Summary

**Before:**
- ❌ Users manually selected semester (error-prone)
- ❌ Duplicate semesters possible
- ❌ Database had no integrity checks

**After:**
- ✅ Semester automatically detected from PDF
- ✅ One result per user per semester (enforced)
- ✅ Re-uploads update existing data
- ✅ Cleaner, more reliable system

📖 **Related Documentation:**
- [COURSE_REFERENCE.md](COURSE_REFERENCE.md) - Course database details
- [QUICK_START.md](QUICK_START.md) - Setup guide
