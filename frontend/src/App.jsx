import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AttendanceMatrix from './components/AttendanceMatrix';
import StudentDirectory from './components/StudentDirectory';
import ClassRegistry from './components/ClassRegistry';
import LaptopRegistration from './components/LaptopRegistration';
import AutoScheduleBanner from './components/AutoScheduleBanner';
import TimetableScheduleView from './components/TimetableScheduleView';
import ClassReportsView from './components/ClassReportsView';
import { 
  INITIAL_CLASSES, 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE_LOGS 
} from './data/initialData';

export default function App() {
  // Navigation: 'matrix' | 'timetable' | 'reports' | 'students' | 'classes' | 'biometrics'
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

  // Check Backend Health
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch {
      setSystemStatus({
        status: 'local',
        database: 'IN-MEMORY STORE'
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 12000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------------------------
  // Student CRUD Operations
  // ---------------------------------------------------------------------------
  const handleAddStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleEditStudent = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (studentId) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleToggleStudentStatus = (studentId) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    }));
  };

  // ---------------------------------------------------------------------------
  // Class CRUD Operations
  // ---------------------------------------------------------------------------
  const handleCreateClass = (newClass) => {
    setClasses(prev => [...prev, newClass]);
    setSelectedClassId(newClass.id);
  };

  const handleEditClass = (updatedClass) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleToggleArchiveClass = (classId) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, isArchived: !c.isArchived };
      }
      return c;
    }));
  };

  const handleDeleteClass = (classId) => {
    if (classId === 'daiml') return; // Protect master class
    setClasses(prev => prev.filter(c => c.id !== classId));
    if (selectedClassId === classId) {
      setSelectedClassId('daiml');
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
          student_id: currentStudent.rollNumber,
          class_name: selectedClass?.code || 'DAIML',
          status: newStatus,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {/* fallback gracefully to local store */});
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
    <div className="min-h-screen flex flex-col bg-[#070709] text-white selection:bg-[#ccff00] selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Subtle Architectural Backdrops */}
      <div className="fixed inset-0 pointer-events-none bg-architectural-grid opacity-60 z-0" />
      <div className="fixed inset-0 pointer-events-none bg-ambient-noise z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Global Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedClass={selectedClass}
          systemStatus={systemStatus}
        />

        {/* Real-time IST Auto-Scheduler & Active Period Telemetry Banner */}
        <AutoScheduleBanner 
          onSelectSlotForAttendance={handleSelectSlotForAttendance} 
        />

        {/* Dynamic Portal Viewports */}
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

          {activeTab === 'biometrics' && (
            <LaptopRegistration
              onStudentRegistered={() => {
                checkHealth();
              }}
            />
          )}
        </main>

        {/* Minimalist Architectural Footer */}
        <footer className="border-t border-white/[0.08] bg-[#070709]/80 backdrop-blur-md py-8">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-none rotate-45 shadow-[0_0_6px_#ccff00]" />
              <span className="text-neutral-400">Aura Management Studio</span>
              <span>•</span>
              <span>Class: {selectedClass?.code}</span>
              <span>•</span>
              <span>Subjects: {selectedClass?.subjects?.length || 0} Mapped</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-600">
              <span>DAIML CURRICULUM ENFORCED</span>
              <span>•</span>
              <span className="text-neutral-400">VIBRANT MINIMALISM V3</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
