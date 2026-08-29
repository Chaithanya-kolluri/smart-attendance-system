import logging
from datetime import datetime, timedelta
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.models import Attendance, Student
from backend.app.config import settings
from backend.app.websocket.manager import manager

logger = logging.getLogger(__name__)

class AttendanceService:
    """Handles attendance business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def mark_attendance(self, student_id: int, device_id: str) -> Optional[Attendance]:
        """Marks attendance for a student, handling duplicates and cooldowns."""

        # 1. Get today's start
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        # 2. Check for existing attendance today
        query = select(Attendance).where(
            and_(
                Attendance.student_id == student_id,
                Attendance.check_in_time >= today_start
            )
        ).order_by(Attendance.check_in_time.desc())

        result = await self.db.execute(query)
        last_attendance = result.scalars().first()

        # 3. Check for duplicates/cooldown
        if last_attendance:
            time_since_last = datetime.utcnow() - last_attendance.check_in_time
            if time_since_last.total_seconds() < settings.attendance_cooldown_seconds:
                logger.info(f"Attendance cooldown active for student {student_id}. Ignoring.")
                return None
            else:
                # If cooldown passed, maybe we want to allow re-entry or just ignore?
                # The requirements imply preventing *accidental* duplicate attendance.
                # Assuming one entry per day is sufficient.
                logger.info(f"Student {student_id} already marked present today. Ignoring.")
                return None

        # 4. Mark attendance
        new_attendance = Attendance(
            student_id=student_id,
            attendance_date=today_start,
            check_in_time=datetime.utcnow(),
            status="present",
            device_id=device_id
        )

        self.db.add(new_attendance)
        await self.db.commit()
        await self.db.refresh(new_attendance)

        # Broadcast attendance event
        await manager.broadcast({
            "type": "attendance_marked",
            "id": new_attendance.id,
            "student_id": student_id,
            "student_name": new_attendance.student.name if new_attendance.student else "Unknown",
            "time": new_attendance.check_in_time.isoformat(),
            "status": new_attendance.status
        })

        logger.info(f"Attendance marked for student {student_id} on device {device_id}")
        return new_attendance

# Required for type hinting
from typing import Optional
