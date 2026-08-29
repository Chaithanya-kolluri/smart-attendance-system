"""Face encoder — generates face embeddings for recognition.

Uses a simple but effective approach: normalized face pixels as features.
This is lightweight, fast, and Raspberry Pi compatible.
"""

import logging
from typing import List, Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class FaceEncoder:
    """Generates face embeddings from face images using normalized pixel features."""

    def __init__(self):
        """Initialize face encoder.

        Uses a simple approach: resize face to standard size and use normalized pixels.
        This is lightweight and works well on Raspberry Pi.
        """
        self.target_size = (64, 64)  # Smaller for faster processing
        logger.info("FaceEncoder initialized with normalized pixel feature extraction")

    def encode(self, frame: np.ndarray, face_box: Optional[tuple] = None) -> Optional[np.ndarray]:
        """Generate face encoding from an image.

        Args:
            frame: Input image (BGR format from OpenCV).
            face_box: Face bounding box as (x, y, width, height).

        Returns:
            Face encoding as numpy array, or None if encoding failed.
        """
        if frame is None or frame.size == 0:
            logger.warning("Empty frame provided to encoder")
            return None

        if face_box is None:
            logger.warning("No face box provided")
            return None

        try:
            # Extract face region
            x, y, w, h = face_box

            # Add boundary checks
            height, width = frame.shape[:2]
            x = max(0, x)
            y = max(0, y)
            w = min(w, width - x)
            h = min(h, height - y)

            if w <= 0 or h <= 0:
                logger.warning("Invalid face region dimensions")
                return None

            face_region = frame[y : y + h, x : x + w]

            if face_region.size == 0:
                logger.warning("Invalid face region")
                return None

            # Convert to grayscale
            gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)

            # Resize to standard size
            resized_face = cv2.resize(gray_face, self.target_size, interpolation=cv2.INTER_LINEAR)

            # Apply histogram equalization for better lighting normalization
            equalized_face = cv2.equalizeHist(resized_face)

            # Normalize to 0-1 range
            normalized_face = equalized_face.astype(np.float32) / 255.0

            # Flatten to 1D array and return as encoding
            encoding = normalized_face.flatten()

            return encoding

        except Exception as e:
            logger.error(f"Failed to encode face: {e}")
            return None

    def encode_multiple(self, frame: np.ndarray, face_boxes: List[tuple]) -> List[Optional[np.ndarray]]:
        """Generate encodings for multiple faces in one frame.

        Args:
            frame: Input image (BGR format).
            face_boxes: List of face bounding boxes as (x, y, width, height).

        Returns:
            List of face encodings, with None for faces that failed encoding.
        """
        return [self.encode(frame, box) for box in face_boxes]

    @staticmethod
    def compare(encoding1: np.ndarray, encoding2: np.ndarray, threshold: float = 0.6) -> bool:
        """Compare two face encodings.

        Args:
            encoding1: First face encoding.
            encoding2: Second face encoding.
            threshold: Similarity threshold (0-1, lower = stricter).
                      0.6 is recommended for reasonable matching.

        Returns:
            True if faces match, False otherwise.
        """
        # Compute correlation coefficient (better than simple distance for pixel-based features)
        mean1 = np.mean(encoding1)
        mean2 = np.mean(encoding2)

        numerator = np.sum((encoding1 - mean1) * (encoding2 - mean2))
        denominator = np.sqrt(np.sum((encoding1 - mean1) ** 2) * np.sum((encoding2 - mean2) ** 2))

        if denominator == 0:
            return False

        correlation = numerator / denominator

        # Convert threshold: higher threshold = stricter matching
        # correlation of 1.0 = identical, 0 = uncorrelated, -1 = opposite
        return correlation > (1 - threshold)

    @staticmethod
    def distance(encoding1: np.ndarray, encoding2: np.ndarray) -> float:
        """Calculate distance between two face encodings.

        Args:
            encoding1: First face encoding.
            encoding2: Second face encoding.

        Returns:
            Distance value (lower = more similar). Range 0-2, where 0 is identical.
        """
        # Use correlation-based distance
        mean1 = np.mean(encoding1)
        mean2 = np.mean(encoding2)

        numerator = np.sum((encoding1 - mean1) * (encoding2 - mean2))
        denominator = np.sqrt(np.sum((encoding1 - mean1) ** 2) * np.sum((encoding2 - mean2) ** 2))

        if denominator == 0:
            return 2.0

        correlation = numerator / denominator

        # Convert correlation to distance (0 = identical, 2 = completely different)
        return float(1 - correlation)
