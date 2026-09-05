import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function TeacherDashboard() {
  // Mock Auth State
  const [teacher, setTeacher] = useState({
    name: 'Prof. David Vance',
    role: 'Course Instructor',
    department: 'Computer Science & AI',
    token: 'mock-jwt-teacher-auth-token-9942'
  });

  const [selectedClass, setSelectedClass] = useState('CS101');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch Class Roster & Attendance
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
        message: 'Could not communicate with the API backend.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassAttendance(selectedClass, selectedDate);
  }, [selectedClass, selectedDate]);

  // Handle Teacher Status Override
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
          message: `Attendance for student ${studentId} updated to '${newStatus}'.`
        });
        // Refresh roster
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
        message: 'Network error while updating attendance.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Compile student roster with their status on selected date
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
  const absentCount = totalStudents - presentCount - lateCount;
  const attendancePercentage = totalStudents > 0 ? Math.round(((presentCount + lateCount * 0.75) / totalStudents) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Teacher Authenticated Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
            {teacher.name.split(' ')[1]?.charAt(0) || 'T'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{teacher.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                Instructor Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {teacher.role} • {teacher.department}
            </p>
          </div>
        </div>

        {/* Security / Session Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Session Token</div>
            <div className="text-[11px] font-mono text-slate-500 truncate max-w-[140px]">{teacher.token}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newName = teacher.name.includes('David') ? 'Dr. Priya Sundaram' : 'Prof. David Vance';
              setTeacher({ ...teacher, name: newName });
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Switch Profile
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {/* Class Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="CS101">CS101 - Computer Science & AI</option>
                <option value="CS102">CS102 - Data Structures & Algorithms</option>
                <option value="EE200">EE200 - Electrical Engineering</option>
                <option value="ME300">ME300 - Mechanical Engineering</option>
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => fetchClassAttendance(selectedClass, selectedDate)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition self-end sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Roster
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Enrolled</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">{totalStudents}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Class {selectedClass}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400 mt-2">{presentCount}</h3>
          <p className="text-[11px] text-slate-500 mt-1">On-time arrivals</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Late / Absent</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-rose-400 mt-2">{absentCount}</h3>
          <p className="text-[11px] text-slate-500 mt-1">{lateCount} flagged late</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Turnout Rate</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">{attendancePercentage}%</h3>
          <p className="text-[11px] text-emerald-400 mt-1">Target &gt; 80%</p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-3 text-sm font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Master Student Roster Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">Master Student Roster & Live Override Controls</h3>
            <p className="text-xs text-slate-400">
              Manual attendance overrides apply immediately to the database and sync with the student view.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
            {rosterWithStatus.length} Students
          </span>
        </div>

        {rosterWithStatus.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No students found enrolled in {selectedClass}.</p>
            <p className="text-xs text-slate-500 mt-1">
              Enroll new students using the Laptop Registration Portal tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Student Info</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Today's Status</th>
                  <th className="py-3.5 px-6">Recorded Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Teacher Manual Override Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {rosterWithStatus.map(({ student, log, status }) => {
                  const isPresent = status === 'Present';
                  const isLate = status === 'Late';
                  const isAbsent = status === 'Absent';
                  const isUpdating = updatingId === student.id;

                  const logTimeStr = log?.timestamp
                    ? new Date(log.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : 'Not Checked In';

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-cyan-400">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{student.name}</div>
                            <div className="text-[11px] text-slate-400">{student.class_assigned}</div>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-3.5 px-6">
                        <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {student.id}
                        </span>
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isPresent
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : isLate
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isPresent ? 'bg-emerald-400' : isLate ? 'bg-amber-400' : 'bg-rose-400'
                          }`} />
                          {status}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-6 font-mono text-slate-400">
                        {logTimeStr}
                      </td>

                      {/* Teacher Manual Action Buttons / Override Dropdown */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Toggle: Present */}
                          <button
                            type="button"
                            disabled={isUpdating || isPresent}
                            onClick={() => handleStatusOverride(student.id, log?.id, 'Present')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                              isPresent
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                : 'bg-slate-800 hover:bg-emerald-500/15 hover:text-emerald-400 text-slate-300 border border-slate-700'
                            }`}
                          >
                            Present
                          </button>

                          {/* Quick Toggle: Late */}
                          <button
                            type="button"
                            disabled={isUpdating || isLate}
                            onClick={() => handleStatusOverride(student.id, log?.id, 'Late')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                              isLate
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                                : 'bg-slate-800 hover:bg-amber-500/15 hover:text-amber-400 text-slate-300 border border-slate-700'
                            }`}
                          >
                            Late
                          </button>

                          {/* Quick Toggle: Absent */}
                          <button
                            type="button"
                            disabled={isUpdating || isAbsent}
                            onClick={() => handleStatusOverride(student.id, log?.id, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                              isAbsent
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-default'
                                : 'bg-slate-800 hover:bg-rose-500/15 hover:text-rose-400 text-slate-300 border border-slate-700'
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

