"""Face data storage — manages registered faces.

This is a simple file-based storage used before the database is ready (Stage 6).
Each person's face data is stored as a JSON file with their embeddings.
"""

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class Person:
    """Represents a registered person."""

    person_id: str
    name: str
    student_id: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    encodings: List[np.ndarray] = None

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "person_id": self.person_id,
            "name": self.name,
            "student_id": self.student_id,
            "class_name": self.class_name,
            "section": self.section,
            "encodings": [enc.tolist() for enc in self.encodings] if self.encodings else [],
        }

    @staticmethod
    def from_dict(data: dict) -> "Person":
        """Create Person from dictionary."""
        encodings = [np.array(enc) for enc in data.get("encodings", [])]
        return Person(
            person_id=data["person_id"],
            name=data["name"],
            student_id=data.get("student_id"),
            class_name=data.get("class_name"),
            section=data.get("section"),
            encodings=encodings if encodings else None,
        )


class FaceStorage:
    """Simple file-based storage for face data."""

    def __init__(self, storage_dir: str = "face_data"):
        """Initialize face storage.

        Args:
            storage_dir: Directory to store face data files.
        """
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        logger.info(f"FaceStorage initialized at {self.storage_dir.absolute()}")

    def save_person(self, person: Person) -> bool:
        """Save person data to file.

        Args:
            person: Person object to save.

        Returns:
            True if successful, False otherwise.
        """
        try:
            file_path = self.storage_dir / f"{person.person_id}.json"
            with open(file_path, "w") as f:
                json.dump(person.to_dict(), f, indent=2)
            logger.info(f"Saved person {person.name} (ID: {person.person_id})")
            return True
        except Exception as e:
            logger.error(f"Failed to save person {person.person_id}: {e}")
            return False

    def load_person(self, person_id: str) -> Optional[Person]:
        """Load person data from file.

        Args:
            person_id: Person ID to load.

        Returns:
            Person object or None if not found.
        """
        try:
            file_path = self.storage_dir / f"{person_id}.json"
            if not file_path.exists():
                return None

            with open(file_path, "r") as f:
                data = json.load(f)
            return Person.from_dict(data)
        except Exception as e:
            logger.error(f"Failed to load person {person_id}: {e}")
            return None

    def load_all_people(self) -> List[Person]:
        """Load all registered people.

        Returns:
            List of Person objects.
        """
        people = []
        for file_path in self.storage_dir.glob("*.json"):
            try:
                with open(file_path, "r") as f:
                    data = json.load(f)
                people.append(Person.from_dict(data))
            except Exception as e:
                logger.warning(f"Failed to load {file_path}: {e}")
                continue

        logger.info(f"Loaded {len(people)} registered people")
        return people

    def delete_person(self, person_id: str) -> bool:
        """Delete person data.

        Args:
            person_id: Person ID to delete.

        Returns:
            True if successful, False otherwise.
        """
        try:
            file_path = self.storage_dir / f"{person_id}.json"
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted person {person_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete person {person_id}: {e}")
            return False

    def list_people(self) -> List[Dict[str, str]]:
        """List all registered people (basic info only).

        Returns:
            List of dictionaries with person_id, name, student_id.
        """
        people = self.load_all_people()
        return [
            {
                "person_id": p.person_id,
                "name": p.name,
                "student_id": p.student_id or "",
                "class_name": p.class_name or "",
                "section": p.section or "",
                "num_encodings": len(p.encodings) if p.encodings else 0,
            }
            for p in people
        ]
