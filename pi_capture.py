#!/usr/bin/env python3
"""
================================================================================
Smart Attendance System - Raspberry Pi 4 (2GB RAM) IoT Edge Client
================================================================================
File: pi_capture.py
Platform: Raspberry Pi 4 Model B (2GB RAM) / Pi Camera Module / USB Webcam
Author: Principal Full-Stack & IoT Engineer

Key Optimizations for 2GB RAM & Quad-Core ARM Cortex-A72:
1. 1/4 Frame Downscaling (fx=0.25, fy=0.25) before passing to face_recognition
   reduces pixel processing volume by 93.75%, preventing RAM spikes and thermal throttling.
2. Interleaved Frame Processing (process every Nth frame) preserves FPS.
3. In-Memory RAM Caching: Pre-loads student encodings and refreshes asynchronously
   every 5 minutes without interrupting video capture.
4. 15-Minute Local Anti-Spam Cooldown prevents spamming backend API on continuous detection.
5. Non-Blocking Async Dispatch: API calls run on background worker threads.
6. Diagnostic Terminal Telemetry with colorized latency metrics and API HTTP status codes.
================================================================================
"""

import sys
import time
import json
import queue
import logging
import argparse
import threading
from datetime import datetime, timedelta

# Ensure stdout supports UTF-8 on Windows and Linux
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Network and Math
try:
    import numpy as np
except ImportError:
    print("[ERROR] numpy is required. Please install via: pip install numpy")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("[ERROR] requests is required. Please install via: pip install requests")
    sys.exit(1)

try:
    import cv2
except ImportError:
    print("[ERROR] OpenCV is required. Please install via: pip install opencv-python")
    sys.exit(1)

# face_recognition optional import with graceful fallback/mock for cross-platform dev
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("[WARN] 'face_recognition' library is not installed on this machine.")
    print("       For Raspberry Pi: install dlib and face_recognition.")
    print("       Running in compatibility/simulation mode where applicable.")


# ANSI Color Codes for Terminal UI
class TerminalColors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    RESET = '\033[0m'


