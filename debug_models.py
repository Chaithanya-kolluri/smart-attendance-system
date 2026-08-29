from backend.app.database.database import Base
from backend.app.database.models import Student, FaceData, Attendance, Device
print("Models loaded successfully.")
print("Tables in metadata:", Base.metadata.tables.keys())
