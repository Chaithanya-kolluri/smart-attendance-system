"""Face matcher — matches detected faces against registered people.

Loads registered people and compares detected faces to find matches.
"""

import logging
from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np

from recognition.encoder import FaceEncoder
from recognition.storage import FaceStorage, Person

logger = logging.getLogger(__name__)


@dataclass
class Match:
    """Represents a face recognition match."""

    person_id: str
    name: str
    distance: float
    confidence: float
    student_id: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None

    def __str__(self):
        return f"{self.name} (confidence: {self.confidence:.2%}, distance: {self.distance:.3f})"


class FaceMatcher:
    """Matches faces against registered people."""

    def __init__(self, storage: FaceStorage, encoder: FaceEncoder, threshold: float = 0.6):
        """Initialize face matcher.

        Args:
            storage: FaceStorage instance to load registered people.
            encoder: FaceEncoder instance for encoding faces.
            threshold: Recognition threshold (lower = stricter).
                      0.6 is recommended default.
        """
        self.storage = storage
        self.encoder = encoder
        self.threshold = threshold
        self.registered_people: List[Person] = []
        self.reload_registered_people()

    def reload_registered_people(self) -> int:
        """Reload registered people from storage.

        Returns:
            Number of people loaded.
        """
        self.registered_people = self.storage.load_all_people()
        logger.info(f"Loaded {len(self.registered_people)} registered people")
        return len(self.registered_people)

    def match(self, encoding: np.ndarray) -> Optional[Match]:
        """Match a face encoding against registered people.

        Args:
            encoding: Face encoding to match.

        Returns:
            Match object if a match is found, None otherwise.
        """
        if encoding is None:
            return None

        if len(self.registered_people) == 0:
            logger.warning("No registered people to match against")
            return None

        best_match: Optional[Match] = None
        best_distance = float("inf")

        # Compare against all registered people
        for person in self.registered_people:
            if not person.encodings:
                continue

            # Compare against all samples for this person
            for person_encoding in person.encodings:
                distance = self.encoder.distance(encoding, person_encoding)

                if distance < best_distance:
                    best_distance = distance
                    # Convert distance to confidence (0-1 scale)
                    # Lower distance = higher confidence
                    confidence = max(0.0, 1.0 - distance)

                    best_match = Match(
                        person_id=person.person_id,
                        name=person.name,
                        distance=distance,
                        confidence=confidence,
                        student_id=person.student_id,
                        class_name=person.class_name,
                        section=person.section,
                    )

        # Check if best match meets threshold
        if best_match and best_match.distance < self.threshold:
            return best_match

        return None

    def match_multiple(
        self, frame: np.ndarray, face_boxes: List[Tuple[int, int, int, int]]
    ) -> List[Optional[Match]]:
        """Match multiple faces in a frame.

        Args:
            frame: Input image (BGR format).
            face_boxes: List of face bounding boxes.

        Returns:
            List of Match objects (or None for unmatched faces).
        """
        encodings = self.encoder.encode_multiple(frame, face_boxes)
        return [self.match(enc) if enc is not None else None for enc in encodings]

    def get_registered_count(self) -> int:
        """Get number of registered people.

        Returns:
            Number of registered people.
        """
        return len(self.registered_people)


class RecognitionTracker:
    """Tracks recognition across multiple frames for consistency.

    Requires consistent recognition over multiple consecutive frames
    before confirming a match. This reduces false positives.
    """

    def __init__(self, required_frames: int = 3, reset_after: int = 10):
        """Initialize recognition tracker.

        Args:
            required_frames: Number of consecutive frames required to confirm recognition.
            reset_after: Reset tracking after this many frames without detection.
        """
        self.required_frames = required_frames
        self.reset_after = reset_after
        self.tracking: dict = {}  # person_id -> frame_count
        self.no_detection_count: dict = {}  # person_id -> frames_without_detection
        logger.info(
            f"RecognitionTracker initialized: required_frames={required_frames}, reset_after={reset_after}"
        )

    def update(self, matches: List[Optional[Match]]) -> List[Optional[Match]]:
        """Update tracker with new matches.

        Args:
            matches: List of matches from current frame.

        Returns:
            List of confirmed matches (only those with required_frames).
        """
        confirmed_matches = []

        # Track which people were seen in this frame
        seen_people = set()

        for match in matches:
            if match is None:
                confirmed_matches.append(None)
                continue

            person_id = match.person_id
            seen_people.add(person_id)

            # Increment tracking counter
            self.tracking[person_id] = self.tracking.get(person_id, 0) + 1
            self.no_detection_count[person_id] = 0

            # Check if recognition is confirmed
            if self.tracking[person_id] >= self.required_frames:
                confirmed_matches.append(match)
            else:
                confirmed_matches.append(None)

        # Reset tracking for people not seen
        for person_id in list(self.tracking.keys()):
            if person_id not in seen_people:
                self.no_detection_count[person_id] = self.no_detection_count.get(person_id, 0) + 1

                # Reset if not seen for too long
                if self.no_detection_count[person_id] >= self.reset_after:
                    del self.tracking[person_id]
                    del self.no_detection_count[person_id]

        return confirmed_matches

    def reset(self):
        """Reset all tracking."""
        self.tracking.clear()
        self.no_detection_count.clear()
