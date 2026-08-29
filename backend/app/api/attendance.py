from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import joinedload
from datetime import datetime
from backend.app.database.database import get_db
from backend.app.database.models import Attendance, Student
from typing import List

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.get("/today")
async def get_todays_attendance(db: AsyncSession = Depends(get_db)):
    """Fetch attendance records for today."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    query = select(Attendance).options(joinedload(Attendance.student)).where(
        Attendance.check_in_time >= today_start
    ).order_by(desc(Attendance.check_in_time))

    result = await db.execute(query)
    attendance_records = result.scalars().all()

    # Return basic info - later we can add more student details
    return [
        {
            "id": rec.id,
            "student_name": rec.student.name if rec.student else "Unknown",
            "time": rec.check_in_time.isoformat(),
            "status": rec.status
        }
        for rec in attendance_records
    ]

@router.get("/stats")
async def get_attendance_stats(db: AsyncSession = Depends(get_db)):
    """Get attendance statistics for today."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Total students
    total_students_res = await db.execute(select(func.count(Student.id)))
    total_students = total_students_res.scalar()

    # Present today
    present_res = await db.execute(
        select(func.count(Attendance.id)).where(Attendance.check_in_time >= today_start)
    )
    present_count = present_res.scalar()

    return {
        "total_students": total_students,
        "present": present_count,
        "absent": total_students - present_count
    }
