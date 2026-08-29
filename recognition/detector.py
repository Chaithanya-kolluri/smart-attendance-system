"""Face detection module.

Detects faces in image frames using OpenCV's Haar Cascade classifier.
This is lightweight and works well on Raspberry Pi without GPU.
"""

import logging
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class FaceDetector:
    """Detects faces in images using Haar Cascade classifier."""

    def __init__(self, scale_factor: float = 1.1, min_neighbors: int = 5, min_size: Tuple[int, int] = (30, 30)):
        """Initialize face detector.

        Args:
            scale_factor: Parameter specifying how much the image size is reduced at each scale.
                         Smaller values (e.g., 1.05) are more thorough but slower.
            min_neighbors: How many neighbors each candidate rectangle should have to retain it.
                          Higher values result in fewer but higher-quality detections.
            min_size: Minimum face size (width, height). Faces smaller than this are ignored.
        """
        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        self.min_size = min_size

        # Load Haar Cascade classifier
        # OpenCV includes pre-trained models
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

        if self.face_cascade.empty():
            raise RuntimeError(f"Failed to load Haar Cascade from {cascade_path}")

        logger.info(
            f"FaceDetector initialized: scale_factor={scale_factor}, "
            f"min_neighbors={min_neighbors}, min_size={min_size}"
        )

    def detect(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces in a frame.

        Args:
            frame: Input image (BGR format, as returned by camera.read()).

        Returns:
            List of detected face bounding boxes as (x, y, width, height) tuples.
            Returns empty list if no faces detected.
        """
        if frame is None or frame.size == 0:
            logger.warning("Empty frame provided to detector")
            return []

        # Convert to grayscale (Haar Cascade works on grayscale)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=self.scale_factor,
            minNeighbors=self.min_neighbors,
            minSize=self.min_size,
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        # Convert from numpy array to list of tuples
        return [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]

    def draw_faces(
        self,
        frame: np.ndarray,
        faces: List[Tuple[int, int, int, int]],
        color: Tuple[int, int, int] = (0, 255, 0),
        thickness: int = 2,
    ) -> np.ndarray:
        """Draw bounding boxes around detected faces.

        Args:
            frame: Input image.
            faces: List of face bounding boxes from detect().
            color: Box color in BGR format (default: green).
            thickness: Box line thickness.

        Returns:
            Frame with drawn bounding boxes (modifies input frame).
        """
        for (x, y, w, h) in faces:
            # Draw rectangle
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, thickness)

            # Add face counter label
            label = f"Face"
            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            label_y = y - 10 if y - 10 > label_size[1] else y + h + 20

            cv2.putText(
                frame,
                label,
                (x, label_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                1,
            )

        return frame

    def extract_face_region(self, frame: np.ndarray, face_box: Tuple[int, int, int, int]) -> np.ndarray:
        """Extract face region from frame.

        Args:
            frame: Input image.
            face_box: Face bounding box (x, y, width, height).

        Returns:
            Cropped face region as numpy array.
        """
        x, y, w, h = face_box
        return frame[y : y + h, x : x + w]
