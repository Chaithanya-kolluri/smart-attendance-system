import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class Student(Base):
    __tablename__ = "students"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    class_name = Column(String)
    section = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    face_data = relationship("FaceData", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")

class FaceData(Base):
    __tablename__ = "face_data"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    # Storing embedding as binary (numpy array bytes)
    embedding = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="face_data")

class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    attendance_date = Column(DateTime, nullable=False) # Only date part matters
    check_in_time = Column(DateTime, nullable=False)
    status = Column(String, default="present")
    device_id = Column(String, ForeignKey("devices.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="attendance")
    device = relationship("Device", back_populates="attendance")

class Device(Base):
    __tablename__ = "devices"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, index=True) # Device ID
    location = Column(String)
    active = Column(Boolean, default=True)

    attendance = relationship("Attendance", back_populates="device")
