const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// High-Capacity Middleware for Base64 Face Scans & JSON Payloads
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Helper for standardized API responses
const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

// -----------------------------------------------------------------------------
// API Router Setup (Handles both /api/* and root mount for Vercel serverless)
// -----------------------------------------------------------------------------
const apiRouter = express.Router();

// Health & System Info
apiRouter.get('/health', (req, res) => {
  sendResponse(res, 200, true, 'Smart Attendance API is healthy and operational.', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: db.isUsingSupabase() ? 'Supabase PostgreSQL' : 'Local In-Memory Mode',
    version: '2.0.0-crimson'
  });
});

// -----------------------------------------------------------------------------
// Student Endpoints
// -----------------------------------------------------------------------------

// GET /students -> Fetch all students (with optional class query)
apiRouter.get('/students', async (req, res, next) => {
  try {
    const { class_assigned } = req.query;
    const students = await db.getAllStudents(class_assigned);
    sendResponse(res, 200, true, `Fetched ${students.length} student records.`, students);
  } catch (err) {
    next(err);
  }
});

// GET /students/:id -> Get single student
apiRouter.get('/students/:id', async (req, res, next) => {
  try {
    const student = await db.getStudentById(req.params.id);
    if (!student) {
      return sendResponse(res, 404, false, `Student with id '${req.params.id}' not found.`);
    }
    sendResponse(res, 200, true, 'Student record retrieved.', student);
  } catch (err) {
    next(err);
  }
});

// POST /students & POST /students/register -> Register candidate with inline face capture
const handleStudentRegister = async (req, res, next) => {
  try {
    const { id, usn, name, class_assigned, batch, face_data, faceData, face_encoding } = req.body;
    const studentId = id || usn;
    const studentClass = class_assigned || batch || 'DAIML';
    const facePayload = face_data || faceData;

    if (!studentId || !name) {
      return sendResponse(res, 400, false, 'Validation failed: student ID (USN) and Name are required.');
    }

    const student = await db.registerStudent({
      id: studentId,
      name,
      class_assigned: studentClass,
      face_data: facePayload,
      face_encoding
    });

    sendResponse(res, 201, true, `Student '${name}' (${studentId}) registered successfully.`, student);
  } catch (err) {
    next(err);
  }
};

apiRouter.post('/students', handleStudentRegister);
apiRouter.post('/students/register', handleStudentRegister);

// PUT /students/:id -> Update student metadata or active status
apiRouter.put('/students/:id', async (req, res, next) => {
  try {
    const updated = await db.updateStudent(req.params.id, req.body);
    sendResponse(res, 200, true, `Student '${req.params.id}' updated successfully.`, updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /students/:id -> Delete student and related attendance
apiRouter.delete('/students/:id', async (req, res, next) => {
  try {
    const result = await db.deleteStudent(req.params.id);
    sendResponse(res, 200, true, `Student '${req.params.id}' removed successfully.`, result);
  } catch (err) {
    next(err);
  }
});

// GET /students/report/:id -> Historical logs for student
apiRouter.get('/students/report/:id', async (req, res, next) => {
  try {
    const report = await db.getStudentReport(req.params.id);
    sendResponse(res, 200, true, `Report generated for student '${req.params.id}'.`, report);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// Class Management Endpoints
// -----------------------------------------------------------------------------

// GET /classes -> List all academic classes
apiRouter.get('/classes', async (req, res, next) => {
  try {
    const classes = await db.getAllClasses();
    sendResponse(res, 200, true, `Fetched ${classes.length} class divisions.`, classes);
  } catch (err) {
    next(err);
  }
});

// POST /classes -> Create or update class
apiRouter.post('/classes', async (req, res, next) => {
  try {
    const { id, code, name } = req.body;
    if (!id || !code) {
      return sendResponse(res, 400, false, 'Validation failed: class id and code are required.');
    }
    const saved = await db.saveClass(req.body);
    sendResponse(res, 201, true, `Class division '${code}' saved successfully.`, saved);
  } catch (err) {
    next(err);
  }
});

// DELETE /classes/:id -> Delete custom class
apiRouter.delete('/classes/:id', async (req, res, next) => {
  try {
    if (req.params.id.toLowerCase() === 'daiml') {
      return sendResponse(res, 403, false, 'Master class DAIML is protected and cannot be deleted.');
    }
    const result = await db.deleteClass(req.params.id);
    sendResponse(res, 200, true, `Class '${req.params.id}' removed successfully.`, result);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// Attendance Endpoints
// -----------------------------------------------------------------------------

// GET /attendance/class/:className -> Class attendance records for given date
apiRouter.get('/attendance/class/:className', async (req, res, next) => {
  try {
    const { className } = req.params;
    const { date } = req.query;
    const result = await db.getClassAttendance(className, date);
    sendResponse(res, 200, true, `Attendance retrieved for ${className}.`, result);
  } catch (err) {
    next(err);
  }
});

// POST /attendance/mark -> Mark attendance for student
apiRouter.post('/attendance/mark', async (req, res, next) => {
  try {
    const { student_id, usn, class_name, status = 'Present', timestamp } = req.body;
    const stuId = student_id || usn;
    if (!stuId) {
      return sendResponse(res, 400, false, 'Validation failed: student_id is required.');
    }

    const record = await db.markAttendance({
      student_id: stuId,
      class_name,
      status,
      timestamp
    });

    sendResponse(res, 201, true, `Attendance marked: ${stuId} is ${status}.`, record);
  } catch (err) {
    next(err);
  }
});

// PUT /attendance/update -> Update or override attendance entry
apiRouter.put('/attendance/update', async (req, res, next) => {
  try {
    const { id, student_id, class_name, status, timestamp } = req.body;
    if (!id && (!student_id || !class_name)) {
      return sendResponse(res, 400, false, 'Provide record id or (student_id and class_name).');
    }

    const updated = await db.updateAttendance({
      id,
      student_id,
      class_name,
      status,
      timestamp
    });

    sendResponse(res, 200, true, 'Attendance record updated successfully.', updated);
  } catch (err) {
    next(err);
  }
});

// Mount Router on both '/api' and '/' for seamless routing in all hosting modes
app.use('/api', apiRouter);
app.use('/', apiRouter);

// -----------------------------------------------------------------------------
// Serve Static Frontend Assets & SPA Client-Side Routing
// -----------------------------------------------------------------------------
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// Catch-all for React Single Page Application (SPA)
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return sendResponse(res, 404, false, 'API endpoint not found.');
  }
  const indexHtml = path.join(frontendDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send('Smart Attendance System API is running. Frontend build in /frontend/dist.');
    }
  });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error('[API ERROR]', err);
  sendResponse(res, 500, false, err.message || 'Internal Server Error occurred.');
});

// Start Standalone Express Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Smart Attendance API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 Mode: ${db.isUsingSupabase() ? 'Supabase PostgreSQL' : 'Local In-Memory Mock'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
