import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';
import { GTTC_SUBJECTS } from '../data/timetableData';

export default function ClassReportsView({ 
  attendanceLogs, 
  students, 
  classes, 
  selectedClassId 
}) {
  const [expandedSessionKey, setExpandedSessionKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Convert raw session keys into rich structured report objects
  // Key format: `${classId}_${subjectId}_${sessionType}_${dateStr}`
  const sessionEntries = Object.entries(attendanceLogs).map(([key, studentMap]) => {
    const parts = key.split('_');
    const classId = parts[0] || 'daiml';
    const subjectId = parts[1] || 'em-ai';
    const sessionType = parts[2] || 'Theory';
    const dateStr = parts[3] || new Date().toISOString().split('T')[0];

    // Find subject metadata
    const gttcMatch = GTTC_SUBJECTS.find(s => 
      s.courseCode.toLowerCase() === subjectId.toLowerCase() ||
      s.shortCode.toLowerCase() === subjectId.toLowerCase() ||
      s.id === subjectId
    );

    const subjectName = gttcMatch ? gttcMatch.courseName : subjectId.toUpperCase();
    const courseCode = gttcMatch ? gttcMatch.courseCode : '24AI3X';
    const coordinator = gttcMatch ? gttcMatch.coordinator : 'Course Faculty';

    // Calculate metrics
    const studentEntries = Object.entries(studentMap);
    const totalMarked = studentEntries.length;
    const presentCount = studentEntries.filter(([_, status]) => status === 'Present').length;
    const lateCount = studentEntries.filter(([_, status]) => status === 'Late').length;
    const absentCount = studentEntries.filter(([_, status]) => status === 'Absent').length;
    const turnoutRatio = totalMarked > 0 
      ? Math.round(((presentCount + lateCount * 0.75) / totalMarked) * 100) 
      : 0;

    return {
      sessionKey: key,
      classId,
      subjectId,
      subjectName,
      courseCode,
      sessionType,
      dateStr,
      coordinator,
      totalMarked,
      presentCount,
      lateCount,
      absentCount,
      turnoutRatio,
      studentMap
    };
  });

  // Filter for active class and search query
  const filteredReports = sessionEntries
    .filter(r => r.classId === currentClass.id)
    .filter(r => {
      const q = searchQuery.toLowerCase();
      return r.subjectName.toLowerCase().includes(q) ||
             r.courseCode.toLowerCase().includes(q) ||
             r.dateStr.includes(q) ||
             r.coordinator.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr));

  // Copy Summary to Clipboard
  const handleCopySummary = (report) => {
    const text = `📋 GTTC DEVANAHALLI — CLASS ATTENDANCE REPORT
Course: Diploma in AIML (Sem III)
Subject: ${report.subjectName} (${report.courseCode})
Type: ${report.sessionType} Session
Date: ${report.dateStr} (IST)
Coordinator: ${report.coordinator}
----------------------------------------
Turnout: ${report.turnoutRatio}%
Total Enrolled: ${report.totalMarked}
Present: ${report.presentCount}
Late: ${report.lateCount}
Absent: ${report.absentCount}
----------------------------------------
Generated via Aura Smart Attendance System`;

    navigator.clipboard.writeText(text);
    setCopiedKey(report.sessionKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Print Window Trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#ccff00] uppercase font-semibold">
              05.0 // Recorded Class Reports
            </span>
            <span className="h-px w-10 bg-white/[0.1]" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              Class: {currentClass.code} • Institutional Audit
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tighter text-white uppercase leading-[0.95]">
            Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Ledgers.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-mono">
            Auditable, per-class attendance breakdown and instant institutional export.
          </p>
        </div>

        {/* Global Print Action */}
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1] rounded-xs font-mono text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / PDF Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.08]">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search report by subject, code, coordinator, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.1] rounded-sm text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition"
          />
        </div>

        <div className="text-[11px] font-mono text-neutral-400">
          Showing <span className="text-white font-bold">{filteredReports.length}</span> Recorded Class Sessions
        </div>
      </div>

      {/* Reports List */}
      <div className="pt-8 space-y-6">
        {filteredReports.length === 0 ? (
          <div className="py-24 text-center border border-white/[0.06] rounded-sm bg-white/[0.01]">
            <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-mono text-neutral-300">No recorded class sessions available yet.</p>
            <p className="text-xs font-mono text-neutral-600 mt-1">
              Mark attendance for any period via 01 // Attendance Matrix to generate reports here.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isExpanded = expandedSessionKey === report.sessionKey;

            return (
              <div 
                key={report.sessionKey}
                className="bg-[#0c0c10] border border-white/[0.08] rounded-sm hover:border-white/[0.18] transition-colors overflow-hidden"
              >
                {/* Session Header Card */}
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Metadata */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] text-[#ccff00] font-mono text-xs font-bold rounded-xs">
                        {report.courseCode}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-xs ${
                        report.sessionType === 'Lab' 
                          ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30'
                          : 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30'
                      }`}>
                        {report.sessionType} Session
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        Date: {report.dateStr} (IST)
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-white tracking-tight uppercase">
                      {report.subjectName}
                    </h3>

                    <div className="text-xs font-mono text-neutral-400 mt-1 flex items-center gap-4">
                      <span>Faculty: {report.coordinator}</span>
                      <span>•</span>
                      <span>Class: {currentClass.code}</span>
                    </div>
                  </div>

                  {/* Right KPI Summary & Quick Actions */}
                  <div className="flex items-center gap-6">
                    
                    {/* Turnout Metric */}
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                        Turnout Ratio
                      </div>
                      <div className="font-display text-3xl font-extrabold text-[#ccff00] tracking-tight mt-0.5">
                        {report.turnoutRatio}%
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        {report.presentCount} Present • {report.absentCount} Absent
                      </div>
                    </div>

                    {/* Copy Summary Action */}
                    <button
                      type="button"
                      onClick={() => handleCopySummary(report)}
                      className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] rounded-xs transition"
                      title="Copy Summary for WhatsApp/Telegram/Email"
                    >
                      {copiedKey === report.sessionKey ? (
                        <Check className="w-4 h-4 text-[#ccff00]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Expand/Collapse Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedSessionKey(isExpanded ? null : report.sessionKey)}
                      className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1] rounded-xs text-xs font-mono uppercase tracking-wider font-semibold transition flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? 'Collapse' : 'Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                  </div>

                </div>

                {/* Expanded Student-by-Student Roster Table */}
                {isExpanded && (
                  <div className="border-t border-white/[0.08] bg-black/40 p-6 animate-reveal">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-semibold">
                        Candidate Verification Register ({report.totalMarked} Logged)
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Timestamped in Indian Standard Time (IST)
                      </span>
                    </div>

                    <div className="border border-white/[0.06] rounded-xs overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] text-neutral-400 uppercase tracking-wider">
                            <th className="py-3 px-4">Roll Number</th>
                            <th className="py-3 px-6">Candidate Name</th>
                            <th className="py-3 px-6">Recorded Attendance Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {Object.entries(report.studentMap).map(([studentId, status]) => {
                            const student = students.find(s => s.id === studentId);
                            const roll = student ? student.rollNumber : studentId;
                            const name = student ? student.name : 'Unknown Candidate';

                            const isPresent = status === 'Present';
                            const isLate = status === 'Late';

                            return (
                              <tr key={studentId} className="hover:bg-white/[0.01]">
                                <td className="py-3 px-4 font-bold text-white">
                                  {roll}
                                </td>
                                <td className="py-3 px-6 text-neutral-300 font-sans">
                                  {name}
                                </td>
                                <td className="py-3 px-6">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded-2xs border ${
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
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
