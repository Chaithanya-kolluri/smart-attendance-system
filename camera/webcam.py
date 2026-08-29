"""Webcam camera implementation using OpenCV.

Works on Windows, macOS, and Linux with standard USB webcams or built-in cameras.
"""

import logging
from typing import Optional

import cv2
import numpy as np

from camera.camera_interface import Camera

logger = logging.getLogger(__name__)


class WebcamCamera(Camera):
    """Webcam implementation using OpenCV's VideoCapture."""

    def __init__(self, device_index: int = 0, width: int = 640, height: int = 480):
        """Initialize webcam camera.

        Args:
            device_index: Camera device index (0 for default camera).
            width: Desired frame width.
            height: Desired frame height.
        """
        self.device_index = device_index
        self.width = width
        self.height = height
        self.capture: Optional[cv2.VideoCapture] = None
        logger.info(f"WebcamCamera initialized: device={device_index}, size={width}x{height}")

    def start(self) -> bool:
        """Start the webcam."""
        if self.capture is not None and self.capture.isOpened():
            logger.warning("Camera already started")
            return True

        logger.info(f"Starting webcam {self.device_index}...")
        self.capture = cv2.VideoCapture(self.device_index)

        if not self.capture.isOpened():
            logger.error(f"Failed to open webcam {self.device_index}")
            return False

        # Set resolution
        self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)

        # Read actual resolution (may differ from requested)
        actual_width = int(self.capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        actual_height = int(self.capture.get(cv2.CAP_PROP_FRAME_HEIGHT))

        logger.info(f"Webcam started: {actual_width}x{actual_height}")
        return True

    def read(self) -> Optional[np.ndarray]:
        """Read a frame from the webcam."""
        if self.capture is None or not self.capture.isOpened():
            logger.warning("Cannot read: camera not started")
            return None

        success, frame = self.capture.read()

        if not success or frame is None:
            logger.warning("Failed to read frame from webcam")
            return None

        return frame

    def stop(self) -> None:
        """Stop the webcam and release resources."""
        if self.capture is not None:
            logger.info("Stopping webcam...")
            self.capture.release()
            self.capture = None
            logger.info("Webcam stopped")

    def is_opened(self) -> bool:
        """Check if webcam is open."""
        return self.capture is not None and self.capture.isOpened()

    def get_frame_size(self) -> tuple[int, int]:
        """Get current frame dimensions."""
        if self.capture is None or not self.capture.isOpened():
            return (self.width, self.height)

        width = int(self.capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        return (width, height)

    def __del__(self):
        """Cleanup when object is destroyed."""
        self.stop()
