import logging
import sys
import asyncio
from pathlib import Path

# Fix path to import backend and other project modules
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).parent.parent)) # Add root to pick up camera/recognition

import cv2
from camera.webcam import WebcamCamera
from recognition.detector import FaceDetector
from recognition.encoder import FaceEncoder
from recognition.matcher import FaceMatcher, RecognitionTracker
from recognition.storage import FaceStorage
from backend.app.database.database import AsyncSessionLocal
from backend.app.services.attendance import AttendanceService
from backend.app.config import settings
from backend.app.database.models import Student
from sqlalchemy import select

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s")
logger = logging.getLogger("attendance_app")

async def run_attendance_loop():
    logger.info("Starting production attendance loop...")

    # Initialize Recognition components
    camera = WebcamCamera(device_index=0, width=640, height=480)
    detector = FaceDetector()
    encoder = FaceEncoder()
    storage = FaceStorage()
    matcher = FaceMatcher(storage, encoder)
    tracker = RecognitionTracker()

    if not camera.start():
        logger.error("Failed to start camera")
        return

    # Use a database session to mark attendance
    async with AsyncSessionLocal() as db:
        attendance_service = AttendanceService(db)

        try:
            while True:
                frame = camera.read()
                if frame is None:
                    continue

                faces = detector.detect(frame)
                matches = matcher.match_multiple(frame, faces)
                confirmed_matches = tracker.update(matches)

                # Process confirmed matches
                for match in confirmed_matches:
                    if match:
                        # Log attendance to database (async call)
                        try:
                            # QUERY: Find student in DB using student_id
                            query = select(Student).where(Student.student_id == match.student_id)
                            result = await db.execute(query)
                            student = result.scalars().first()

                            if student:
                                await attendance_service.mark_attendance(
                                    student_id=student.id,
                                    device_id=settings.device_id
                                )
                                logger.info(f"Attendance recorded for {match.name}")
                            else:
                                logger.error(f"Student {match.name} (SID: {match.student_id}) not found in DB!")
                        except Exception as e:
                            logger.error(f"Failed to record attendance for {match.name}: {e}")

                # Display simple UI
                cv2.imshow("Smart Attendance - Live", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        finally:
            camera.stop()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    # Ensure nested async call works correctly
    asyncio.run(run_attendance_loop())
