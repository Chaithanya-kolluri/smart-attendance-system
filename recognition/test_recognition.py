"""Test script for face recognition.

Shows live webcam feed with face recognition.
Recognizes registered people and displays their names.
Press 'q' to quit.
"""

import logging
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import cv2

from camera.webcam import WebcamCamera
from recognition.detector import FaceDetector
from recognition.encoder import FaceEncoder
from recognition.matcher import FaceMatcher, RecognitionTracker
from recognition.storage import FaceStorage

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def main():
    """Run face recognition test."""
    logger.info("Starting face recognition test...")
    logger.info("Press 'q' to quit")

    # Initialize components
    camera = WebcamCamera(device_index=0, width=640, height=480)
    detector = FaceDetector(scale_factor=1.1, min_neighbors=5, min_size=(30, 30))
    encoder = FaceEncoder()
    storage = FaceStorage()
    matcher = FaceMatcher(storage, encoder, threshold=0.6)
    tracker = RecognitionTracker(required_frames=3, reset_after=10)

    # Check if anyone is registered
    if matcher.get_registered_count() == 0:
        print("\n❌ No registered people found!")
        print("   Run 'python scripts/register_face.py' to register someone first.\n")
        return 1

    print(f"\n✓ Loaded {matcher.get_registered_count()} registered people")
    print("  Starting recognition...\n")

    # Start camera
    if not camera.start():
        logger.error("Failed to start camera")
        return 1

    try:
        frame_count = 0
        recognition_count = 0

        while True:
            # Read frame
            frame = camera.read()

            if frame is None:
                logger.warning("No frame received")
                continue

            frame_count += 1

            # Detect faces
            faces = detector.detect(frame)

            # Recognize faces
            matches = matcher.match_multiple(frame, faces)

            # Track recognition across frames
            confirmed_matches = tracker.update(matches)

            # Draw results
            for i, (face_box, match) in enumerate(zip(faces, confirmed_matches)):
                x, y, w, h = face_box

                if match is not None:
                    # Recognized person
                    recognition_count += 1
                    color = (0, 255, 0)  # Green
                    label = f"{match.name} ({match.confidence:.0%})"
                    logger.info(f"Recognized: {match}")
                else:
                    # Unknown person
                    color = (0, 165, 255)  # Orange
                    label = "Unknown"

                # Draw rectangle
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

                # Draw label background
                label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                label_y = y - 10 if y - 10 > label_size[1] else y + h + 20

                cv2.rectangle(
                    frame,
                    (x, label_y - label_size[1] - 5),
                    (x + label_size[0], label_y + 5),
                    color,
                    -1,
                )

                # Draw label text
                cv2.putText(
                    frame,
                    label,
                    (x, label_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    2,
                )

            # Add info overlay
            cv2.putText(
                frame,
                f"Faces: {len(faces)}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2,
            )

            cv2.putText(
                frame,
                f"Registered: {matcher.get_registered_count()}",
                (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2,
            )

            cv2.putText(
                frame,
                "Press 'q' to quit",
                (10, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2,
            )

            # Display frame
            cv2.imshow("Face Recognition Test - Smart Attendance", frame)

            # Check for quit key
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                logger.info("Quit key pressed")
                break

    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    finally:
        # Cleanup
        camera.stop()
        cv2.destroyAllWindows()
        logger.info(f"Test complete. Frames: {frame_count}, Recognition events: {recognition_count}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
