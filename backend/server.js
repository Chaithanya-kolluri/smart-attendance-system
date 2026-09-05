const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' })); // Support JSON payloads including face vector embeddings

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// -----------------------------------------------------------------------------
// Health & Info Route
// -----------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: db.isUsingSupabase() ? 'Supabase PostgreSQL' : 'Local In-Memory Mode',
    version: '1.0.0'
  });
});

// -----------------------------------------------------------------------------
// Student Routes
// -----------------------------------------------------------------------------

// POST /api/students/register -> Save new student demographics and facial embeddings array
app.post('/api/students/register', async (req, res) => {
  try {
    const { id, name, class_assigned, face_encoding } = req.body;

    if (!id || !name || !class_assigned || !face_encoding) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: id, name, class_assigned, and face_encoding are required.'
      });
    }

    // Validate face_encoding array (expected 128 elements)
    const encodingArray = Array.isArray(face_encoding)
      ? face_encoding
      : (typeof face_encoding === 'string' ? JSON.parse(face_encoding) : null);

    if (!Array.isArray(encodingArray) || encodingArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'face_encoding must be a valid non-empty array of floats (typically 128 dimensions).'
      });
    }

    const student = await db.registerStudent({
      id,
      name,
      class_assigned,
      face_encoding: encodingArray
    });

    return res.status(201).json({
      success: true,
      message: `Student '${name}' (${id}) successfully registered.`,
      student: {
        id: student.id,
        name: student.name,
        class_assigned: student.class_assigned,
        embedding_dimensions: encodingArray.length
      }
    });
  } catch (err) {
    console.error('Error registering student:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/students -> Fetch all students with face_encodings (Used by Raspberry Pi Cache)
app.get('/api/students', async (req, res) => {
  try {
    const students = await db.getAllStudents();
    return res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/students/report/:id -> Fetch historical logs for a given student ID
app.get('/api/students/report/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Student ID parameter is required' });
    }

    const report = await db.getStudentReport(studentId);
    return res.json({
      success: true,
      ...report
    });
  } catch (err) {
    console.error(`Error fetching report for ${req.params.id}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------------
// Attendance Routes
// -----------------------------------------------------------------------------

// GET /api/attendance/class/:className -> Fetch attendance records for a class on the current date
app.get('/api/attendance/class/:className', async (req, res) => {
  try {
    const { className } = req.params;
    const { date } = req.query; // optional YYYY-MM-DD

    const result = await db.getClassAttendance(className, date);
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error(`Error fetching class attendance for ${req.params.className}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/attendance/mark -> Endpoint for the Pi or Teacher to insert/update an attendance row
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { student_id, class_name, status = 'Present', timestamp } = req.body;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        error: 'student_id is required to mark attendance.'
      });
    }

    const record = await db.markAttendance({
      student_id,
      class_name,
      status,
      timestamp
    });

    return res.status(201).json({
      success: true,
      message: `Attendance recorded: ${student_id} is ${status}`,
      record
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/attendance/update -> Secure endpoint for teachers to edit a log row
app.put('/api/attendance/update', async (req, res) => {
  try {
    const { id, student_id, class_name, status, timestamp } = req.body;

    if (!id && (!student_id || !class_name)) {
      return res.status(400).json({
        success: false,
        error: 'Provide either record id or (student_id and class_name) to update attendance.'
      });
    }

    const updated = await db.updateAttendance({
      id,
      student_id,
      class_name,
      status,
      timestamp
    });

    return res.json({
      success: true,
      message: 'Attendance record updated successfully.',
      record: updated
    });
  } catch (err) {
    console.error('Error updating attendance record:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------------
// Serve Static Frontend Assets & SPA Client-Side Routing
// -----------------------------------------------------------------------------
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// Catch-all for React Single Page Application (SPA)
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found.' });
  }
  const indexHtml = path.join(frontendDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send('Smart Attendance System API is running. Frontend build in /frontend/dist.');
    }
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Smart Attendance API Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`💾 Mode: ${db.isUsingSupabase() ? 'Supabase PostgreSQL' : 'Local In-Memory Mock'}`);
  console.log(`====================================================`);
});

module.exports = app;

