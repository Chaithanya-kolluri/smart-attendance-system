import React, { useState, useEffect } from 'react';
import { 
  CheckCheck, 
  XSquare, 
  BookOpen, 
  Info
} from 'lucide-react';

export default function AttendanceMatrix({ 
  classes, 
  selectedClassId, 
  setSelectedClassId, 
  students, 
  attendanceLogs, 
  onUpdateAttendanceRecord,
  onBulkUpdateAttendance 
}) {
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classSubjects = currentClass?.subjects || [];

  // Subject and Session Type State
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => classSubjects[0]?.id || 'em-ai');
  const [sessionType, setSessionType] = useState('Theory'); // 'Theory' | 'Lab'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Present' | 'Absent' | 'Late'

  // Current Subject Object
  const currentSubject = classSubjects.find(s => s.id === selectedSubjectId) || classSubjects[0];

  // UI Constraint: When EM for AI is active, Lab Session is forbidden.
  useEffect(() => {
    if (currentSubject && !currentSubject.hasLab && sessionType === 'Lab') {
      setSessionType('Theory');
    }
  }, [currentSubject, sessionType]);

  // When class changes, reset subject if necessary
  useEffect(() => {
    if (classSubjects.length > 0 && !classSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(classSubjects[0].id);
      setSessionType('Theory');
    }
  }, [selectedClassId, classSubjects, selectedSubjectId]);

  // Unique session key for current matrix view
  const sessionKey = `${currentClass?.id}_${selectedSubjectId}_${sessionType}_${selectedDate}`;
  const currentSessionLogs = attendanceLogs[sessionKey] || {};

  // Filter students enrolled in current class
  const enrolledStudents = students.filter(s => s.classId === currentClass?.id);

  // Compute Session Metrics
  const activeEnrolled = enrolledStudents.filter(s => s.isActive);
  const totalStudents = activeEnrolled.length;
  
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  activeEnrolled.forEach(student => {
    const status = currentSessionLogs[student.id] || 'Absent';
    if (status === 'Present') presentCount++;
    else if (status === 'Late') lateCount++;
    else absentCount++;
  });

  const turnoutPercentage = totalStudents > 0 
    ? Math.round(((presentCount + lateCount * 0.75) / totalStudents) * 100) 
    : 0;

  // Handler for single student toggle
  const handleToggleStudentStatus = (studentId, newStatus) => {
    onUpdateAttendanceRecord(sessionKey, studentId, newStatus);
  };

  // Bulk Handlers
  const handleMarkAll = (status) => {
    const bulkMap = {};
    activeEnrolled.forEach(s => {
      bulkMap[s.id] = status;
    });
    onBulkUpdateAttendance(sessionKey, bulkMap);
  };

  // Filtered student list
  const filteredStudents = enrolledStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const currentStatus = currentSessionLogs[s.id] || 'Absent';
    if (statusFilter === 'ALL') return true;
    return currentStatus === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Top Editorial Identity */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#ccff00] uppercase font-semibold">
              01.0 // High-Speed Attendance Matrix
            </span>
            <span className="h-px w-10 bg-white/[0.1]" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              Class: {currentClass?.code} • {currentClass?.semester}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.92]">
            Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Matrix.</span>
          </h1>
        </div>

        {/* Active Class Badge */}
        <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.08] rounded-sm font-mono text-xs">
          <span className="w-2 h-2 rounded-none rotate-45 bg-[#ccff00] shadow-[0_0_8px_#ccff00]" />
          <div>
            <div className="text-white font-bold tracking-wider uppercase">{currentClass?.name}</div>
            <div className="text-[10px] text-neutral-500">{currentClass?.department}</div>
          </div>
        </div>
      </div>

      {/* Control Strip: Subject, Session Type, Date & Class Selectors */}
      <div className="py-8 border-b border-white/[0.08] space-y-6">
        
        {/* Row 1: Class, Subject, and Date Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          
          {/* Class Switcher (3 cols) */}
          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
              01 // Active Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0c0c10] border border-white/[0.12] rounded-sm text-xs font-mono font-semibold text-white focus:outline-none focus:border-[#ccff00] transition"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} disabled={c.isArchived}>
                  {c.code} — {c.name} {c.isArchived ? '(Archived)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector (4 cols) */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
              02 // Target Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0c0c10] border border-white/[0.12] rounded-sm text-xs font-mono font-semibold text-white focus:outline-none focus:border-[#ccff00] transition"
            >
              {classSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.name} {!sub.hasLab ? ' [Theory Only]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Session Type: Theory vs Lab with Strict EM for AI Constraint (3 cols) */}
          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold flex items-center justify-between">
              <span>03 // Session Type</span>
              {!currentSubject?.hasLab && (
                <span className="text-[9px] text-[#ff5500] font-mono lowercase tracking-normal">
                  (no lab)
                </span>
              )}
            </label>
            
            <div className="flex items-center gap-1 p-1 bg-[#0c0c10] border border-white/[0.1] rounded-sm">
              <button
                type="button"
                onClick={() => setSessionType('Theory')}
                className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold rounded-xs transition ${
                  sessionType === 'Theory'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Theory
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentSubject?.hasLab) {
                    setSessionType('Lab');
                  }
                }}
                disabled={!currentSubject?.hasLab}
                title={!currentSubject?.hasLab ? 'EM for AI is a Theory-only subject with no lab curriculum.' : 'Mark Lab Session'}
                className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold rounded-xs transition ${
                  !currentSubject?.hasLab
                    ? 'opacity-25 cursor-not-allowed text-neutral-600 line-through'
                    : sessionType === 'Lab'
                    ? 'bg-[#ccff00] text-black font-bold shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Lab Session
              </button>
            </div>
          </div>

          {/* Calendar Date (2 cols) */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
              04 // Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c0c10] border border-white/[0.12] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#ccff00] transition"
            />
          </div>

        </div>

        {/* Row 2: Subject Metadata Banner & Notification if EM for AI is selected */}
        {!currentSubject?.hasLab && (
          <div className="p-3 bg-[#ff5500]/10 border border-[#ff5500]/30 rounded-sm flex items-center justify-between text-xs font-mono text-[#ff5500] animate-reveal">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>{currentSubject?.code} Constraint:</strong> Engineering Mathematics for AI has no laboratory syllabus. Lab session option is automatically restricted.
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 hidden sm:inline">
              [Theory Enforced]
            </span>
          </div>
        )}

      </div>

      {/* KPI Ribbon Strip: Session Turnout & Ratios */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-b border-white/[0.08]">
        
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase font-semibold">
            01 // Class Roster
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mt-2">
            {totalStudents}
          </div>
          <p className="text-[10px] font-mono text-neutral-500 mt-1">
            Active Candidates ({enrolledStudents.length - totalStudents} Inactive)
          </p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#ccff00] uppercase font-semibold">
            02 // Marked Present
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#ccff00] tracking-tighter mt-2">
            {presentCount}
          </div>
          <p className="text-[10px] font-mono text-neutral-500 mt-1">Verified In Attendance</p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#ff5500] uppercase font-semibold">
            03 // Marked Absent
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#ff5500] tracking-tighter mt-2">
            {absentCount}
          </div>
          <p className="text-[10px] font-mono text-neutral-500 mt-1">{lateCount} logged late arrival</p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase font-semibold">
            04 // Session Turnout
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mt-2">
            {turnoutPercentage}%
          </div>
          <div className="w-full h-1 bg-white/[0.06] rounded-none mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2563eb] to-[#ccff00] transition-all duration-500"
              style={{ width: `${turnoutPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* Action Bar: Bulk Controls & Search Filters */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08]">
        
        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Filter by roll number or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 bg-white/[0.02] border border-white/[0.1] rounded-sm text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
          />
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mr-2">
            Bulk Invocations:
          </span>

          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-[#ccff00] hover:text-black border border-white/[0.1] rounded-xs text-[11px] font-mono uppercase tracking-wider font-bold transition duration-200"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-[#ff5500] hover:text-white border border-white/[0.1] rounded-xs text-[11px] font-mono uppercase tracking-wider font-bold transition duration-200"
          >
            <XSquare className="w-3.5 h-3.5" />
            <span>Mark All Absent</span>
          </button>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/[0.1]">
            {['ALL', 'Present', 'Late', 'Absent'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-xs transition ${
                  statusFilter === f
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Roster Table: High-Speed Segmented Marking */}
      <div className="pt-6">
        
        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center border border-white/[0.06] rounded-sm bg-white/[0.01]">
            <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-mono text-neutral-300">No students matched the query criteria.</p>
            <p className="text-xs font-mono text-neutral-600 mt-1">
              Ensure students are enrolled in {currentClass?.code} via 02 // Student Directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] text-neutral-500 uppercase tracking-widest">
                  <th className="py-4 pr-6 font-semibold">01 // Roll Number</th>
                  <th className="py-4 px-6 font-semibold">02 // Candidate Name</th>
                  <th className="py-4 px-6 font-semibold">03 // Enrolled Status</th>
                  <th className="py-4 px-6 font-semibold">04 // Log State</th>
                  <th className="py-4 pl-6 text-right font-semibold">Live Attendance Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filteredStudents.map((student) => {
                  const status = currentSessionLogs[student.id] || 'Absent';
                  const isPresent = status === 'Present';
                  const isLate = status === 'Late';
                  const isAbsent = status === 'Absent';

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-white/[0.02] transition-colors ${
                        !student.isActive ? 'opacity-40 bg-black/20' : ''
                      }`}
                    >
                      {/* Roll Number */}
                      <td className="py-4 pr-6">
                        <span className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.08] text-white font-bold text-xs rounded-xs">
                          {student.rollNumber}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-xs bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-display text-white font-bold text-xs">
                            {student.avatarLetter || student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-sans font-semibold text-sm">{student.name}</div>
                            <div className="text-[10px] text-neutral-500">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded-xs border ${
                          student.isActive
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : 'text-neutral-500 bg-white/[0.02] border-white/[0.06]'
                        }`}>
                          <span className={`w-1 h-1 rounded-none rotate-45 ${
                            student.isActive ? 'bg-emerald-400' : 'bg-neutral-600'
                          }`} />
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Log State Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-xs border ${
                          isPresent
                            ? 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/40'
                            : isLate
                            ? 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40'
                            : 'text-[#ff5500] bg-[#ff5500]/10 border-[#ff5500]/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-none rotate-45 ${
                            isPresent ? 'bg-[#ccff00]' : isLate ? 'bg-[#f59e0b]' : 'bg-[#ff5500]'
                          }`} />
                          {status}
                        </span>
                      </td>

                      {/* Segmented High-Speed Action Buttons */}
                      <td className="py-4 pl-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* Present Toggle */}
                          <button
                            type="button"
                            disabled={!student.isActive}
                            onClick={() => handleToggleStudentStatus(student.id, 'Present')}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-200 ${
                              isPresent
                                ? 'bg-[#ccff00] text-black shadow-[0_0_12px_rgba(204,255,0,0.35)] cursor-default'
                                : 'bg-white/[0.03] hover:bg-[#ccff00]/20 hover:text-[#ccff00] text-neutral-400 border border-white/[0.08]'
                            }`}
                          >
                            Present
                          </button>

                          {/* Late Toggle */}
                          <button
                            type="button"
                            disabled={!student.isActive}
                            onClick={() => handleToggleStudentStatus(student.id, 'Late')}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-200 ${
                              isLate
                                ? 'bg-[#f59e0b] text-black shadow-[0_0_12px_rgba(245,158,11,0.35)] cursor-default'
                                : 'bg-white/[0.03] hover:bg-[#f59e0b]/20 hover:text-[#f59e0b] text-neutral-400 border border-white/[0.08]'
                            }`}
                          >
                            Late
                          </button>

                          {/* Absent Toggle */}
                          <button
                            type="button"
                            disabled={!student.isActive}
                            onClick={() => handleToggleStudentStatus(student.id, 'Absent')}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-200 ${
                              isAbsent
                                ? 'bg-[#ff5500] text-white shadow-[0_0_12px_rgba(255,85,0,0.35)] cursor-default'
                                : 'bg-white/[0.03] hover:bg-[#ff5500]/20 hover:text-[#ff5500] text-neutral-400 border border-white/[0.08]'
                            }`}
                          >
                            Absent
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
