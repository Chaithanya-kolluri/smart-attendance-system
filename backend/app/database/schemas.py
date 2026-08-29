from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    student_id: str
    name: str
    class_name: Optional[str] = None
    section: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    student_id: int
    status: str = "present"
    device_id: Optional[str] = None

class Attendance(AttendanceBase):
    id: int
    attendance_date: datetime
    check_in_time: datetime
    created_at: datetime

    class Config:
        from_attributes = True
