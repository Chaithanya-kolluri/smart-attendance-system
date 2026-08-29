@echo off
echo Starting Smart Attendance System...
start cmd /k ".\.venv\Scripts\Activate.ps1 && set PYTHONPATH=C:\pythonprojects\Smart Attendance && python -m uvicorn backend.app.main:app --reload"
start cmd /k ".\.venv\Scripts\Activate.ps1 && set PYTHONPATH=C:\pythonprojects\Smart Attendance && python scripts/run_attendance.py"
echo System started.
pause
