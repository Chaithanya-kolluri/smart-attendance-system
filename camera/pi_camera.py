"""Raspberry Pi camera implementation using picamera2.

This will be implemented in Stage 11 when deploying to Raspberry Pi.
For now, this is a placeholder showing the expected interface.
"""

import logging
from typing import Optional

import numpy as np

from camera.camera_interface import Camera

logger = logging.getLogger(__name__)


class PiCamera(Camera):
    """Raspberry Pi camera implementation.

    NOTE: This requires picamera2 library which is only available on Raspberry Pi OS.
    Do not use this on Windows/macOS during development.
    """

    def __init__(self, width: int = 640, height: int = 480):
        """Initialize Pi camera.

        Args:
            width: Frame width.
            height: Frame height.
        """
        self.width = width
        self.height = height
        logger.info(f"PiCamera initialized: size={width}x{height}")
        raise NotImplementedError(
            "PiCamera will be implemented in Stage 11. "
            "Use WebcamCamera for development on Windows/macOS."
        )

    def start(self) -> bool:
        """Start the Pi camera."""
        raise NotImplementedError("PiCamera not yet implemented")

    def read(self) -> Optional[np.ndarray]:
        """Read a frame from the Pi camera."""
        raise NotImplementedError("PiCamera not yet implemented")

    def stop(self) -> None:
        """Stop the Pi camera."""
        raise NotImplementedError("PiCamera not yet implemented")

    def is_opened(self) -> bool:
        """Check if Pi camera is open."""
        raise NotImplementedError("PiCamera not yet implemented")

    def get_frame_size(self) -> tuple[int, int]:
        """Get frame dimensions."""
        return (self.width, self.height)
