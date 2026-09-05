# Smart Attendance System (Full-Stack & IoT)

An enterprise-grade, real-time facial recognition attendance platform consisting of:
- **React (Vite) + Tailwind CSS Frontend**: Registration portal with browser webcam capture & face vector extraction, public student attendance lookup portal, and an interactive teacher dashboard with attendance override controls.
- **Node.js + Express REST API**: High-throughput backend supporting student registration, cache synchronization for IoT hardware, historical reporting, and attendance mutations.
- **Supabase PostgreSQL Database**: Scalable cloud database architecture with Row-Level Security (RLS) policies, UUID generation, and optimized indexing.
- **Raspberry Pi 4 (2GB RAM) IoT Client (`pi_capture.py`)**: Standalone edge face recognition client strictly optimized for low memory usage and high frame rates through 1/4 frame downscaling, local RAM caching, 15-minute anti-spam cooldown, and asynchronous HTTP dispatching.

---

## 📁 Project Structure

```
Smart Attendance/
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Active environment variables
│   ├── package.json          # Node.js dependencies
│   ├── db.js                 # Supabase client & fallback in-memory store
│   └── server.js             # Express REST API
├── frontend/
│   ├── src/
│   │   ├── components/       # Registration, Student View, Teacher Dashboard
│   │   ├── App.jsx           # Main layout and tab navigation
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind CSS styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── schema.sql                # Supabase PostgreSQL schema & tables
├── pi_capture.py             # Optimized Raspberry Pi 4 edge capture script
└── README.md                 # System documentation & setup guide
```

---

## 🛠️ Tech Stack & Configuration

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React icons
- **Backend**: Node.js, Express, CORS, Dotenv, `@supabase/supabase-js`
- **Database**: Supabase PostgreSQL (or local fallback mode for instant offline testing)
- **IoT Hardware**: Raspberry Pi 4 (2GB RAM), Python 3, OpenCV (`cv2`), `face_recognition` (dlib HOG)

---

## 🗄️ Step 1: Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor**.
3. Copy and paste the contents of `schema.sql` into the editor and click **Run**.
   - This provisions the `students` table, `attendance` table, RLS policies, and performance indexes.
4. Retrieve your **Project URL** and **Anon Key** from **Settings -> API**.

---

## 🚀 Step 2: Backend Setup & Execution

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-supabase-anon-or-service-role-key
   ```
   *(Note: If left empty, the server automatically starts in an in-memory mode with pre-seeded test data, allowing immediate testing.)*

4. Start the server:
   ```bash
   npm start
   ```
   The API will be live at `http://localhost:5000`.

### REST API Endpoints:
- `GET  /api/health` - Diagnostic health check and database connection status.
- `POST /api/students/register` - Register new student with 128-d face embedding array.
- `GET  /api/students` - Retrieve all students (used by Raspberry Pi for local RAM cache).
- `GET  /api/students/report/:id` - Historical chronological attendance log for a student.
- `GET  /api/attendance/class/:className` - Fetch attendance records for a class on a date.
- `POST /api/attendance/mark` - Insert or record an attendance event.
- `PUT  /api/attendance/update` - Teacher override for attendance status (`Present`, `Absent`, `Late`).

---

## 💻 Step 3: Frontend Setup & Execution

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

### Portals Included:
1. **Laptop Registration Portal**:
   - Live browser webcam feed with visual bounding box guide.
   - Captures snapshot to HTML5 canvas and extracts 128-dimensional face embedding.
   - Registers student ID, full name, class, and facial vector into backend.
2. **Student View Portal**:
   - Public read-only portal.
   - Search by Student ID (`STU101`, `STU102`, etc.).
   - Displays student details, attendance rate, and chronological attendance table. All modification inputs are disabled.
3. **Teacher Dashboard Portal**:
   - Class selector dropdown (`CS101`, `EE200`, etc.) and date picker.
   - Summary statistics (Total Students, Present, Absent, Attendance Rate).
   - Roster grid with real-time status badges and instant status override buttons (`Present`, `Absent`, `Late`).

---

## 🍓 Step 4: Raspberry Pi 4 Companion Client (`pi_capture.py`)

### Raspberry Pi 4 Hardware Requirements:
- Raspberry Pi 4 Model B (2GB RAM or higher) running Raspberry Pi OS (64-bit recommended)
- Raspberry Pi Camera Module (v2 / v3 / HQ) or standard USB Webcam
- Active network connection to the Express API backend

### Raspberry Pi Software Installation:
```bash
sudo apt update && sudo apt install -y build-essential cmake pkg-config libjpeg-dev libtiff5-dev libpng-dev libavcodec-dev libavformat-dev libswscale-dev libv4l-dev libxvidcore-dev libx264-dev libatlas-base-dev gfortran python3-dev

# Install Python packages
pip3 install opencv-python numpy requests
pip3 install dlib face_recognition
```

### Running the Client:
Run the standalone companion script:
```bash
# Point to your backend IP/URL:
python3 pi_capture.py --api http://<YOUR_BACKEND_IP>:5000 --camera 0

# Useful flags:
#   --skip 2        : Process every 2nd frame (conserves CPU/RAM)
#   --cooldown 15   : 15-minute anti-spam throttle window
#   --sync 300      : Sync face encodings from backend every 5 minutes
#   --mock-camera   : Test without physical camera hardware attached
```

### Edge Optimizations on the Pi 4:
1. **1/4 Frame Downscaling (`fx=0.25, fy=0.25`)**: Reduces pixel area by 93.75%, avoiding OOM crashes on 2GB RAM.
2. **RAM Array Caching**: Pulls student vectors on boot and caches them in memory. Refreshes asynchronously every 5 minutes.
3. **15-Minute Anti-Spam Cooldown**: Prevents duplicate attendance logging if a student lingers in front of the camera.
4. **Asynchronous HTTP Dispatch**: Sends attendance check-in requests on background worker threads so video capture never drops frames.
5. **Terminal Visual Telemetry**: Displays colored logs with frame processing time in milliseconds, FPS, and backend HTTP status codes.

