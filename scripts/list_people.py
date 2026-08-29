"""List all registered people."""

import logging
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from recognition.storage import FaceStorage

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def main():
    """List all registered people."""
    storage = FaceStorage()
    people = storage.list_people()

    if not people:
        print("\n❌ No registered people found")
        print("   Run 'python scripts/register_face.py' to register someone.\n")
        return 0

    print("\n" + "=" * 80)
    print("                         REGISTERED PEOPLE")
    print("=" * 80)
    print(
        f"{'Person ID':<12} {'Name':<20} {'Student ID':<12} {'Class':<10} {'Section':<8} {'Samples':<8}"
    )
    print("-" * 80)

    for p in people:
        print(
            f"{p['person_id']:<12} {p['name']:<20} {p['student_id']:<12} "
            f"{p['class_name']:<10} {p['section']:<8} {p['num_encodings']:<8}"
        )

    print("=" * 80)
    print(f"Total registered: {len(people)}")
    print("=" * 80 + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
