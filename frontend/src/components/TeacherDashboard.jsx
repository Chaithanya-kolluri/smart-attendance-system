import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Check, User } from 'lucide-react';

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState({
    name: 'Prof. David Vance',
    role: 'Faculty Instructor',
    department: 'Computer Science & AI',
    token: 'AUTH.SECURE.9942-JWT'
  });

  const [selectedClass, setSelectedClass] = useState('CS101');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchClassAttendance = async (className, date) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/attendance/class/${encodeURIComponent(className)}?date=${encodeURIComponent(date)}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setRosterData(data);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to fetch class attendance.'
        });
      }
    } catch (err) {
      console.error('Error loading class attendance:', err);
      setNotification({
        type: 'error',
        message: 'Network error connecting to API cluster.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassAttendance(selectedClass, selectedDate);
  }, [selectedClass, selectedDate]);

  const handleStatusOverride = async (studentId, currentLogId, newStatus) => {
    setUpdatingId(studentId);
    setNotification(null);

    try {
      const response = await fetch('/api/attendance/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacher.token}`
        },
        body: JSON.stringify({
          id: currentLogId || undefined,
          student_id: studentId,
          class_name: selectedClass,
          status: newStatus,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Subject [${studentId}] override: status marked as '${newStatus.toUpperCase()}'.`
        });
        await fetchClassAttendance(selectedClass, selectedDate);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to update attendance status.'
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setNotification({
        type: 'error',
        message: 'Network communication fault.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const students = rosterData?.students || [];
  const logs = rosterData?.logs || [];

  const rosterWithStatus = students.map((student) => {
    const studentLog = logs.find((l) => l.student_id.toLowerCase() === student.id.toLowerCase());
    return {
      student,
      log: studentLog,
      status: studentLog ? studentLog.status : 'Absent'
    };
  });

  const totalStudents = students.length;
  const presentCount = rosterWithStatus.filter((r) => r.status === 'Present').length;
  const lateCount = rosterWithStatus.filter((r) => r.status === 'Late').length;
  const absentCount = Math.max(0, totalStudents - presentCount - lateCount);
  const attendancePercentage = totalStudents > 0 ? Math.round(((presentCount + lateCount * 0.75) / totalStudents) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-12 pb-24 animate-reveal">
      
      {/* Top Editorial Identity & Faculty Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#ff5500] uppercase font-semibold">
              03.0 // Faculty Oversight
            </span>
            <span className="h-px w-12 bg-white/[0.1]" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              Roster & Override Matrix
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.92]">
            Roster <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Matrix.</span>
          </h1>
        </div>

        {/* Instructor Verified Badge */}
        <div className="flex items-center gap-4 p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-sm">
          <div className="w-9 h-9 rounded-sm bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-display font-bold text-white text-sm">
            {teacher.name.split(' ')[1]?.charAt(0) || 'V'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase">{teacher.name}</span>
              <span className="text-[9px] font-mono tracking-widest text-[#ccff00] uppercase">
                [AUTH.OK]
              </span>
            </div>
            <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
              {teacher.department} • <button
                type="button"
                onClick={() => {
                  setTeacher({
                    ...teacher,
                    name: teacher.name.includes('David') ? 'Dr. Priya Sundaram' : 'Prof. David Vance'
                  });
                }}
                className="hover:underline text-neutral-300"
              >
                Switch
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Parameters Strip */}
      <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-6">
          
          {/* Class Division Selector */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
              Division //
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 bg-[#0c0c10] border border-white/[0.12] rounded-sm text-xs font-mono font-semibold text-white focus:outline-none focus:border-[#ccff00] transition"
            >
              <option value="CS101">CS101 - Artificial Intelligence</option>
              <option value="CS102">CS102 - Data Structures & Algorithms</option>
              <option value="EE200">EE200 - Electrical Engineering</option>
              <option value="ME300">ME300 - Mechanical Engineering</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
              Target Date //
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 bg-[#0c0c10] border border-white/[0.12] rounded-sm text-xs font-mono text-white focus:outline-none focus:border-[#ccff00] transition"
            />
          </div>

        </div>

        {/* Sync Trigger */}
        <button
          type="button"
          onClick={() => fetchClassAttendance(selectedClass, selectedDate)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1] rounded-sm text-xs font-mono uppercase tracking-widest font-semibold transition"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Roster</span>
        </button>
      </div>

      {/* KPI Statistic Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase font-semibold">
            01 // Total Enrolled
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mt-2">
            {totalStudents}
          </div>
          <p className="text-[10px] font-mono text-neutral-500 mt-1">Class {selectedClass}</p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#ccff00] uppercase font-semibold">
            02 // Verified Present
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#ccff00] tracking-tighter mt-2">
            {presentCount}
          </div>
          <p className="text-[10px] font-mono text-neutral-500 mt-1">Optical Face Verified</p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#ff5500] uppercase font-semibold">
            03 // Absent / Unverified
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#ff5500] tracking-tighter mt-2">
            {absentCount}
          </div>
          <p className="text-[10px] font-mono text-neutral-500 mt-1">{lateCount} flagged late arrival</p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase font-semibold">
            04 // Turnout Ratio
          </span>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mt-2">
            {attendancePercentage}%
          </div>
          <div className="w-full h-1 bg-white/[0.06] rounded-none mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2563eb] to-[#ccff00] transition-all duration-500"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Live Toast */}
      {notification && (
        <div className={`my-8 p-4 rounded-sm border flex items-center justify-between text-xs font-mono tracking-wide transition-all ${
          notification.type === 'success'
            ? 'bg-[#ccff00]/10 border-[#ccff00]/40 text-[#ccff00]'
            : 'bg-[#ff5500]/10 border-[#ff5500]/40 text-[#ff5500]'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-[#ccff00] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#ff5500] flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="hover:opacity-70 text-[10px] uppercase font-bold tracking-widest ml-4"
          >
            [Dismiss]
          </button>
        </div>
      )}

      {/* Master Roster Ledger */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-none rotate-45 bg-[#ff5500]" />
            <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight">
              Master Roster & Live Overrides
            </h3>
          </div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            Click Action To Execute Instant Database Mutation
          </span>
        </div>

        {rosterWithStatus.length === 0 ? (
          <div className="py-16 text-center border border-white/[0.06] rounded-sm bg-white/[0.01]">
            <User className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-mono text-neutral-300">No students currently enrolled in {selectedClass}.</p>
            <p className="text-xs font-mono text-neutral-600 mt-1">
              Enroll subjects in the 01 // Identity Enrollment tab.
            </p>
          </div>
        ) : (
          <div className="border-t border-white/[0.08] overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] text-neutral-500 uppercase tracking-widest">
                  <th className="py-4 pr-6 font-semibold">01 // Subject Name</th>
                  <th className="py-4 px-6 font-semibold">02 // Key</th>
                  <th className="py-4 px-6 font-semibold">03 // Current Status</th>
                  <th className="py-4 px-6 font-semibold">04 // Log Timestamp</th>
                  <th className="py-4 pl-6 text-right font-semibold">Manual Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {rosterWithStatus.map(({ student, log, status }) => {
                  const isPresent = status === 'Present';
                  const isLate = status === 'Late';
                  const isAbsent = status === 'Absent';
                  const isUpdating = updatingId === student.id;

                  const logTime = log?.timestamp
                    ? new Date(log.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : 'UNRECORDED';

                  return (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-display text-white font-bold text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-sans font-semibold text-sm">{student.name}</div>
                            <div className="text-[10px] text-neutral-500">{student.class_assigned}</div>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] text-neutral-300 text-xs">
                          {student.id}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-xs border ${
                          isPresent
                            ? 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/30'
                            : isLate
                            ? 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30'
                            : 'text-[#ff5500] bg-[#ff5500]/10 border-[#ff5500]/30'
                        }`}>
                          <span className={`w-1 h-1 rounded-none rotate-45 ${
                            isPresent ? 'bg-[#ccff00]' : isLate ? 'bg-[#f59e0b]' : 'bg-[#ff5500]'
                          }`} />
                          {status}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-6 text-neutral-500 text-[11px]">
                        {logTime}
                      </td>

                      {/* Segmented Action Toggle Buttons */}
                      <td className="py-4 pl-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* Present */}
                          <button
                            type="button"
                            disabled={isUpdating || isPresent}
                            onClick={() => handleStatusOverride(student.id, log?.id, 'Present')}
                            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-xs transition ${
                              isPresent
                                ? 'bg-[#ccff00] text-black shadow-[0_0_12px_rgba(204,255,0,0.3)] cursor-default'
                                : 'bg-white/[0.03] hover:bg-[#ccff00]/20 hover:text-[#ccff00] text-neutral-400 border border-white/[0.08]'
                            }`}
                          >
                            Present
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            disabled={isUpdating || isLate}
                            onClick={() => handleStatusOverride(student.id, log?.id, 'Late')}
                            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-xs transition ${
                              isLate
                                ? 'bg-[#f59e0b] text-black shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-default'
                                : 'bg-white/[0.03] hover:bg-[#f59e0b]/20 hover:text-[#f59e0b] text-neutral-400 border border-white/[0.08]'
                            }`}
                          >
                            Late
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            disabled={isUpdating || isAbsent}
                            onClick={() => handleStatusOverride(student.id, log?.id, 'Absent')}
                            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-xs transition ${
                              isAbsent
                                ? 'bg-[#ff5500] text-white shadow-[0_0_12px_rgba(255,85,0,0.3)] cursor-default'
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
