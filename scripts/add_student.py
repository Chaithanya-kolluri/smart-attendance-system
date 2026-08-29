
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database.models import Student

# Database configuration
DATABASE_URL = 'postgresql+psycopg2://postgres:postgres@localhost:5432/smart_attendance'

# Connect to the database
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

# Add the student
try:
    new_student = Student(student_id="8350324", name="Kolluri Chaithanya")
    session.add(new_student)
    session.commit()
    print("Student 'Kolluri Chaithanya' added successfully to the database.")
except Exception as e:
    print(f"Error adding student: {e}")
    session.rollback()
finally:
    session.close()