class SmartAttendancePiClient:
    def __init__(self, api_url, camera_index=0, frame_skip=3, cooldown_minutes=15, sync_interval=300):
        self.api_url = api_url.rstrip('/')
        self.camera_index = camera_index
        self.frame_skip = frame_skip
        self.cooldown_seconds = cooldown_minutes * 60
        self.sync_interval = sync_interval

        # Local RAM Cache
        # Format: { 'encodings': [np.ndarray, ...], 'ids': ['STU001', ...], 'names': ['Sarah', ...], 'classes': ['CS101', ...] }
        self.cache_lock = threading.Lock()
        self.student_cache = {
            'encodings': [],
            'ids': [],
            'names': [],
            'classes': []
        }

        # Anti-Spam Attendance Cooldown Tracking: { student_id: timestamp }
        self.cooldown_lock = threading.Lock()
        self.cooldown_map = {}

        # Asynchronous API Dispatch Queue
        self.dispatch_queue = queue.Queue(maxsize=100)
        self.running = True

        # Telemetry Stats
        self.fps = 0.0
        self.total_marked = 0

    def print_banner(self):
        banner = f"""
{TerminalColors.OKCYAN}{TerminalColors.BOLD}========================================================================
       SMART ATTENDANCE SYSTEM - RASPBERRY PI 4 IOT CLIENT
========================================================================{TerminalColors.RESET}
 {TerminalColors.OKBLUE}Target API URL       :{TerminalColors.RESET} {self.api_url}
 {TerminalColors.OKBLUE}Camera Index         :{TerminalColors.RESET} {self.camera_index}
 {TerminalColors.OKBLUE}Frame Downscale Ratio:{TerminalColors.RESET} 0.25 (1/4 scale for 2GB RAM preservation)
 {TerminalColors.OKBLUE}Cooldown Window      :{TerminalColors.RESET} {self.cooldown_seconds // 60} minutes
 {TerminalColors.OKBLUE}Cache Refresh Period :{TerminalColors.RESET} {self.sync_interval} seconds
 {TerminalColors.OKBLUE}Engine Status        :{TerminalColors.RESET} {'face_recognition (dlib HOG)' if FACE_RECOGNITION_AVAILABLE else 'Mock/Simulation Fallback'}
{TerminalColors.OKCYAN}========================================================================{TerminalColors.RESET}
"""
        print(banner)

    # --------------------------------------------------------------------------
    # 1. Database Synced Caching
    # --------------------------------------------------------------------------
    def refresh_student_cache(self):
        """Fetches known student facial embeddings from backend into local RAM."""
        url = f"{self.api_url}/api/students"
        try:
            t0 = time.time()
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                payload = resp.json()
                students = payload.get('students', [])

                encodings = []
                ids = []
                names = []
                classes = []

                for s in students:
                    raw_enc = s.get('face_encoding')
                    if raw_enc:
                        if isinstance(raw_enc, str):
                            raw_enc = json.loads(raw_enc)
                        encodings.append(np.array(raw_enc, dtype=np.float64))
                        ids.append(s.get('id'))
                        names.append(s.get('name', 'Unknown'))
                        classes.append(s.get('class_assigned', 'General'))

                with self.cache_lock:
                    self.student_cache['encodings'] = encodings
                    self.student_cache['ids'] = ids
                    self.student_cache['names'] = names
                    self.student_cache['classes'] = classes

                elapsed = (time.time() - t0) * 1000
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.OKGREEN}[OK] Cache Synced:{TerminalColors.RESET} "
                      f"Loaded {len(ids)} student profiles ({elapsed:.1f}ms)")
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.WARNING}[WARN] Cache Sync Warning:{TerminalColors.RESET} "
                      f"API returned HTTP {resp.status_code}")
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.FAIL}[ERROR] Cache Sync Error:{TerminalColors.RESET} {e}")

    def _cache_sync_daemon(self):
        """Background daemon thread refreshing cache every 5 minutes."""
        while self.running:
            time.sleep(self.sync_interval)
            if self.running:
                self.refresh_student_cache()

    # --------------------------------------------------------------------------
    # 2. Asynchronous HTTP Dispatch Worker
    # --------------------------------------------------------------------------
    def _async_dispatcher_worker(self):
        """Dispatches attendance mark requests without blocking video loop."""
        while self.running:
            try:
                task = self.dispatch_queue.get(timeout=1)
            except queue.Empty:
                continue

            student_id = task.get('student_id')
            student_name = task.get('name')
            class_name = task.get('class_name')
            confidence = task.get('confidence', 0.0)

            post_url = f"{self.api_url}/api/attendance/mark"
            payload = {
                'student_id': student_id,
                'class_name': class_name,
                'status': 'Present',
                'timestamp': datetime.now().isoformat()
            }

            try:
                t0 = time.time()
                resp = requests.post(post_url, json=payload, timeout=4)
                latency = (time.time() - t0) * 1000

                if resp.status_code in [200, 201]:
                    self.total_marked += 1
                    status_badge = f"{TerminalColors.OKGREEN}[HTTP {resp.status_code} OK]{TerminalColors.RESET}"
                else:
                    status_badge = f"{TerminalColors.FAIL}[HTTP {resp.status_code} FAIL]{TerminalColors.RESET}"

                print(f"[{datetime.now().strftime('%H:%M:%S')}] {status_badge} "
                      f"Marked: {TerminalColors.BOLD}{student_name}{TerminalColors.RESET} ({student_id}) "
                      f"| Dist: {confidence:.3f} | Latency: {latency:.1f}ms")
            except Exception as ex:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.FAIL}[ERROR] HTTP Dispatch Error for {student_id}:{TerminalColors.RESET} {ex}")
            finally:
                self.dispatch_queue.task_done()

    # --------------------------------------------------------------------------
    # 3. Anti-Spam Check
    # --------------------------------------------------------------------------
    def should_mark(self, student_id):
        """Checks if the student was marked within the 15-minute cooldown window."""
        now = time.time()
        with self.cooldown_lock:
            last_time = self.cooldown_map.get(student_id)
            if last_time and (now - last_time < self.cooldown_seconds):
                remaining = int((self.cooldown_seconds - (now - last_time)) / 60)
                return False, remaining
            self.cooldown_map[student_id] = now
            return True, 0

    # --------------------------------------------------------------------------
    # 4. Main Video Processing Loop
    # --------------------------------------------------------------------------
    def run(self, mock_camera=False):
        self.print_banner()

        # Step 1: Initial Cache Sync
        self.refresh_student_cache()

        # Step 2: Start Background Threads
        sync_thread = threading.Thread(target=self._cache_sync_daemon, daemon=True)
        sync_thread.start()

        worker_thread = threading.Thread(target=self._async_dispatcher_worker, daemon=True)
        worker_thread.start()

        # Step 3: Initialize Camera
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.OKBLUE}Initializing Video Stream...{TerminalColors.RESET}")

        if mock_camera:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.WARNING}Running in Mock Camera mode (synthetic frames).{TerminalColors.RESET}")
            cap = None
        else:
            cap = cv2.VideoCapture(self.camera_index)
            # Set hardware resolution to 640x480 for 30fps smooth intake on Pi
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            if not cap.isOpened():
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.FAIL}Could not open video device index {self.camera_index}. Fallback to mock mode.{TerminalColors.RESET}")
                mock_camera = True
                cap = None

        print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.OKGREEN}System Armed & Processing Loop Active.{TerminalColors.RESET}")
        print(f"{TerminalColors.DIM}Press 'q' in video window or Ctrl+C in terminal to stop.{TerminalColors.RESET}\n")

        frame_count = 0
        t_prev = time.time()

        face_locations = []
        face_names = []

        try:
            while self.running:
                t_frame_start = time.time()
                frame_count += 1

                if mock_camera:
                    # Synthetic 640x480 frame for testing environments
                    frame = np.zeros((480, 640, 3), dtype=np.uint8)
                    cv2.putText(frame, "Raspberry Pi 4 IoT Attendance - Live Feed", (20, 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 200), 2)
                    cv2.putText(frame, f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", (20, 80),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
                    time.sleep(0.05)
                else:
                    ret, frame = cap.read()
                    if not ret:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.WARNING}Failed to grab frame. Retrying...{TerminalColors.RESET}")
                        time.sleep(0.1)
                        continue

                # Process every Nth frame to reduce CPU utilization on Pi
                if frame_count % self.frame_skip == 0:
                    t_proc_start = time.time()

                    # ==========================================================
                    # PERFORMANCE OPTIMIZATION: 1/4 Downscaling
                    # ==========================================================
                    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                    # Convert BGR (OpenCV standard) to RGB (face_recognition standard)
                    rgb_small_frame = np.ascontiguousarray(small_frame[:, :, ::-1])

                    if FACE_RECOGNITION_AVAILABLE:
                        # Find all face locations and 128-d encodings in downscaled frame
                        face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
                        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

                        face_names = []
                        with self.cache_lock:
                            known_encodings = self.student_cache['encodings']
                            known_ids = self.student_cache['ids']
                            known_names = self.student_cache['names']
                            known_classes = self.student_cache['classes']

                        for face_encoding in face_encodings:
                            name = "Unknown"
                            student_id = None
                            class_name = None
                            best_distance = 1.0

                            if len(known_encodings) > 0:
                                # Compare distances to local RAM encodings
                                face_distances = face_recognition.face_distance(known_encodings, face_encoding)
                                best_match_index = np.argmin(face_distances)
                                best_distance = face_distances[best_match_index]

                                # Threshold of 0.50 (strict match) to 0.60 (standard)
                                if best_distance < 0.55:
                                    student_id = known_ids[best_match_index]
                                    name = known_names[best_match_index]
                                    class_name = known_classes[best_match_index]

                            face_names.append(name)

                            # Handle matching & anti-spam cooldown check
                            if student_id:
                                allow_mark, remaining_mins = self.should_mark(student_id)
                                if allow_mark:
                                    # Dispatch asynchronously to background thread
                                    self.dispatch_queue.put({
                                        'student_id': student_id,
                                        'name': name,
                                        'class_name': class_name,
                                        'confidence': float(best_distance)
                                    })
                                else:
                                    print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.DIM}[COOLDOWN]{TerminalColors.RESET} "
                                          f"{name} ({student_id}) already marked. ({remaining_mins}m remaining)")

                    proc_ms = (time.time() - t_proc_start) * 1000

                    # Compute FPS
                    t_now = time.time()
                    self.fps = 1.0 / max(t_now - t_prev, 0.001)
                    t_prev = t_now

                    # Terminal telemetry line
                    faces_found = len(face_locations)
                    if faces_found > 0:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] {TerminalColors.OKCYAN}[FRAME]{TerminalColors.RESET} "
                              f"Faces Detected: {faces_found} | Process Time: {proc_ms:.1f}ms | FPS: {self.fps:.1f}")

                # Optional: Render visual bounding box if desktop GUI is available
                for (top, right, bottom, left), name in zip(face_locations, face_names):
                    # Scale back up by 4x to match original frame size
                    top *= 4
                    right *= 4
                    bottom *= 4
                    left *= 4

                    color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
                    cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                    cv2.rectangle(frame, (left, bottom - 30), (right, bottom), color, cv2.FILLED)
                    cv2.putText(frame, name, (left + 6, bottom - 8),
                                cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)

                # Show frame if display is available (will gracefully fail on headless Pi)
                try:
                    cv2.imshow('Smart Attendance - Raspberry Pi 4 Camera Feed', frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        print("\nExiting per user request...")
                        break
                except cv2.error:
                    pass

        except KeyboardInterrupt:
            print("\nShutting down Raspberry Pi Attendance Client...")
        finally:
            self.running = False
            if cap:
                cap.release()
            try:
                cv2.destroyAllWindows()
            except Exception:
                pass
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Shutdown complete. Total marked this session: {self.total_marked}")


def main():
    parser = argparse.ArgumentParser(description="Smart Attendance IoT Client for Raspberry Pi 4")
    parser.add_argument('--api', default='http://localhost:5000', help='Backend API base URL')
    parser.add_argument('--camera', type=int, default=0, help='Camera index (default 0)')
    parser.add_argument('--skip', type=int, default=2, help='Process every Nth frame (default 2)')
    parser.add_argument('--cooldown', type=int, default=15, help='Anti-spam cooldown in minutes (default 15)')
    parser.add_argument('--sync', type=int, default=300, help='Cache sync interval in seconds (default 300)')
    parser.add_argument('--mock-camera', action='store_true', help='Use synthetic video frames (useful for test/headless)')
    args = parser.parse_args()

    client = SmartAttendancePiClient(
        api_url=args.api,
        camera_index=args.camera,
        frame_skip=args.skip,
        cooldown_minutes=args.cooldown,
        sync_interval=args.sync
    )
    client.run(mock_camera=args.mock_camera)


if __name__ == '__main__':
    main()
