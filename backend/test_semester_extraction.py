"""
Test semester extraction from VTU PDF text.
"""

from app.pdf_parser import _extract_semester

def test_semester_extraction():
    """Test various formats of semester information in VTU PDFs."""
    
    print("Testing Semester Extraction")
    print("=" * 70)
    
    test_cases = [
        # Format: (text_snippet, expected_semester, description)
        ("Semester: III", 3, "Roman numeral with colon"),
        ("Semester III", 3, "Roman numeral without colon"),
        ("Sem: 3", 3, "Digit with colon"),
        ("SEMESTER: IV", 4, "Uppercase roman"),
        ("semester: vi", 6, "Lowercase roman"),
        ("BCS301 BCS302 BCS303", 3, "Inferred from course codes"),
        ("BCS501 BCS502 BCS503", 5, "Inferred from semester 5 codes"),
        ("Semester: VII Results", 7, "Semester 7"),
        ("SEM VIII", 8, "Semester 8"),
        ("Contains BCS401 and BCS402", 4, "Semester 4 from codes"),
    ]
    
    print(f"\n{'Test Description':<40} {'Expected':<10} {'Actual':<10} {'Status'}")
    print("-" * 70)
    
    passed = 0
    failed = 0
    
    for text, expected, description in test_cases:
        try:
            actual = _extract_semester(text)
            status = "✓ PASS" if actual == expected else "✗ FAIL"
            if actual == expected:
                passed += 1
            else:
                failed += 1
            print(f"{description:<40} {expected:<10} {actual:<10} {status}")
        except ValueError as e:
            print(f"{description:<40} {expected:<10} {'ERROR':<10} ✗ FAIL")
            print(f"  Error: {e}")
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("✅ All semester extraction tests passed!")
        return True
    else:
        print("❌ Some tests failed!")
        return False


def test_error_cases():
    """Test that extraction fails appropriately for invalid inputs."""
    
    print("\n\nTesting Error Cases")
    print("=" * 70)
    
    test_cases = [
        "No semester information here",
        "Random text without course codes",
        "Semester: X",  # Invalid roman numeral
    ]
    
    print(f"\n{'Test Case':<50} {'Status'}")
    print("-" * 70)
    
    for text in test_cases:
        try:
            result = _extract_semester(text)
            print(f"{text[:50]:<50} ✗ FAIL (should have raised error)")
        except ValueError:
            print(f"{text[:50]:<50} ✓ PASS (correctly raised error)")
    
    print()


if __name__ == "__main__":
    success = test_semester_extraction()
    test_error_cases()
    
    if success:
        print("\n✅ Semester extraction is working correctly!")
    else:
        print("\n⚠️  Some tests need attention.")
