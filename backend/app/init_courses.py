"""
Initialize course_reference table with VTU 2022 scheme courses.
Run this script once to populate the database with course data.
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, CourseReference


# VTU 2022 Scheme Course Data
COURSES = [
    # First Year - Semester I (Physics Group)
    {"course_code": "BMATS101", "course_title": "Mathematics-I for CSE Stream", "credits": 4, "semester": 1, "stream": "Physics"},
    {"course_code": "BPHYS102", "course_title": "Applied Physics for CSE Stream", "credits": 4, "semester": 1, "stream": "Physics"},
    {"course_code": "BPOPS103", "course_title": "Principles of Programming Using C", "credits": 3, "semester": 1, "stream": "Physics"},
    {"course_code": "BESCK104", "course_title": "Engineering Science Course-I", "credits": 3, "semester": 1, "stream": "Physics"},
    {"course_code": "BETCK105", "course_title": "ETC-I", "credits": 3, "semester": 1, "stream": "Physics"},
    {"course_code": "BPLCK105", "course_title": "PLC-I", "credits": 3, "semester": 1, "stream": "Physics"},
    {"course_code": "BENGK106", "course_title": "Communicative English", "credits": 1, "semester": 1, "stream": "Physics"},
    {"course_code": "BPWSK106", "course_title": "Professional English", "credits": 1, "semester": 1, "stream": "Physics"},
    {"course_code": "BKSKK107", "course_title": "Samskrutika Kannada", "credits": 1, "semester": 1, "stream": "Physics"},
    {"course_code": "BKBKK107", "course_title": "Balake Kannada", "credits": 1, "semester": 1, "stream": "Physics"},
    {"course_code": "BSFHK158", "course_title": "Health", "credits": 1, "semester": 1, "stream": "Physics"},
    {"course_code": "BIDTK158", "course_title": "Design Thinking", "credits": 1, "semester": 1, "stream": "Physics"},
    
    # First Year - Semester II (Chemistry Group)
    {"course_code": "BMATS201", "course_title": "Mathematics-II for CSE Stream", "credits": 4, "semester": 2, "stream": "Chem"},
    {"course_code": "BPHYS202", "course_title": "Applied Physics (for Chem group students)", "credits": 4, "semester": 2, "stream": "Chem"},
    {"course_code": "BPOPS203", "course_title": "Principles of Programming Using C", "credits": 3, "semester": 2, "stream": "Chem"},
    {"course_code": "BESCK204", "course_title": "Engineering Science Course-II", "credits": 3, "semester": 2, "stream": "Chem"},
    {"course_code": "BETCK205", "course_title": "ETC-II", "credits": 3, "semester": 2, "stream": "Chem"},
    {"course_code": "BPLCK205", "course_title": "PLC-II", "credits": 3, "semester": 2, "stream": "Chem"},
    {"course_code": "BENGK206", "course_title": "English Courses", "credits": 1, "semester": 2, "stream": "Chem"},
    {"course_code": "BPWSK206", "course_title": "Professional English", "credits": 1, "semester": 2, "stream": "Chem"},
    {"course_code": "BKSKK207", "course_title": "Kannada Courses", "credits": 1, "semester": 2, "stream": "Chem"},
    {"course_code": "BKBKK207", "course_title": "Balake Kannada", "credits": 1, "semester": 2, "stream": "Chem"},
    {"course_code": "BSFHK258", "course_title": "Health", "credits": 1, "semester": 2, "stream": "Chem"},
    {"course_code": "BIDTK258", "course_title": "Design Thinking", "credits": 1, "semester": 2, "stream": "Chem"},
    
    # Second Year - Semester III
    {"course_code": "BCS301", "course_title": "Mathematics for Computer Science", "credits": 4, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS302", "course_title": "Digital Design & Computer Organization", "credits": 4, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS303", "course_title": "Operating Systems", "credits": 4, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS304", "course_title": "Data Structures and Applications", "credits": 3, "semester": 3, "stream": "CSE"},
    {"course_code": "BCSL305", "course_title": "Data Structures Lab", "credits": 1, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS306A", "course_title": "ESC/ETC/PLC", "credits": 3, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS306B", "course_title": "ESC/ETC/PLC", "credits": 3, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS306C", "course_title": "ESC/ETC/PLC", "credits": 3, "semester": 3, "stream": "CSE"},
    {"course_code": "BSCK307", "course_title": "Social Connect and Responsibility", "credits": 1, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS358A", "course_title": "AEC/SEC-III", "credits": 1, "semester": 3, "stream": "CSE"},
    {"course_code": "BCS358B", "course_title": "AEC/SEC-III", "credits": 1, "semester": 3, "stream": "CSE"},
    
    # Mandatory Non-Credit Courses - Semester III
    {"course_code": "BNSK359", "course_title": "NSS", "credits": 0, "semester": 3, "stream": "CSE"},
    {"course_code": "BPEK359", "course_title": "Physical Education", "credits": 0, "semester": 3, "stream": "CSE"},
    {"course_code": "BYOK359", "course_title": "Yoga", "credits": 0, "semester": 3, "stream": "CSE"},
    
    # Second Year - Semester IV
    {"course_code": "BCS401", "course_title": "Analysis & Design of Algorithms", "credits": 3, "semester": 4, "stream": "CSE"},
    {"course_code": "BCS402", "course_title": "Microcontrollers", "credits": 4, "semester": 4, "stream": "CSE"},
    {"course_code": "BCS403", "course_title": "Database Management Systems", "credits": 4, "semester": 4, "stream": "CSE"},
    {"course_code": "BCSL404", "course_title": "Analysis & Design of Algorithms Lab", "credits": 1, "semester": 4, "stream": "CSE"},
    {"course_code": "BCS405A", "course_title": "ESC/ETC/PLC", "credits": 3, "semester": 4, "stream": "CSE"},
    {"course_code": "BCS405B", "course_title": "ESC/ETC/PLC", "credits": 3, "semester": 4, "stream": "CSE"},
    {"course_code": "BCS405C", "course_title": "ESC/ETC/PLC", "credits": 3, "semester": 4, "stream": "CSE"},
    {"course_code": "BCS456A", "course_title": "AEC/SEC-IV", "credits": 1, "semester": 4, "stream": "CSE"},
    {"course_code": "BCS456B", "course_title": "AEC/SEC-IV", "credits": 1, "semester": 4, "stream": "CSE"},
    {"course_code": "BBOC407", "course_title": "Biology for Computer Engineers", "credits": 2, "semester": 4, "stream": "CSE"},
    {"course_code": "BUHK408", "course_title": "Universal Human Values", "credits": 1, "semester": 4, "stream": "CSE"},
    
    # Mandatory Non-Credit Courses - Semester IV
    {"course_code": "BNSK459", "course_title": "NSS", "credits": 0, "semester": 4, "stream": "CSE"},
    {"course_code": "BPEK459", "course_title": "Physical Education", "credits": 0, "semester": 4, "stream": "CSE"},
    {"course_code": "BYOK459", "course_title": "Yoga", "credits": 0, "semester": 4, "stream": "CSE"},
    
    # Third Year - Semester V
    {"course_code": "BCS501", "course_title": "Software Engineering & Project Mgmt", "credits": 3, "semester": 5, "stream": "CSE"},
    {"course_code": "BCS502", "course_title": "Computer Networks", "credits": 4, "semester": 5, "stream": "CSE"},
    {"course_code": "BCS503", "course_title": "Theory of Computation", "credits": 4, "semester": 5, "stream": "CSE"},
    {"course_code": "BCSL504", "course_title": "Web Technology Lab", "credits": 1, "semester": 5, "stream": "CSE"},
    {"course_code": "BCS515A", "course_title": "Professional Elective Course", "credits": 3, "semester": 5, "stream": "CSE"},
    {"course_code": "BCS515B", "course_title": "Professional Elective Course", "credits": 3, "semester": 5, "stream": "CSE"},
    {"course_code": "BCS515C", "course_title": "Professional Elective Course", "credits": 3, "semester": 5, "stream": "CSE"},
    {"course_code": "BCS586", "course_title": "Mini Project", "credits": 2, "semester": 5, "stream": "CSE"},
    {"course_code": "BRMK557", "course_title": "Research Methodology and IPR", "credits": 3, "semester": 5, "stream": "CSE"},
    {"course_code": "BCS508", "course_title": "Environmental Studies & E-waste", "credits": 2, "semester": 5, "stream": "CSE"},
    
    # Mandatory Non-Credit Courses - Semester V
    {"course_code": "BNSK559", "course_title": "NSS", "credits": 0, "semester": 5, "stream": "CSE"},
    {"course_code": "BPEK559", "course_title": "Physical Education", "credits": 0, "semester": 5, "stream": "CSE"},
    {"course_code": "BYOK559", "course_title": "Yoga", "credits": 0, "semester": 5, "stream": "CSE"},
    
    # Third Year - Semester VI
    {"course_code": "BCS601", "course_title": "Cloud Computing", "credits": 4, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS602", "course_title": "Machine Learning", "credits": 4, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS613A", "course_title": "Professional Elective Course", "credits": 3, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS613B", "course_title": "Professional Elective Course", "credits": 3, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS613C", "course_title": "Professional Elective Course", "credits": 3, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS654A", "course_title": "Open Elective Course", "credits": 3, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS654B", "course_title": "Open Elective Course", "credits": 3, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS654C", "course_title": "Open Elective Course", "credits": 3, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS685", "course_title": "Project Phase I", "credits": 2, "semester": 6, "stream": "CSE"},
    {"course_code": "BCSL606", "course_title": "Machine Learning Lab", "credits": 1, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS657A", "course_title": "AEC/SDC V", "credits": 1, "semester": 6, "stream": "CSE"},
    {"course_code": "BCS657B", "course_title": "AEC/SDC V", "credits": 1, "semester": 6, "stream": "CSE"},
    
    # Mandatory Non-Credit Courses - Semester VI
    {"course_code": "BNSK659", "course_title": "NSS", "credits": 0, "semester": 6, "stream": "CSE"},
    {"course_code": "BPEK659", "course_title": "Physical Education", "credits": 0, "semester": 6, "stream": "CSE"},
    {"course_code": "BYOK659", "course_title": "Yoga", "credits": 0, "semester": 6, "stream": "CSE"},
    {"course_code": "BIKS609", "course_title": "Indian Knowledge System", "credits": 0, "semester": 6, "stream": "CSE"},
    
    # Fourth Year - Semester VII
    {"course_code": "BCS701", "course_title": "Internet of Things", "credits": 4, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS702", "course_title": "Parallel Computing", "credits": 4, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS703", "course_title": "Cryptography & Network Security", "credits": 4, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS714A", "course_title": "Professional Elective Course", "credits": 3, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS714B", "course_title": "Professional Elective Course", "credits": 3, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS714C", "course_title": "Professional Elective Course", "credits": 3, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS755A", "course_title": "Open Elective Course", "credits": 3, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS755B", "course_title": "Open Elective Course", "credits": 3, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS755C", "course_title": "Open Elective Course", "credits": 3, "semester": 7, "stream": "CSE"},
    {"course_code": "BCS786", "course_title": "Major Project Phase-II", "credits": 6, "semester": 7, "stream": "CSE"},
    
    # Fourth Year - Semester VIII
    {"course_code": "BCS801A", "course_title": "Professional Elective (Online)", "credits": 3, "semester": 8, "stream": "CSE"},
    {"course_code": "BCS801B", "course_title": "Professional Elective (Online)", "credits": 3, "semester": 8, "stream": "CSE"},
    {"course_code": "BCS801C", "course_title": "Professional Elective (Online)", "credits": 3, "semester": 8, "stream": "CSE"},
    {"course_code": "BCS802A", "course_title": "Open Elective (Online)", "credits": 3, "semester": 8, "stream": "CSE"},
    {"course_code": "BCS802B", "course_title": "Open Elective (Online)", "credits": 3, "semester": 8, "stream": "CSE"},
    {"course_code": "BCS802C", "course_title": "Open Elective (Online)", "credits": 3, "semester": 8, "stream": "CSE"},
    {"course_code": "BCS803", "course_title": "Internship (Industry/Research)", "credits": 10, "semester": 8, "stream": "CSE"},
]


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")


def populate_courses(db: Session):
    """Populate course_reference table with VTU 2022 scheme courses."""
    # Check if courses already exist
    existing_count = db.query(CourseReference).count()
    if existing_count > 0:
        print(f"⚠ Course reference table already has {existing_count} entries.")
        response = input("Do you want to clear and re-populate? (yes/no): ")
        if response.lower() != 'yes':
            print("Skipping course population.")
            return
        
        # Clear existing courses
        db.query(CourseReference).delete()
        db.commit()
        print("✓ Cleared existing courses")
    
    # Add all courses
    for course_data in COURSES:
        course = CourseReference(**course_data)
        db.add(course)
    
    db.commit()
    print(f"✓ Added {len(COURSES)} courses to database")
    
    # Print summary
    credit_courses = db.query(CourseReference).filter(CourseReference.credits > 0).count()
    non_credit_courses = db.query(CourseReference).filter(CourseReference.credits == 0).count()
    print(f"  - Credit courses: {credit_courses}")
    print(f"  - Non-credit courses (Yoga/NSS/PE/IKS): {non_credit_courses}")


def main():
    """Main initialization function."""
    print("VTU 2022 Scheme Course Database Initialization")
    print("=" * 50)
    
    # Create tables
    init_db()
    
    # Populate courses
    db = SessionLocal()
    try:
        populate_courses(db)
    finally:
        db.close()
    
    print("\n✓ Initialization complete!")


if __name__ == "__main__":
    main()
