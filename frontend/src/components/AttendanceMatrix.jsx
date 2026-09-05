import React, { useState, useEffect } from 'react';
import { 
  CheckCheck, 
  XSquare, 
  BookOpen, 
  Info,
  FileText,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Camera
} from 'lucide-react';

export default function AttendanceMatrix({ 
  classes, 
  selectedClassId, 
  setSelectedClassId, 
  students, 
  attendanceLogs, 
  onUpdateAttendanceRecord,
  onBulkUpdateAttendance,
  activeSlotToMark,
  onNavigateToReports 
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

  // If activeSlotToMark is passed from timetable, auto-configure!
  useEffect(() => {
    if (activeSlotToMark) {
      const match = classSubjects.find(s => 
        (activeSlotToMark.code && s.code && s.code.toLowerCase().includes(activeSlotToMark.code.toLowerCase())) ||
        (activeSlotToMark.subject && s.name && s.name.toLowerCase().includes(activeSlotToMark.subject.toLowerCase()))
      );
      if (match) {
        setSelectedSubjectId(match.id);
      }
      if (activeSlotToMark.type === 'Lab') {
        setSessionType('Lab');
      } else {
        setSessionType('Theory');
      }
    }
  }, [activeSlotToMark, classSubjects]);

  // STRICT CURRICULUM CONSTRAINT: Engineering Mathematics (24AI31T) has NO lab.
  // Prohibit Lab session selection for EM for AI under all circumstances.
  useEffect(() => {
    const isMath = currentSubject?.code === '24AI31T' || currentSubject?.id === 'em-ai' || !currentSubject?.hasLab;
    if (isMath && sessionType === 'Lab') {
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
  const activeEnrolled = enrolledStudents.filter(s => s.isActive !== false);
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

  // Single student toggle handler
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
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(query) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(query)) ||
      (s.id && s.id.toLowerCase().includes(query));
    if (!matchesSearch) return false;

    const currentStatus = currentSessionLogs[s.id] || 'Absent';
    if (statusFilter === 'ALL') return true;
    return currentStatus === statusFilter;
  });

  const isMathSubject = currentSubject?.code === '24AI31T' || currentSubject?.id === 'em-ai' || !currentSubject?.hasLab;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Official Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2E1C22]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#FF2A4B] uppercase font-semibold">
              01.0 // High-Speed Attendance Matrix
            </span>
            <span className="h-px w-10 bg-[#421B24]" />
            <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">
              GTTC STU-35 • {currentClass?.code}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
            Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF2A4B]">Matrix.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#B3A2A8] font-sans max-w-xl">
            High-speed segmented attendance marking mapped to official GTTC syllabus codes with instant state synchronization.
          </p>
        </div>

        {/* View Reports Shortcut Button */}
        {onNavigateToReports && (
          <button
            type="button"
            onClick={onNavigateToReports}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#161114] hover:bg-[#FF2A4B] text-[#B3A2A8] hover:text-white border border-[#2E1C22] hover:border-[#FF2A4B] rounded-sm text-xs font-mono uppercase tracking-wider font-bold transition shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#FF2A4B]" />
            <span>View Recorded Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Control Bar: Class, Subject, Session Type & Date */}
      <div className="py-6 border-b border-[#2E1C22] space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          
          {/* Class Division Selector (3 cols) */}
          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase font-semibold">
              01 // Class Division
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#161114] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#FF2A4B] transition uppercase"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#161114]">
                  {c.code} // {c.name.slice(0, 20)}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector (4 cols) */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase font-semibold">
              02 // Syllabus Course
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#161114] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#FF2A4B] transition"
            >
              {classSubjects.map(s => (
                <option key={s.id} value={s.id} className="bg-[#161114]">
                  {s.code} - {s.name} {!s.hasLab ? '(Theory Only)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Session Type: Theory vs Lab with Strict Math Constraint (3 cols) */}
          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase font-semibold flex items-center justify-between">
              <span>03 // Session Type</span>
              {isMathSubject && (
                <span className="text-[9px] text-[#FF2A4B] font-mono lowercase">
                  (theory only)
                </span>
              )}
            </label>
            
            <div className="flex items-center gap-1 p-1 bg-[#161114] border border-[#2E1C22] rounded-sm">
              <button
                type="button"
                onClick={() => setSessionType('Theory')}
                className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold rounded-xs transition ${
                  sessionType === 'Theory'
                    ? 'bg-[#FF2A4B] text-white font-bold shadow-[0_0_10px_rgba(255,42,75,0.3)]'
                    : 'text-[#B3A2A8] hover:text-white'
                }`}
              >
                Theory
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isMathSubject) {
                    setSessionType('Lab');
                  }
                }}
                disabled={isMathSubject}
                title={isMathSubject ? 'Engineering Mathematics is strictly configured as a Theory-Only course with no lab component.' : 'Mark Laboratory Session'}
                className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold rounded-xs transition ${
                  isMathSubject
                    ? 'opacity-25 cursor-not-allowed text-[#7A6970] line-through'
                    : sessionType === 'Lab'
                    ? 'bg-[#FF2A4B] text-white font-bold shadow-[0_0_10px_rgba(255,42,75,0.3)]'
                    : 'text-[#B3A2A8] hover:text-white'
                }`}
              >
                Lab Session
              </button>
            </div>
          </div>

          {/* Calendar Date (2 cols) */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase font-semibold">
              04 // Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#161114] border border-[#2E1C22] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#FF2A4B] transition"
            />
          </div>

        </div>

        {/* Math Theory-Only Strict Warning Banner */}
        {isMathSubject && (
          <div className="p-3 bg-[#421B24]/40 border border-[#FF2A4B]/40 rounded-sm flex items-center justify-between text-xs font-mono text-[#FF2A4B] animate-reveal">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 flex-shrink-0 text-[#FF2A4B]" />
              <span>
                <strong>{currentSubject?.code} Curriculum Rule:</strong> Engineering Mathematics is strictly configured as a theory-only course. Laboratory hours and lab slot markings are disabled.
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold bg-[#FF2A4B]/20 px-2 py-0.5 rounded-xs border border-[#FF2A4B]/30 hidden sm:inline">
              Theory Enforced
            </span>
          </div>
        )}

      </div>

      {/* KPI Ribbon Strip: Turnout Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-b border-[#2E1C22]">
        
        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">01 // Active Roster</span>
          <div className="font-mono text-3xl font-bold text-white mt-1">
            {totalStudents}
          </div>
          <p className="text-[10px] font-mono text-[#7A6970] mt-0.5">
            Candidates in {currentClass?.code}
          </p>
        </div>

        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase">02 // Present</span>
          <div className="font-mono text-3xl font-bold text-[#00FF88] mt-1">
            {presentCount}
          </div>
          <p className="text-[10px] font-mono text-[#7A6970] mt-0.5">Verified In Class</p>
        </div>

        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#FF2A4B] uppercase">03 // Absent</span>
          <div className="font-mono text-3xl font-bold text-[#FF2A4B] mt-1">
            {absentCount}
          </div>
          <p className="text-[10px] font-mono text-[#7A6970] mt-0.5">{lateCount} logged late</p>
        </div>

        <div className="p-4 bg-[#161114] border border-[#2E1C22] rounded-sm">
          <span className="text-[10px] font-mono tracking-widest text-[#FFB800] uppercase">04 // Turnout Ratio</span>
          <div className="font-mono text-3xl font-bold text-white mt-1">
            {turnoutPercentage}%
          </div>
          <div className="w-full h-1 bg-[#2E1C22] rounded-none mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF2A4B] to-[#00FF88] transition-all duration-500"
              style={{ width: `${turnoutPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* Action Bar: Bulk Mark Controls & Search */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2E1C22]">
        
        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#7A6970] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search roll number or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#161114] border border-[#2E1C22] rounded-sm text-xs font-mono text-white placeholder-[#7A6970] focus:border-[#FF2A4B] outline-none transition"
          />
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B3A2A8] mr-1">
            Bulk Actions:
          </span>

          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF88]/10 hover:bg-[#00FF88] text-[#00FF88] hover:text-black border border-[#00FF88]/30 rounded-xs text-[10px] font-mono uppercase tracking-wider font-bold transition duration-200"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF2A4B]/10 hover:bg-[#FF2A4B] text-[#FF2A4B] hover:text-white border border-[#FF2A4B]/30 rounded-xs text-[10px] font-mono uppercase tracking-wider font-bold transition duration-200"
          >
            <XSquare className="w-3.5 h-3.5" />
            <span>Mark All Absent</span>
          </button>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[#2E1C22]">
            {['ALL', 'Present', 'Late', 'Absent'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-xs transition ${
                  statusFilter === f
                    ? 'bg-[#FF2A4B] text-white font-bold'
                    : 'text-[#B3A2A8] hover:text-white'
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
          <div className="py-20 text-center border border-[#2E1C22] rounded-sm bg-[#161114]/40">
            <BookOpen className="w-8 h-8 text-[#7A6970] mx-auto mb-3" />
            <p className="text-sm font-mono text-[#B3A2A8]">No candidates matched the filter criteria.</p>
            <p className="text-xs font-mono text-[#7A6970] mt-1">
              Ensure students are registered in {currentClass?.code} via 04 // Student Directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#2E1C22] rounded-sm bg-[#161114]">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#2E1C22] text-[10px] text-[#B3A2A8] uppercase tracking-widest bg-[#0D0B0D]">
                  <th className="py-3.5 px-4 font-semibold">Face Scan</th>
                  <th className="py-3.5 px-4 font-semibold">USN / Roll Number</th>
                  <th className="py-3.5 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3.5 px-4 font-semibold">Current State</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Segmented Mark Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E1C22] text-xs">
                {filteredStudents.map((student) => {
                  const status = currentSessionLogs[student.id] || 'Absent';
                  const isPresent = status === 'Present';
                  const isLate = status === 'Late';
                  const isAbsent = status === 'Absent';
                  const hasFace = Boolean(student.faceData || student.face_data);

                  return (
                    <tr key={student.id} className="hover:bg-[#1D151B] transition">
                      
                      {/* Face Thumbnail */}
                      <td className="py-3 px-4">
                        {hasFace ? (
                          <div className="w-8 h-8 rounded-sm overflow-hidden border border-[#FF2A4B]/40 bg-[#0D0B0D]">
                            <img 
                              src={student.faceData || student.face_data} 
                              alt={student.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-sm border border-[#2E1C22] bg-[#0D0B0D] flex items-center justify-center text-[#7A6970]">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </td>

                      {/* Roll Number */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-white tracking-wider">
                          {student.rollNumber || student.id}
                        </span>
                      </td>

                      {/* Candidate Name */}
                      <td className="py-3 px-4 font-sans font-medium text-white">
                        {student.name}
                        {!student.isActive && (
                          <span className="ml-2 text-[9px] font-mono text-[#FF2A4B] uppercase">[Suspended]</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-xs border font-bold ${
                          isPresent 
                            ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                            : isLate
                            ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
                            : 'bg-[#FF2A4B]/10 text-[#FF2A4B] border-[#FF2A4B]/30'
                        }`}>
                          {isPresent && <CheckCircle2 className="w-3 h-3" />}
                          {isLate && <Clock className="w-3 h-3" />}
                          {isAbsent && <XCircle className="w-3 h-3" />}
                          <span>{status}</span>
                        </span>
                      </td>

                      {/* Segmented Mark Toggle Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 p-1 bg-[#0D0B0D] border border-[#2E1C22] rounded-sm">
                          
                          {/* Present Toggle */}
                          <button
                            type="button"
                            disabled={student.isActive === false}
                            onClick={() => handleToggleStudentStatus(student.id, 'Present')}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition ${
                              isPresent
                                ? 'bg-[#00FF88] text-black shadow-[0_0_10px_rgba(0,255,136,0.35)]'
                                : 'bg-[#161114] text-[#B3A2A8] hover:text-[#00FF88]'
                            }`}
                          >
                            Present
                          </button>

                          {/* Late Toggle */}
                          <button
                            type="button"
                            disabled={student.isActive === false}
                            onClick={() => handleToggleStudentStatus(student.id, 'Late')}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition ${
                              isLate
                                ? 'bg-[#FFB800] text-black shadow-[0_0_10px_rgba(255,184,0,0.35)]'
                                : 'bg-[#161114] text-[#B3A2A8] hover:text-[#FFB800]'
                            }`}
                          >
                            Late
                          </button>

                          {/* Absent Toggle */}
                          <button
                            type="button"
                            disabled={student.isActive === false}
                            onClick={() => handleToggleStudentStatus(student.id, 'Absent')}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition ${
                              isAbsent
                                ? 'bg-[#FF2A4B] text-white shadow-[0_0_10px_rgba(255,42,75,0.35)]'
                                : 'bg-[#161114] text-[#B3A2A8] hover:text-[#FF2A4B]'
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
