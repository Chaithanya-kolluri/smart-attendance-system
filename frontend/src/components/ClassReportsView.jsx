import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Search,
  CheckCircle2,
  XCircle,
  Clock
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
      s.courseCode.toLowerCase().includes(subjectId.toLowerCase())
    );

    const subjectName = gttcMatch ? gttcMatch.courseName : subjectId.toUpperCase();
    const courseCode = gttcMatch ? gttcMatch.courseCode : subjectId.toUpperCase();

    // Calculate metrics
    const studentEntries = Object.entries(studentMap);
    const totalMarked = studentEntries.length;
    const presentCount = studentEntries.filter(([, status]) => status === 'Present').length;
    const lateCount = studentEntries.filter(([, status]) => status === 'Late').length;
    const absentCount = studentEntries.filter(([, status]) => status === 'Absent').length;
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
      totalMarked,
      presentCount,
      lateCount,
      absentCount,
      turnoutRatio,
      studentMap
    };
  }).filter(s => s.classId === currentClass?.id);

  // Filter reports by search query
  const filteredReports = sessionEntries.filter(report => {
    const q = searchQuery.toLowerCase();
    return (
      report.subjectName.toLowerCase().includes(q) ||
      report.courseCode.toLowerCase().includes(q) ||
      report.dateStr.includes(q) ||
      report.sessionType.toLowerCase().includes(q)
    );
  });

  const handleCopySummary = (report) => {
    const text = `GTTC DEVANAHALLI • ATTENDANCE REPORT
Division: ${currentClass?.code}
Course: ${report.courseCode} - ${report.subjectName} (${report.sessionType})
Date: ${report.dateStr}
Turnout: ${report.turnoutRatio}% (${report.presentCount}/${report.totalMarked} Present, ${report.lateCount} Late, ${report.absentCount} Absent)
Generated via Aura Cybernetic Studio`;

    navigator.clipboard.writeText(text);
    setCopiedKey(report.sessionKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2E1C22]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#FF2A4B] uppercase font-semibold">
              03.0 // Session Attendance Records
            </span>
            <span className="h-px w-10 bg-[#421B24]" />
            <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">
              {currentClass?.code} Turnout & Dossiers
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
            Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF2A4B]">Reports.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#B3A2A8] font-sans max-w-xl">
            Audit recorded sessions, review candidate turnout ratios, and export clean attendance summaries for GTTC administrative records.
          </p>
        </div>

        {/* Global Print / PDF Action */}
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#161114] hover:bg-[#FF2A4B] text-[#B3A2A8] hover:text-white border border-[#2E1C22] hover:border-[#FF2A4B] rounded-sm text-xs font-mono uppercase tracking-wider font-bold transition"
        >
          <Printer className="w-4 h-4 text-[#FF2A4B]" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="py-6 border-b border-[#2E1C22] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#7A6970] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search recorded sessions by subject, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#161114] border border-[#2E1C22] rounded-sm text-xs font-mono text-white placeholder-[#7A6970] focus:border-[#FF2A4B] outline-none transition"
          />
        </div>

        <span className="text-xs font-mono text-[#B3A2A8]">
          Total Recorded Sessions: <strong className="text-white">{sessionEntries.length}</strong>
        </span>
      </div>

      {/* Reports List */}
      <div className="pt-8 space-y-4">
        {filteredReports.length === 0 ? (
          <div className="py-16 text-center border border-[#2E1C22] rounded-sm bg-[#161114]/40">
            <FileText className="w-8 h-8 text-[#7A6970] mx-auto mb-3" />
            <p className="text-sm font-mono text-[#B3A2A8]">No recorded class reports found.</p>
            <p className="text-xs font-mono text-[#7A6970] mt-1">
              Mark attendance in 01 // Attendance Matrix to generate reports.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isExpanded = expandedSessionKey === report.sessionKey;

            return (
              <div 
                key={report.sessionKey}
                className="bg-[#161114] border border-[#2E1C22] hover:border-[#FF2A4B]/40 rounded-sm overflow-hidden transition"
              >
                {/* Session Card Header */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#FF2A4B]/10 text-[#FF2A4B] border border-[#FF2A4B]/30 rounded-2xs">
                        {report.courseCode}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#2E1C22] text-[#B3A2A8] rounded-2xs">
                        {report.sessionType}
                      </span>
                      <span className="text-xs font-mono text-[#B3A2A8]">
                        Date: <strong className="text-white">{report.dateStr}</strong>
                      </span>
                    </div>

                    <h3 className="font-mono text-base font-bold text-white uppercase tracking-tight">
                      {report.subjectName}
                    </h3>
                  </div>

                  {/* Turnout Ratios & Metrics */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-[#00FF88] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {report.presentCount} Present
                      </span>
                      <span className="text-[#FFB800] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {report.lateCount} Late
                      </span>
                      <span className="text-[#FF2A4B] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {report.absentCount} Absent
                      </span>
                    </div>

                    <div className="px-3 py-1 bg-[#0D0B0D] border border-[#2E1C22] rounded-xs font-mono text-xs font-bold text-white">
                      Turnout: <span className="text-[#FF2A4B]">{report.turnoutRatio}%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopySummary(report)}
                      className="p-2 bg-[#0D0B0D] hover:bg-[#2E1C22] text-[#B3A2A8] hover:text-white border border-[#2E1C22] rounded-xs transition"
                      title="Copy Summary to Clipboard"
                    >
                      {copiedKey === report.sessionKey ? (
                        <Check className="w-4 h-4 text-[#00FF88]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedSessionKey(isExpanded ? null : report.sessionKey)}
                      className="p-2 bg-[#0D0B0D] hover:bg-[#2E1C22] text-[#B3A2A8] hover:text-white border border-[#2E1C22] rounded-xs transition"
                      title={isExpanded ? 'Collapse Candidate List' : 'Expand Candidate List'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Student-by-Student Table */}
                {isExpanded && (
                  <div className="border-t border-[#2E1C22] bg-[#0D0B0D] p-4 sm:p-5">
                    <h4 className="text-xs font-mono text-[#B3A2A8] uppercase tracking-wider mb-3">
                      Candidate Breakdown ({Object.keys(report.studentMap).length} Logged)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(report.studentMap).map(([studentId, status]) => {
                        const studentObj = students.find(s => s.id === studentId || s.rollNumber === studentId);
                        const isPresent = status === 'Present';
                        const isLate = status === 'Late';

                        return (
                          <div 
                            key={studentId}
                            className="p-2.5 bg-[#161114] border border-[#2E1C22] rounded-xs flex items-center justify-between text-xs font-mono"
                          >
                            <div className="truncate mr-2">
                              <div className="font-bold text-white truncate">
                                {studentObj ? studentObj.name : studentId}
                              </div>
                              <div className="text-[10px] text-[#7A6970]">
                                {studentObj?.rollNumber || studentId}
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-2xs ${
                              isPresent 
                                ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20'
                                : isLate 
                                ? 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20'
                                : 'bg-[#FF2A4B]/10 text-[#FF2A4B] border border-[#FF2A4B]/20'
                            }`}>
                              {status}
                            </span>
                          </div>
                        );
                      })}
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
