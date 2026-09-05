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
  classes: [
    {
      id: 'daiml',
      code: 'DAIML',
      name: 'Diploma in Artificial Intelligence & Machine Learning',
      department: 'Computer Science & AI',
      semester: 'Semester III',
      academicYear: '2026-2027',
      isArchived: false,
      subjects: [
        { id: 'em-ai', code: '24AI31T', name: 'Engineering Mathematics for AI', coordinator: 'Mr. Manojkumar N S', hasLab: false },
        { id: 'python', code: '24AI32T', name: 'Python Programming', coordinator: 'Ms. Shreya', hasLab: true },
        { id: 'cpp', code: '24AI33T', name: "OOP's with C++", coordinator: 'Ms. Priyanka', hasLab: true },
        { id: 'mc-es', code: '24AI34T', name: 'Introduction to MC & ES', coordinator: 'Ms. Umme Taskeen', hasLab: true },
        { id: 'dbms', code: '24AI38P', name: 'DBMS Lab', coordinator: 'Mr. Ramanna / Ms. Priyanka', hasLab: true }
      ]
    }
  ],
  students: [
    {
      id: '24DAIML01',
      name: 'Aditya Sharma',
      class_assigned: 'DAIML',
      face_data: null,
      face_encoding: Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.1) * 0.05),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: '24DAIML02',
      name: 'Ananya Rao',
      class_assigned: 'DAIML',
      face_data: null,
      face_encoding: Array.from({ length: 128 }, (_, i) => Math.cos(i * 0.1) * 0.05),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: '24DAIML03',
      name: 'Bhavana K',
      class_assigned: 'DAIML',
      face_data: null,
      face_encoding: Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.2) * 0.04),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ],
  attendance: [
    {
      id: 'att-1',
      student_id: '24DAIML01',
      class_name: 'DAIML',
      timestamp: new Date().toISOString(),
      status: 'Present'
    },
    {
      id: 'att-2',
      student_id: '24DAIML02',
      class_name: 'DAIML',
      timestamp: new Date().toISOString(),
      status: 'Present'
    },
    {
      id: 'att-3',
      student_id: '24DAIML03',
      class_name: 'DAIML',
      timestamp: new Date().toISOString(),
      status: 'Late'
    }
  ]
};

