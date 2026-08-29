"""Test script for webcam camera.

Shows a live video feed from your laptop webcam.
Press 'q' to quit.
"""

import logging
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import cv2

from camera.webcam import WebcamCamera

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def main():
    """Run webcam test."""
    logger.info("Starting webcam test...")
    logger.info("Press 'q' to quit")

    # Create camera
    camera = WebcamCamera(device_index=0, width=640, height=480)

    # Start camera
    if not camera.start():
        logger.error("Failed to start camera")
        return 1

    try:
        frame_count = 0
        while True:
            # Read frame
            frame = camera.read()

            if frame is None:
                logger.warning("No frame received")
                continue

            frame_count += 1

            # Add frame counter overlay
            cv2.putText(
                frame,
                f"Frame: {frame_count}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
            )

            # Add instructions overlay
            cv2.putText(
                frame,
                "Press 'q' to quit",
                (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2,
            )

            # Display frame
            cv2.imshow("Webcam Test - Smart Attendance", frame)

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
        logger.info(f"Test complete. Total frames: {frame_count}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
