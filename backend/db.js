const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_KEY &&
  !SUPABASE_URL.includes('your-project-ref') &&
  SUPABASE_URL.startsWith('http')
);

let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Connected to Supabase PostgreSQL at:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Running in In-Memory Local Database Mode (Supabase credentials not configured in backend/.env).');
}

// In-Memory fallback store for immediate out-of-the-box development & testing
const localStore = {
  students: [
    {
      id: 'STU101',
      name: 'Sarah Jenkins',
      class_assigned: 'CS101',
      // Sample 128-dimensional embedding dummy for verification
      face_encoding: Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.1) * 0.05),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'STU102',
      name: 'Alex Rivera',
      class_assigned: 'CS101',
      face_encoding: Array.from({ length: 128 }, (_, i) => Math.cos(i * 0.1) * 0.05),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'STU103',
      name: 'Priya Sharma',
      class_assigned: 'CS101',
      face_encoding: Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.2) * 0.04),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'STU201',
      name: 'Marcus Vance',
      class_assigned: 'EE200',
      face_encoding: Array.from({ length: 128 }, (_, i) => Math.cos(i * 0.2) * 0.04),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  attendance: [
    {
      id: 'att-1',
      student_id: 'STU101',
      class_name: 'CS101',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'Present'
    },
    {
      id: 'att-2',
      student_id: 'STU101',
      class_name: 'CS101',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: 'Present'
    },
    {
      id: 'att-3',
      student_id: 'STU102',
      class_name: 'CS101',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: 'Late'
    }
  ]
};

