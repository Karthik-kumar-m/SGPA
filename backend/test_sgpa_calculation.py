"""
Test script to verify SGPA calculation excludes non-credit courses.
"""

from app.pdf_parser import _calculate_sgpa

# Test case: Semester with mix of credit and non-credit courses
test_subjects = [
    # Credit courses
    {"subject_code": "BCS301", "credits": 4, "grade": "A+", "grade_points": 9},
    {"subject_code": "BCS302", "credits": 4, "grade": "A", "grade_points": 8},
    {"subject_code": "BCS303", "credits": 4, "grade": "O", "grade_points": 10},
    {"subject_code": "BCS304", "credits": 3, "grade": "B+", "grade_points": 7},
    {"subject_code": "BCSL305", "credits": 1, "grade": "A+", "grade_points": 9},
    {"subject_code": "BCS306A", "credits": 3, "grade": "A", "grade_points": 8},
    {"subject_code": "BSCK307", "credits": 1, "grade": "O", "grade_points": 10},
    
    # Non-credit courses (should be excluded)
    {"subject_code": "BNSK359", "credits": 0, "grade": "P", "grade_points": 4},
    {"subject_code": "BPEK359", "credits": 0, "grade": "P", "grade_points": 4},
    {"subject_code": "BYOK359", "credits": 0, "grade": "P", "grade_points": 4},
]

print("Testing SGPA Calculation")
print("=" * 60)
print("\nSubjects:")
print(f"{'Code':<12} {'Credits':<10} {'Grade':<8} {'Points':<8}")
print("-" * 60)

for subject in test_subjects:
    print(f"{subject['subject_code']:<12} {subject['credits']:<10} "
          f"{subject['grade']:<8} {subject['grade_points']:<8}")

sgpa, total_credits = _calculate_sgpa(test_subjects)

print("\n" + "=" * 60)
print(f"Total Credits (excluding 0-credit courses): {total_credits}")
print(f"Calculated SGPA: {sgpa}")
print("=" * 60)

# Manual verification
credit_courses = [s for s in test_subjects if s["credits"] > 0]
manual_weighted_sum = sum(s["credits"] * s["grade_points"] for s in credit_courses)
manual_total_credits = sum(s["credits"] for s in credit_courses)
manual_sgpa = round(manual_weighted_sum / manual_total_credits, 2)

print("\nManual Verification:")
print(f"Weighted Sum: {manual_weighted_sum}")
print(f"Total Credits: {manual_total_credits}")
print(f"SGPA: {manual_sgpa}")

print("\n✓ Non-credit courses excluded from calculation" if sgpa == manual_sgpa else "\n✗ Error in calculation")

# Expected values based on VTU requirements
expected_credits = 20  # 4+4+4+3+1+3+1 (excluding 0-credit courses)
assert total_credits == expected_credits, f"Expected {expected_credits} credits, got {total_credits}"
assert sgpa == manual_sgpa, f"SGPA mismatch: {sgpa} != {manual_sgpa}"

print("\n✅ All tests passed!")
