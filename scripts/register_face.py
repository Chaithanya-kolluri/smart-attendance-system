"""Face registration script.

Interactive script to register new people into the system.
Captures multiple face samples and generates embeddings.
"""

import logging
import sys
import uuid
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import cv2

from camera.webcam import WebcamCamera
from recognition.detector import FaceDetector
from recognition.encoder import FaceEncoder
from recognition.storage import FaceStorage, Person

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def register_person():
    """Run the face registration workflow."""
    print("\n" + "=" * 60)
    print("       SMART ATTENDANCE — FACE REGISTRATION")
    print("=" * 60 + "\n")

    # Collect person information
    name = input("Enter name: ").strip()
    if not name:
        print("❌ Name is required")
        return 1

    student_id = input("Enter student ID (optional): ").strip() or None
    class_name = input("Enter class (optional): ").strip() or None
    section = input("Enter section (optional): ").strip() or None

    # Generate unique person ID
    person_id = str(uuid.uuid4())[:8]

    print(f"\n✓ Registering: {name}")
    print(f"  Person ID: {person_id}")
    if student_id:
        print(f"  Student ID: {student_id}")
    if class_name:
        print(f"  Class: {class_name}")
    if section:
        print(f"  Section: {section}")

    print("\n" + "-" * 60)
    print("INSTRUCTIONS:")
    print("  • Look directly at the camera")
    print("  • Keep your face well-lit and clearly visible")
    print("  • Press SPACE to capture a sample (need 5 samples)")
    print("  • Press 'q' to quit")
    print("-" * 60 + "\n")

    input("Press ENTER when ready to start camera...")

    # Initialize components
    camera = WebcamCamera(device_index=0, width=640, height=480)
    detector = FaceDetector(scale_factor=1.1, min_neighbors=5, min_size=(50, 50))
    encoder = FaceEncoder()
    storage = FaceStorage()

    if not camera.start():
        print("❌ Failed to start camera")
        return 1

    captured_encodings = []
    num_samples_needed = 5

    try:
        while len(captured_encodings) < num_samples_needed:
            frame = camera.read()
            if frame is None:
                continue

            # Detect faces
            faces = detector.detect(frame)

            # Draw status
            display_frame = frame.copy()

            if len(faces) == 0:
                status = "❌ NO FACE DETECTED"
                color = (0, 0, 255)  # Red
            elif len(faces) > 1:
                status = f"⚠ {len(faces)} FACES DETECTED - Show only ONE face"
                color = (0, 165, 255)  # Orange
            else:
                status = "✓ Face detected - Press SPACE to capture"
                color = (0, 255, 0)  # Green
                detector.draw_faces(display_frame, faces, color=color, thickness=2)

            # Display status
            cv2.putText(
                display_frame,
                status,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2,
            )

            cv2.putText(
                display_frame,
                f"Captured: {len(captured_encodings)} / {num_samples_needed}",
                (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2,
            )

            cv2.putText(
                display_frame,
                "SPACE=Capture | Q=Quit",
                (10, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

            cv2.imshow(f"Register: {name}", display_frame)

            # Handle keypresses
            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                print("\n❌ Registration cancelled")
                return 1

            elif key == ord(" "):  # Space bar
                if len(faces) == 1:
                    print(f"  Capturing sample {len(captured_encodings) + 1}...", end=" ")

                    # Generate encoding
                    encoding = encoder.encode(frame, faces[0])

                    if encoding is not None:
                        captured_encodings.append(encoding)
                        print(f"✓ ({len(captured_encodings)}/{num_samples_needed})")
                    else:
                        print("❌ Failed to generate encoding")
                elif len(faces) == 0:
                    print("  ❌ No face detected — cannot capture")
                else:
                    print(f"  ❌ {len(faces)} faces detected — show only ONE face")

    except KeyboardInterrupt:
        print("\n❌ Registration cancelled")
        return 1
    finally:
        camera.stop()
        cv2.destroyAllWindows()

    # Save person
    person = Person(
        person_id=person_id,
        name=name,
        student_id=student_id,
        class_name=class_name,
        section=section,
        encodings=captured_encodings,
    )

    print("\nSaving registration data...", end=" ")
    if storage.save_person(person):
        print("✓")
        print("\n" + "=" * 60)
        print(f"✅ SUCCESS — {name} registered successfully!")
        print(f"   Person ID: {person_id}")
        print(f"   Samples captured: {len(captured_encodings)}")
        print("=" * 60 + "\n")
        return 0
    else:
        print("❌")
        print("\n❌ Failed to save registration data")
        return 1


def main():
    """Main entry point."""
    try:
        return register_person()
    except Exception as e:
        logger.error(f"Registration failed: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
