"""Camera interface — abstraction for webcam and Raspberry Pi camera.

This interface allows the recognition system to work with any camera source
without knowing the implementation details.
"""

from abc import ABC, abstractmethod
from typing import Optional

import numpy as np


class Camera(ABC):
    """Abstract camera interface.

    All camera implementations must provide these methods.
    """

    @abstractmethod
    def start(self) -> bool:
        """Initialize and start the camera.

        Returns:
            True if successful, False otherwise.
        """
        pass

    @abstractmethod
    def read(self) -> Optional[np.ndarray]:
        """Read a single frame from the camera.

        Returns:
            Frame as a numpy array (BGR format), or None if unavailable.
        """
        pass

    @abstractmethod
    def stop(self) -> None:
        """Stop the camera and release resources."""
        pass

    @abstractmethod
    def is_opened(self) -> bool:
        """Check if the camera is currently open and ready.

        Returns:
            True if camera is open, False otherwise.
        """
        pass

    @abstractmethod
    def get_frame_size(self) -> tuple[int, int]:
        """Get the current frame dimensions.

        Returns:
            (width, height) tuple.
        """
        pass
