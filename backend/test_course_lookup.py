"""
Test database course lookup functionality.
"""

from app.database import SessionLocal
from app.models import CourseReference
from app.pdf_parser import get_credits_from_db, _infer_credits

def test_course_lookup():
    """Test fetching credits from database."""
    db = SessionLocal()
    
    print("Testing Database Course Lookup")
    print("=" * 70)
    
    test_cases = [
        ("BCS301", 4, "Mathematics for Computer Science"),
        ("BCS302", 4, "Digital Design & Computer Organization"),
        ("BCS303", 4, "Operating Systems"),
        ("BCS306A", 3, "ESC/ETC/PLC"),
        ("BNSK359", 0, "NSS"),
        ("BPEK359", 0, "Physical Education"),
        ("BYOK359", 0, "Yoga"),
        ("BIKS609", 0, "Indian Knowledge System"),
    ]
    
    print(f"\n{'Course Code':<12} {'Expected':<10} {'Actual':<10} {'Status':<10} {'Title':<35}")
    print("-" * 70)
    
    all_passed = True
    
    for code, expected_credits, title in test_cases:
        # Test direct DB lookup
        actual_credits = get_credits_from_db(code, db)
        
        # Test through _infer_credits (which uses DB)
        inferred_credits = _infer_credits(code, db)
        
        status = "✓ PASS" if actual_credits == expected_credits else "✗ FAIL"
        if actual_credits != expected_credits:
            all_passed = False
        
        print(f"{code:<12} {expected_credits:<10} {actual_credits:<10} {status:<10} {title[:35]}")
    
    db.close()
    
    print("\n" + "=" * 70)
    if all_passed:
        print("✅ All database lookups passed!")
    else:
        print("❌ Some lookups failed!")
    
    return all_passed


def test_fallback_logic():
    """Test fallback pattern matching when course not in DB."""
    print("\n\nTesting Fallback Logic (without DB)")
    print("=" * 70)
    
    test_cases = [
        # Format: (course_code, expected_credits, description)
        ("UNKNOWN123", 3, "Unknown course defaults to 3"),
        ("TESTL456", 1, "Lab course (has L) = 1 credit"),
        ("TESTNSK789", 0, "NSS pattern = 0 credits"),
        ("TESTPEK999", 0, "Physical Education pattern = 0 credits"),
        ("TESTYOK111", 0, "Yoga pattern = 0 credits"),
    ]
    
    print(f"\n{'Course Code':<15} {'Expected':<10} {'Actual':<10} {'Status':<10} {'Description':<30}")
    print("-" * 70)
    
    all_passed = True
    
    for code, expected_credits, description in test_cases:
        # Test without DB (fallback mode)
        actual_credits = _infer_credits(code, db=None)
        
        status = "✓ PASS" if actual_credits == expected_credits else "✗ FAIL"
        if actual_credits != expected_credits:
            all_passed = False
        
        print(f"{code:<15} {expected_credits:<10} {actual_credits:<10} {status:<10} {description[:30]}")
    
    print("\n" + "=" * 70)
    if all_passed:
        print("✅ All fallback tests passed!")
    else:
        print("❌ Some fallback tests failed!")
    
    return all_passed


if __name__ == "__main__":
    # Run tests
    db_passed = test_course_lookup()
    fallback_passed = test_fallback_logic()
    
    print("\n\n" + "=" * 70)
    print("FINAL RESULTS")
    print("=" * 70)
    print(f"Database Lookup Tests: {'✅ PASSED' if db_passed else '❌ FAILED'}")
    print(f"Fallback Logic Tests: {'✅ PASSED' if fallback_passed else '❌ FAILED'}")
    
    if db_passed and fallback_passed:
        print("\n🎉 All integration tests passed!")
        exit(0)
    else:
        print("\n❌ Some tests failed!")
        exit(1)
