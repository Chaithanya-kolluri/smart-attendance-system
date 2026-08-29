"""Smart Attendance System — Backend configuration.

Loads settings from environment variables (or .env file).
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings, populated from environment variables."""

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/smart_attendance"

    # Security
    secret_key: str = "change-me-to-a-random-secret-key"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Camera / Recognition (used in later stages)
    camera_source: str = "webcam"
    device_id: str = "device-01"
    recognition_threshold: float = 0.6
    attendance_cooldown_seconds: int = 300

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
