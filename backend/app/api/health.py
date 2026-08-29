"""Health-check endpoint.

Used by monitoring, load balancers, and the Raspberry Pi client to verify
the backend is reachable.
"""

from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    """Return a simple status payload confirming the server is alive."""
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.1.0",
    }