const db = {
  isUsingSupabase: () => Boolean(supabase),

  // 1. Get all students (optional class filter)
  getAllStudents: async (classFilter) => {
    if (supabase) {
      try {
        let query = supabase.from('students').select('*').order('id', { ascending: true });
        if (classFilter) {
          query = query.eq('class_assigned', classFilter);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to localStore:', err.message);
      }
    }
    if (classFilter) {
      return localStore.students.filter(s => s.class_assigned.toLowerCase() === classFilter.toLowerCase());
    }
    return localStore.students;
  },

  // 2. Get student by ID
  getStudentById: async (id) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getStudentById failed:', err.message);
      }
    }
    return localStore.students.find((s) => s.id.toLowerCase() === id.toLowerCase()) || null;
  },

  // 3. Register or update student
  registerStudent: async ({ id, name, class_assigned, face_data, face_encoding }) => {
    if (!id || !name) {
      throw new Error('Missing required fields: id, name');
    }

    // Ensure 128-d face_encoding exists for mathematical operations
    let encodingArray = face_encoding;
    if (typeof encodingArray === 'string') {
      try { encodingArray = JSON.parse(encodingArray); } catch { encodingArray = null; }
    }
    if (!Array.isArray(encodingArray) || encodingArray.length === 0) {
      encodingArray = Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.15) * 0.05);
    }

    const payload = {
      id: String(id).trim(),
      name: String(name).trim(),
      class_assigned: String(class_assigned || 'DAIML').trim(),
      face_data: face_data || null,
      face_encoding: encodingArray,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase upsert student failed, updating localStore:', err.message);
      }
    }

    const existingIdx = localStore.students.findIndex((s) => s.id.toLowerCase() === payload.id.toLowerCase());
    if (existingIdx >= 0) {
      localStore.students[existingIdx] = { ...localStore.students[existingIdx], ...payload };
      return localStore.students[existingIdx];
    } else {
      localStore.students.unshift(payload);
      return payload;
    }
  },

  // 4. Delete Student
  deleteStudent: async (id) => {
    if (supabase) {
      try {
        await supabase.from('attendance').delete().eq('student_id', id);
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) console.warn('Supabase deleteStudent error:', error.message);
      } catch (err) {
        console.warn('Supabase deleteStudent failed:', err.message);
      }
    }
    localStore.students = localStore.students.filter(s => s.id.toLowerCase() !== id.toLowerCase());
    localStore.attendance = localStore.attendance.filter(a => a.student_id.toLowerCase() !== id.toLowerCase());
    return { id, deleted: true };
  },

  // 5. Update Student
  updateStudent: async (id, updates) => {
    const student = await db.getStudentById(id);
    if (!student) throw new Error(`Student with id '${id}' not found`);
    const merged = { ...student, ...updates, id: student.id };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateStudent error:', err.message);
      }
    }

    const idx = localStore.students.findIndex(s => s.id.toLowerCase() === id.toLowerCase());
    if (idx >= 0) {
      localStore.students[idx] = merged;
      return localStore.students[idx];
    }
    return merged;
  },

  // 6. Student chronological attendance report
  getStudentReport: async (studentId) => {
    if (supabase) {
      try {
        const { data: student } = await supabase
          .from('students')
          .select('id, name, class_assigned')
          .eq('id', studentId)
          .maybeSingle();

        const { data: records } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', studentId)
          .order('timestamp', { ascending: false });

        return {
          student: student || { id: studentId, name: 'Unknown', class_assigned: 'N/A' },
          records: records || []
        };
      } catch (err) {
        console.warn('Supabase getStudentReport fallback:', err.message);
      }
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

  // 7. Get attendance records for a class on current/specified date
  getClassAttendance: async (className, dateStr) => {
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
      try {
        const { data: students } = await supabase
          .from('students')
          .select('id, name, class_assigned')
          .eq('class_assigned', className);

        const { data: logs } = await supabase
          .from('attendance')
          .select('*')
          .eq('class_name', className)
          .gte('timestamp', startOfDay.toISOString())
          .lte('timestamp', endOfDay.toISOString())
          .order('timestamp', { ascending: false });

        return {
          class_name: className,
          date: startOfDay.toISOString().split('T')[0],
          students: students || [],
          logs: logs || []
        };
      } catch (err) {
        console.warn('Supabase getClassAttendance fallback:', err.message);
      }
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

  // 8. Mark attendance
  markAttendance: async ({ student_id, class_name, status = 'Present', timestamp }) => {
    if (!student_id) {
      throw new Error('student_id is required');
    }

    const effectiveTime = timestamp ? new Date(timestamp) : new Date();
    let assignedClass = class_name;
    if (!assignedClass) {
      const student = await db.getStudentById(student_id);
      assignedClass = student ? student.class_assigned : 'General';
    }

    const record = {
      id: crypto.randomUUID(),
      student_id: String(student_id).trim(),
      class_name: String(assignedClass).trim(),
      status: String(status).trim(),
      timestamp: effectiveTime.toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .insert([record])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase markAttendance insert fallback:', err.message);
      }
    }

    localStore.attendance.unshift(record);
    return record;
  },

  // 9. Update attendance record
  updateAttendance: async ({ id, student_id, class_name, status, timestamp }) => {
    const updates = {};
    if (status) updates.status = status;
    if (timestamp) updates.timestamp = new Date(timestamp).toISOString();

    if (supabase) {
      try {
        let query = supabase.from('attendance');
        if (id) {
          query = query.update(updates).eq('id', id);
        } else {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          query = query.update(updates).eq('student_id', student_id).eq('class_name', class_name).gte('timestamp', startOfDay.toISOString());
        }

        const { data, error } = await query.select();
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {
        console.warn('Supabase updateAttendance fallback:', err.message);
      }
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
      const newEntry = {
        id: id || crypto.randomUUID(),
        student_id: student_id,
        class_name: class_name || 'DAIML',
        timestamp: updates.timestamp || new Date().toISOString(),
        status: updates.status || 'Present'
      };
      localStore.attendance.unshift(newEntry);
      return newEntry;
    }
  },

  // 10. Class Management
  getAllClasses: async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('classes').select('*').order('code', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getAllClasses fallback:', err.message);
      }
    }
    return localStore.classes;
  },

  saveClass: async (classData) => {
    if (!classData.id || !classData.code) {
      throw new Error('Class id and code are required');
    }
    const payload = {
      ...classData,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase saveClass fallback:', err.message);
      }
    }

    const idx = localStore.classes.findIndex(c => c.id === payload.id);
    if (idx >= 0) {
      localStore.classes[idx] = payload;
      return localStore.classes[idx];
    } else {
      localStore.classes.push(payload);
      return payload;
    }
  },

  deleteClass: async (id) => {
    if (id === 'daiml') {
      throw new Error('Master class DAIML cannot be deleted');
    }
    if (supabase) {
      try {
        await supabase.from('classes').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteClass fallback:', err.message);
      }
    }
    localStore.classes = localStore.classes.filter(c => c.id !== id);
    return { id, deleted: true };
  }
};

module.exports = db;
