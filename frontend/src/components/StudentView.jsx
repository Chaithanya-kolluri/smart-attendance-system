import React, { useState } from 'react';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function StudentView() {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const sampleIds = ['STU101', 'STU102', 'STU103', 'STU201'];

  const fetchStudentReport = async (idToQuery) => {
    const id = idToQuery || searchId;
    if (!id || !id.trim()) {
      setError('Please provide a valid Student ID.');
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
        setError(data.error || `No attendance record found for subject ID: ${id}`);
      }
    } catch (err) {
      console.error('Error fetching student report:', err);
      setError('Connection failure with attendance server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudentReport(searchId);
  };

  const totalLogs = report?.records?.length || 0;
  const presentCount = report?.records?.filter(r => r.status === 'Present').length || 0;
  const lateCount = report?.records?.filter(r => r.status === 'Late').length || 0;
  const attendanceRate = totalLogs > 0 ? Math.round(((presentCount + lateCount * 0.75) / totalLogs) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-12 pb-24 animate-reveal">
      
      {/* Editorial Header */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#3b82f6] uppercase font-semibold">
            02.0 // Public Ledger
          </span>
          <span className="h-px w-12 bg-white/[0.1]" />
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            Read-Only Verification
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.92]">
          Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Record.</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl font-normal leading-relaxed">
          Search your unique institutional identifier to pull immutable chronological check-in events recorded by IoT edge vision sensors.
        </p>
      </div>

      {/* Minimalist Architectural Search Bar */}
      <div className="mb-14">
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
              ID //
            </div>
            <input
              type="text"
              placeholder="Enter Student ID (e.g. STU101, STU102)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-16 pr-4 py-4 bg-white/[0.02] border border-white/[0.1] rounded-sm text-base text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#3b82f6] focus:bg-white/[0.04] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="px-8 py-4 bg-white text-black hover:bg-[#3b82f6] hover:text-white font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <span>Querying Cluster...</span>
            ) : (
              <>
                <span>Inspect Logs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Selector Chips */}
        <div className="flex items-center gap-3 mt-4 text-[11px] font-mono text-neutral-500">
          <span className="uppercase tracking-widest">Sample Keys:</span>
          <div className="flex flex-wrap gap-2">
            {sampleIds.map((sid) => (
              <button
                key={sid}
                type="button"
                onClick={() => {
                  setSearchId(sid);
                  fetchStudentReport(sid);
                }}
                className="px-2.5 py-0.5 rounded-xs bg-white/[0.03] hover:bg-white/[0.08] hover:text-white text-neutral-400 border border-white/[0.08] transition"
              >
                {sid}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-10 p-4 border border-[#ff5500]/40 bg-[#ff5500]/10 text-[#ff5500] text-xs font-mono tracking-wide rounded-sm flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Display: Exhibition-Grade Layout */}
      {report && (
        <div className="space-y-16 animate-reveal">
          
          {/* Typographic Identity & Giant KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-y border-white/[0.08] py-10">
            
            {/* Subject Profile Block (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.08] pb-8 md:pb-0 md:pr-8">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase font-bold">
                  Verified Identity
                </span>
                <h2 className="font-display text-4xl font-extrabold text-white tracking-tight mt-1 uppercase">
                  {report.student?.name || 'Unknown Subject'}
                </h2>
                <div className="mt-3 flex items-center gap-3 font-mono text-xs text-neutral-400">
                  <span className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] text-white">
                    {report.student?.id}
                  </span>
                  <span>DIVISION: {report.student?.class_assigned || 'General'}</span>
                </div>
              </div>

              <div className="mt-6 text-[11px] font-mono text-neutral-500">
                STATUS // ACADEMIC STANDING: ACTIVE
              </div>
            </div>

            {/* Giant Stat: Attendance Ratio (4 cols) */}
            <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.08] pb-8 md:pb-0 md:pr-8">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase font-semibold">
                  Cumulative Ratio
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-6xl sm:text-7xl font-extrabold text-[#ccff00] tracking-tighter">
                    {attendanceRate}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-4">
                Verified compliance threshold &gt; 75.0%
              </p>
            </div>

            {/* Total Sessions Attended (3 cols) */}
            <div className="md:col-span-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase font-semibold">
                  Logged Invocations
                </span>
                <div className="font-display text-5xl sm:text-6xl font-extrabold text-white tracking-tighter mt-1">
                  {totalLogs}
                </div>
              </div>
              <div className="text-xs font-mono text-neutral-400 mt-4">
                {presentCount} ON-TIME • {lateCount} DELAYED
              </div>
            </div>

          </div>

          {/* Chronological Historical Log Ledger */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-none rotate-45 bg-[#3b82f6]" />
                <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight">
                  Chronological Ledger
                </h3>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                Read-Only Interface // Modification Prohibited
              </span>
            </div>

            {report.records.length === 0 ? (
              <div className="py-16 text-center border border-white/[0.06] rounded-sm bg-white/[0.01]">
                <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                <p className="text-sm font-mono text-neutral-300">Zero log entries found for this ID.</p>
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  New records sync as edge cameras register biometric frames.
                </p>
              </div>
            ) : (
              <div className="border-t border-white/[0.08] overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] text-neutral-500 uppercase tracking-widest">
                      <th className="py-4 pr-6 font-semibold">01 // Timestamp</th>
                      <th className="py-4 px-6 font-semibold">02 // Class Session</th>
                      <th className="py-4 px-6 font-semibold">03 // Status</th>
                      <th className="py-4 px-6 font-semibold">04 // Verification Node</th>
                      <th className="py-4 pl-6 text-right font-semibold">Access State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {report.records.map((log) => {
                      const logDate = new Date(log.timestamp);
                      const dateStr = logDate.toISOString().split('T')[0];
                      const timeStr = logDate.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });

                      const isPresent = log.status === 'Present';
                      const isLate = log.status === 'Late';

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-6">
                            <span className="text-white font-semibold">{dateStr}</span>
                            <span className="text-neutral-500 ml-2 text-[11px]">{timeStr}</span>
                          </td>
                          <td className="py-4 px-6 text-neutral-300 font-semibold">
                            {log.class_name}
                          </td>
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
                              {log.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-neutral-500 text-[11px]">
                            IoT Edge Biometric Node
                          </td>
                          <td className="py-4 pl-6 text-right">
                            {/* Disabled modification control per prompt instructions */}
                            <span className="inline-block text-[10px] text-neutral-600 uppercase tracking-widest px-2 py-1 bg-white/[0.02] border border-white/[0.04] cursor-not-allowed">
                              Locked
                            </span>
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
