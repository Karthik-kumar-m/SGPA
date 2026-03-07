"""
Database migration script to add unique constraint on (user_id, semester).

WARNING: This will drop existing results table and recreate it.
Use this only in development. For production, use proper migrations (Alembic).
"""

from app.database import engine
from app.models import Base
from sqlalchemy import inspect, text

def migrate():
    """Apply database migrations."""
    print("Database Migration: Adding unique constraint to results table")
    print("=" * 70)
    
    inspector = inspect(engine)
    
    # Check if results table exists
    if 'results' in inspector.get_table_names():
        print("⚠️  Results table exists. Checking for existing data...")
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM results"))
            count = result.scalar()
            
            if count > 0:
                print(f"   Found {count} existing results.")
                response = input("   Do you want to drop and recreate the table? (yes/no): ")
                if response.lower() != 'yes':
                    print("Migration cancelled.")
                    return
        
        # Drop results table
        print("✓ Dropping results table...")
        Base.metadata.tables['results'].drop(engine)
    
    # Create all tables with new schema
    print("✓ Creating tables with new schema...")
    Base.metadata.create_all(bind=engine)
    
    print("\n✅ Migration complete!")
    print("   - Added unique constraint on (user_id, semester)")
    print("   - Results table recreated")


if __name__ == "__main__":
    migrate()
