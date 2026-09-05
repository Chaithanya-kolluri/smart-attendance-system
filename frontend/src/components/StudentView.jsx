import React, { useState } from 'react';
import { Search, UserCheck, Calendar, Clock, AlertCircle, Percent, GraduationCap, ArrowRight } from 'lucide-react';

export default function StudentView() {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const sampleIds = ['STU101', 'STU102', 'STU103', 'STU201'];

  const fetchStudentReport = async (idToQuery) => {
    const id = idToQuery || searchId;
    if (!id || !id.trim()) {
      setError('Please enter a Student ID to query.');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await fetch(`/api/students/report/${encodeURIComponent(id.trim())}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setReport(data);
      } else {
        setError(data.error || `No attendance records or profile found for Student ID: ${id}`);
      }
    } catch (err) {
      console.error('Error fetching student report:', err);
      setError('Failed to reach attendance server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudentReport(searchId);
  };

  // Calculate metrics
  const totalLogs = report?.records?.length || 0;
  const presentCount = report?.records?.filter(r => r.status === 'Present').length || 0;
  const lateCount = report?.records?.filter(r => r.status === 'Late').length || 0;
  const attendanceRate = totalLogs > 0 ? Math.round(((presentCount + lateCount * 0.75) / totalLogs) * 100) : 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Student View Portal</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Public Read-Only
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Enter your unique Student ID to view your verified historical attendance logs.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Student ID (e.g., STU101)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <span>Search Records</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Chips */}
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
          <span>Quick Lookup:</span>
          {sampleIds.map((sid) => (
            <button
              key={sid}
              type="button"
              onClick={() => {
                setSearchId(sid);
                fetchStudentReport(sid);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition"
            >
              {sid}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Student Details & Attendance Summary */}
      {report && (
        <div className="space-y-6">
          {/* Profile & KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Student ID & Name */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {report.student?.name ? report.student.name.charAt(0) : 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{report.student?.name || 'Unknown Student'}</h2>
                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 text-xs font-mono border border-blue-500/25">
                    {report.student?.id}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    Class: {report.student?.class_assigned || 'Unassigned'}
                  </span>
                  <span>•</span>
                  <span>Status: Verified Enrolled</span>
                </div>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{attendanceRate}%</h3>
                <p className="text-[11px] text-emerald-400 mt-0.5">Good Academic Standing</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Percent className="w-6 h-6" />
              </div>
            </div>

            {/* Total Recorded Sessions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Check-ins</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{totalLogs}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{presentCount} Present, {lateCount} Late</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Chronological Historical Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">Chronological Attendance History</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Read-Only Interface
              </span>
            </div>

            {report.records.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">No attendance records logged yet.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Once your face is recognized by the Raspberry Pi or marked by a teacher, logs appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Timestamp (UTC / Local)</th>
                      <th className="py-3.5 px-6">Course / Class</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Verification Source</th>
                      <th className="py-3.5 px-6 text-right">Interactive Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {report.records.map((log) => {
                      const logDate = new Date(log.timestamp);
                      const formattedDate = logDate.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      const formattedTime = logDate.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });

                      const isPresent = log.status === 'Present';
                      const isLate = log.status === 'Late';

                      return (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-6">
                            <div className="font-medium text-white">{formattedDate}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{formattedTime}</div>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="font-semibold text-slate-200">{log.class_name}</span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              isPresent
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : isLate
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isPresent ? 'bg-emerald-400' : isLate ? 'bg-amber-400' : 'bg-rose-400'
                              }`} />
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <span>IoT Edge Face Biometrics</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            {/* Strictly Disabled inputs per requirement */}
                            <button
                              disabled
                              className="px-3 py-1 rounded-lg bg-slate-800/50 text-slate-500 text-xs cursor-not-allowed border border-slate-700/50"
                              title="Public students cannot alter attendance records"
                            >
                              Locked (Read-Only)
                            </button>
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
      )}
    </div>
  );
}

