# Smart Attendance System

Automatic attendance tracking using face recognition, built with Python, FastAPI, and React.

## Architecture

```
Raspberry Pi (Camera + Recognition)
        │
        │ HTTP / WebSocket
        ▼
  FastAPI Backend  ←→  PostgreSQL
        │
        ▼
  Web Dashboard (React)
```

## Project Structure

```
smart-attendance/
├── backend/          # FastAPI server, database, APIs
├── camera/           # Camera abstraction (webcam / Pi camera)
├── recognition/      # Face detection, encoding, matching
├── frontend/         # React web dashboard
├── scripts/          # Setup and deployment scripts
├── docs/             # Documentation
└── tests/            # Integration tests
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend, later stages)
- PostgreSQL (later stages — Docker recommended)

### Backend Setup

```bash
cd smart-attendance/backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # edit as needed
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

Health check: `GET http://localhost:8000/api/health`

API docs: `http://localhost:8000/docs`

## Development Stages

- [x] Stage 1 — Project setup, FastAPI health endpoint
- [ ] Stage 2 — Camera abstraction + webcam feed
- [ ] Stage 3 — Face detection
- [ ] Stage 4 — Face registration
- [ ] Stage 5 — Face recognition
- [ ] Stage 6 — PostgreSQL database
- [ ] Stage 7 — Attendance engine
- [ ] Stage 8 — REST APIs
- [ ] Stage 9 — React dashboard
- [ ] Stage 10 — WebSocket live updates
- [ ] Stage 11 — Raspberry Pi integration
- [ ] Stage 12 — Deployment + systemd

## License

Private project.