const db = {
  isUsingSupabase: () => Boolean(supabase),

  // 1. Get all students (useful for Raspberry Pi local caching)
  getAllStudents: async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data;
    }
    return localStore.students;
  },

  // 2. Get student by ID
  getStudentById: async (id) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    return localStore.students.find((s) => s.id.toLowerCase() === id.toLowerCase()) || null;
  },

  // 3. Register or update student
  registerStudent: async ({ id, name, class_assigned, face_encoding }) => {
    if (!id || !name || !class_assigned || !face_encoding) {
      throw new Error('Missing required fields: id, name, class_assigned, face_encoding');
    }

    const payload = {
      id: String(id).trim(),
      name: String(name).trim(),
      class_assigned: String(class_assigned).trim(),
      face_encoding: typeof face_encoding === 'string' ? JSON.parse(face_encoding) : face_encoding,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const existingIdx = localStore.students.findIndex((s) => s.id.toLowerCase() === payload.id.toLowerCase());
    if (existingIdx >= 0) {
      localStore.students[existingIdx] = { ...localStore.students[existingIdx], ...payload };
      return localStore.students[existingIdx];
    } else {
      localStore.students.push(payload);
      return payload;
    }
  },

  // 4. Student chronological attendance report
  getStudentReport: async (studentId) => {
    if (supabase) {
      const { data: student, error: stuErr } = await supabase
        .from('students')
        .select('id, name, class_assigned')
        .eq('id', studentId)
        .maybeSingle();
      if (stuErr) throw stuErr;

      const { data: records, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('timestamp', { ascending: false });
      if (attErr) throw attErr;

      return {
        student: student || { id: studentId, name: 'Unknown', class_assigned: 'N/A' },
        records: records || []
      };
    }

    const student = localStore.students.find((s) => s.id.toLowerCase() === studentId.toLowerCase());
    const records = localStore.attendance
      .filter((a) => a.student_id.toLowerCase() === studentId.toLowerCase())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      student: student || { id: studentId, name: 'Unknown', class_assigned: 'N/A' },
      records
    };
  },

  // 5. Get attendance records for a class on current/specified date
  getClassAttendance: async (className, dateStr) => {
    // Parse dateStr (YYYY-MM-DD) into safe local midnight boundaries to prevent UTC day-shift
    let startOfDay, endOfDay;
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    if (supabase) {
      // Get all students enrolled in class
      const { data: students, error: stuErr } = await supabase
        .from('students')
        .select('id, name, class_assigned')
        .eq('class_assigned', className);
      if (stuErr) throw stuErr;

      // Get attendance entries for that class today
      const { data: logs, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_name', className)
        .gte('timestamp', startOfDay.toISOString())
        .lte('timestamp', endOfDay.toISOString())
        .order('timestamp', { ascending: false });
      if (attErr) throw attErr;

      return {
        class_name: className,
        date: startOfDay.toISOString().split('T')[0],
        students: students || [],
        logs: logs || []
      };
    }

    const students = localStore.students.filter(
      (s) => s.class_assigned.toLowerCase() === className.toLowerCase()
    );

    const logs = localStore.attendance.filter((a) => {
      if (a.class_name.toLowerCase() !== className.toLowerCase()) return false;
      const logTime = new Date(a.timestamp);
      return logTime >= startOfDay && logTime <= endOfDay;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      class_name: className,
      date: startOfDay.toISOString().split('T')[0],
      students,
      logs
    };
  },

  // 6. Mark attendance (used by Raspberry Pi & Teacher)
  markAttendance: async ({ student_id, class_name, status = 'Present', timestamp }) => {
    if (!student_id) {
      throw new Error('student_id is required');
    }

    const effectiveTime = timestamp ? new Date(timestamp) : new Date();
    
    // Check student existence to obtain class_name if not provided
    let assignedClass = class_name;
    if (!assignedClass) {
      const student = await db.getStudentById(student_id);
      if (student) {
        assignedClass = student.class_assigned;
      } else {
        assignedClass = 'General';
      }
    }

    const payload = {
      id: crypto.randomUUID(),
      student_id: String(student_id).trim(),
      class_name: assignedClass,
      timestamp: effectiveTime.toISOString(),
      status: status || 'Present'
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    localStore.attendance.push(payload);
    return payload;
  },

  // 7. Update an existing attendance record (Teacher override)
  updateAttendance: async ({ id, status, timestamp, student_id, class_name }) => {
    if (!id && (!student_id || !class_name)) {
      throw new Error('Record id or (student_id, class_name) is required to update');
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (timestamp !== undefined) updates.timestamp = new Date(timestamp).toISOString();

    if (supabase) {
      let query = supabase.from('attendance').update(updates);
      if (id) {
        query = query.eq('id', id);
      } else {
        // Find for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        query = query.eq('student_id', student_id).eq('class_name', class_name).gte('timestamp', startOfDay.toISOString());
      }

      const { data, error } = await query.select();
      if (error) throw error;
      if (data && data.length > 0) {
        return data[0];
      }
      // If no existing record was found to update today, insert a new record
      const newRecord = {
        id: id || crypto.randomUUID(),
        student_id: student_id,
        class_name: class_name || 'General',
        timestamp: updates.timestamp || new Date().toISOString(),
        status: updates.status || 'Present'
      };
      const { data: inserted, error: insertErr } = await supabase
        .from('attendance')
        .insert([newRecord])
        .select()
        .single();
      if (insertErr) throw insertErr;
      return inserted;
    }

    let record = null;
    if (id) {
      record = localStore.attendance.find((a) => a.id === id);
    } else {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      record = localStore.attendance.find(
        (a) => a.student_id === student_id && a.class_name === class_name && new Date(a.timestamp) >= startOfDay
      );
    }

    if (record) {
      Object.assign(record, updates);
      return record;
    } else {
      // If record didn't exist for today yet, create it!
      const newEntry = {
        id: id || crypto.randomUUID(),
        student_id: student_id,
        class_name: class_name || 'General',
        timestamp: updates.timestamp || new Date().toISOString(),
        status: updates.status || 'Present'
      };
      localStore.attendance.push(newEntry);
      return newEntry;
    }
  }
};

module.exports = db;

