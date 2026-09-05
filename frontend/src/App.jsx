import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AttendanceMatrix from './components/AttendanceMatrix';
import TimetableScheduleView from './components/TimetableScheduleView';
import ClassReportsView from './components/ClassReportsView';
import StudentDirectory from './components/StudentDirectory';
import ClassRegistry from './components/ClassRegistry';
import { 
  INITIAL_CLASSES, 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE_LOGS 
} from './data/initialData';

export default function App() {
  // 5 Streamlined Tabs: 'matrix' | 'timetable' | 'reports' | 'students' | 'classes'
  const [activeTab, setActiveTab] = useState('matrix');
  const [activeSlotToMark, setActiveSlotToMark] = useState(null);

  // Core Dynamic Data State
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('aura_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [selectedClassId, setSelectedClassId] = useState('daiml');

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('aura_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const saved = localStorage.getItem('aura_attendance_logs');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_LOGS;
  });

  const [systemStatus, setSystemStatus] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aura_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('aura_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('aura_attendance_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  // Check Backend Health & Sync Initial Data
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        setSystemStatus(json.data || json);
      }
    } catch {
      setSystemStatus({
        status: 'local',
        database: 'Local In-Memory Cache'
      });
    }
  }, []);

  const syncStudentsFromBackend = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const json = await res.json();
        const serverStudents = json.data || json.students || [];
        if (Array.isArray(serverStudents) && serverStudents.length > 0) {
          setStudents(prev => {
            // Merge server students preserving local edits
            const merged = [...prev];
            serverStudents.forEach(ss => {
              const idx = merged.findIndex(s => s.id === ss.id || (s.rollNumber && s.rollNumber === ss.id));
              if (idx === -1) {
                merged.push({
                  id: ss.id,
                  rollNumber: ss.id,
                  name: ss.name,
                  classId: (ss.class_assigned || 'daiml').toLowerCase(),
                  class_assigned: ss.class_assigned || 'DAIML',
                  faceData: ss.face_data || null,
                  face_data: ss.face_data || null,
                  email: `${ss.id.toLowerCase()}@gttc.ac.in`,
                  isActive: true
                });
              }
            });
            return merged;
          });
        }
      }
    } catch {
      // Graceful local cache fallback
    }
  }, []);

  useEffect(() => {
    checkHealth();
    syncStudentsFromBackend();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth, syncStudentsFromBackend]);

  // ---------------------------------------------------------------------------
  // Student CRUD Operations (with API Persistence)
  // ---------------------------------------------------------------------------
  const handleAddStudent = async (newStudent) => {
    // 1. Optimistic state update
    setStudents(prev => [newStudent, ...prev]);

    // 2. Persist to backend
    try {
      await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newStudent.rollNumber || newStudent.id,
          name: newStudent.name,
          class_assigned: selectedClass?.code || 'DAIML',
          face_data: newStudent.faceData || newStudent.face_data || null
        })
      });
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err.message);
    }
  };

  const handleEditStudent = async (updatedStudent) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    try {
      await fetch(`/api/students/${encodeURIComponent(updatedStudent.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });
    } catch {
      // Fallback
    }
  };

  const handleDeleteStudent = async (studentId) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    try {
      await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
        method: 'DELETE'
      });
    } catch {
      // Fallback
    }
  };

  const handleToggleStudentStatus = async (studentId) => {
    let newStatus = true;
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        newStatus = !s.isActive;
        return { ...s, isActive: newStatus };
      }
      return s;
    }));
    try {
      await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
    } catch {
      // Fallback
    }
  };

  // ---------------------------------------------------------------------------
  // Class CRUD Operations
  // ---------------------------------------------------------------------------
  const handleCreateClass = async (newClass) => {
    setClasses(prev => [...prev, newClass]);
    setSelectedClassId(newClass.id);
    try {
      await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });
    } catch {
      // Fallback
    }
  };

  const handleEditClass = async (updatedClass) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
    try {
      await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClass)
      });
    } catch {
      // Fallback
    }
  };

  const handleToggleArchiveClass = (classId) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, isArchived: !c.isArchived };
      }
      return c;
    }));
  };

  const handleDeleteClass = async (classId) => {
    if (classId === 'daiml') return;
    setClasses(prev => prev.filter(c => c.id !== classId));
    if (selectedClassId === classId) {
      setSelectedClassId('daiml');
    }
    try {
      await fetch(`/api/classes/${encodeURIComponent(classId)}`, {
        method: 'DELETE'
      });
    } catch {
      // Fallback
    }
  };

  // ---------------------------------------------------------------------------
  // Attendance Mutations
  // ---------------------------------------------------------------------------
  const handleUpdateAttendanceRecord = (sessionKey, studentId, newStatus) => {
    setAttendanceLogs(prev => {
      const existingSession = prev[sessionKey] || {};
      return {
        ...prev,
        [sessionKey]: {
          ...existingSession,
          [studentId]: newStatus
        }
      };
    });

    // Fire non-blocking sync to backend if connected
    const currentStudent = students.find(s => s.id === studentId);
    if (currentStudent) {
      fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentStudent.rollNumber || currentStudent.id,
          class_name: selectedClass?.code || 'DAIML',
          status: newStatus,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {/* fallback gracefully */});
    }
  };

  const handleBulkUpdateAttendance = (sessionKey, bulkMap) => {
    setAttendanceLogs(prev => {
      const existingSession = prev[sessionKey] || {};
      return {
        ...prev,
        [sessionKey]: {
          ...existingSession,
          ...bulkMap
        }
      };
    });
  };

  const handleSelectSlotForAttendance = (slot) => {
    setActiveSlotToMark(slot);
    setActiveTab('matrix');
  };

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0B0D] text-white selection:bg-[#FF2A4B] selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Crimson Cybernetic Atmospheric Backdrops */}
      <div className="fixed inset-0 pointer-events-none bg-cyber-grid opacity-50 z-0" />
      <div className="fixed inset-0 pointer-events-none bg-ambient-crimson z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Global Navigation Bar (5 Streamlined Tabs) */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedClass={selectedClass}
          systemStatus={systemStatus}
        />

        {/* Dynamic Viewports */}
        <main className="flex-1">
          {activeTab === 'matrix' && (
            <AttendanceMatrix
              classes={classes}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              students={students}
              attendanceLogs={attendanceLogs}
              onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
              onBulkUpdateAttendance={handleBulkUpdateAttendance}
              activeSlotToMark={activeSlotToMark}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableScheduleView 
              onSelectSlotForAttendance={handleSelectSlotForAttendance}
            />
          )}

          {activeTab === 'reports' && (
            <ClassReportsView
              attendanceLogs={attendanceLogs}
              students={students}
              classes={classes}
              selectedClassId={selectedClassId}
            />
          )}

          {activeTab === 'students' && (
            <StudentDirectory
              classes={classes}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              students={students}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onToggleStudentStatus={handleToggleStudentStatus}
            />
          )}

          {activeTab === 'classes' && (
            <ClassRegistry
              classes={classes}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              students={students}
              onCreateClass={handleCreateClass}
              onEditClass={handleEditClass}
              onToggleArchiveClass={handleToggleArchiveClass}
              onDeleteClass={handleDeleteClass}
            />
          )}
        </main>

        {/* Minimalist Cybernetic Footer */}
        <footer className="border-t border-[#2E1C22] bg-[#0D0B0D]/90 backdrop-blur-md py-7">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[#B3A2A8] uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[#FF2A4B] rounded-none rotate-45 shadow-[0_0_6px_#FF2A4B]" />
              <span className="text-white font-bold">Aura Cybernetic Attendance Studio</span>
              <span>•</span>
              <span>Class: {selectedClass?.code}</span>
              <span>•</span>
              <span>Subjects: {selectedClass?.subjects?.length || 5} Mapped</span>
            </div>

            <div className="flex items-center gap-4 text-[#7A6970]">
              <span>GTTC DEVANAHALLI • STU - 35</span>
              <span>•</span>
              <span className="text-[#FF2A4B]">CRIMSON CYBERNETIC V4</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
