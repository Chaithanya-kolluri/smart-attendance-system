import asyncio
import os
import sys
from pathlib import Path

# Fix path to import backend
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from sqlalchemy import select
from app.database.database import AsyncSessionLocal
from app.database.models import Student
from app.services.attendance import AttendanceService

async def run_test():
    async with AsyncSessionLocal() as db:
        # 1. Create a dummy student
        student = Student(student_id="TEST001", name="Test Student")
        db.add(student)
        await db.commit()
        await db.refresh(student)
        print(f"Created student: {student.name} with ID: {student.id}")

        # 2. Test attendance
        service = AttendanceService(db)
        print("Marking attendance...")
        result = await service.mark_attendance(student.id, "test-device")

        if result:
            print(f"Attendance marked successfully! Record ID: {result.id}")

            # Test duplicate protection
            print("Attempting duplicate attendance...")
            duplicate = await service.mark_attendance(student.id, "test-device")
            if duplicate is None:
                print("Duplicate attendance correctly ignored.")
            else:
                print("Error: Duplicate attendance was NOT ignored!")
        else:
            print("Failed to mark attendance.")

if __name__ == "__main__":
    asyncio.run(run_test())
