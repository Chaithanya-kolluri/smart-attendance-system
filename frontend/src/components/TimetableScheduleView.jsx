import React from 'react';
import { 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Coffee 
} from 'lucide-react';
import { GTTC_METADATA, GTTC_SUBJECTS, WEEKLY_SCHEDULE } from '../data/timetableData';

export default function TimetableScheduleView({ onSelectSlotForAttendance }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Official Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2E1C22]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#FF2A4B] uppercase font-semibold">
              02.0 // Master Schedule Matrix
            </span>
            <span className="h-px w-10 bg-[#421B24]" />
            <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">
              GTTC Centre Code: STU - 35
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
            Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF2A4B]">Timetable.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#B3A2A8] font-sans max-w-xl">
            {GTTC_METADATA.institution} • {GTTC_METADATA.course} ({GTTC_METADATA.semester})
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161114] border border-[#2E1C22] rounded-xs text-[#B3A2A8]">
            <span className="w-1.5 h-1.5 bg-[#FF2A4B] rounded-none rotate-45 shadow-[0_0_6px_#FF2A4B]" />
            <span>Theory Session</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161114] border border-[#00FF88]/30 rounded-xs text-[#00FF88]">
            <span className="w-1.5 h-1.5 bg-[#00FF88] rounded-none rotate-45 shadow-[0_0_6px_#00FF88]" />
            <span>Laboratory Block</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161114] border border-[#2E1C22] rounded-xs text-[#B3A2A8]">
            <Coffee className="w-3 h-3 text-[#FFB800]" />
            <span>Break / Assembly</span>
          </div>
        </div>
      </div>

      {/* Interactive Schedule Day-By-Day Grid */}
      <div className="pt-8 space-y-6">
        {days.map((day) => {
          const scheduleSlots = WEEKLY_SCHEDULE[day] || [];

          return (
            <div 
              key={day} 
              className="p-5 bg-[#161114] border border-[#2E1C22] rounded-md transition hover:border-[#FF2A4B]/40"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2E1C22]">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#FF2A4B] rounded-none rotate-45 shadow-[0_0_8px_#FF2A4B]" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    {day}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#B3A2A8] uppercase">
                  {scheduleSlots.filter(s => !s.isBreak).length} Academic Periods
                </span>
              </div>

              {/* Day Period Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {scheduleSlots.map((slot, idx) => {
                  const isBreak = slot.isBreak;
                  const isLab = slot.type === 'Lab';
                  const isMath = slot.code === '24AI31T' || slot.subject?.toLowerCase().includes('em');

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!isBreak) {
                          onSelectSlotForAttendance(slot, day);
                        }
                      }}
                      className={`p-3.5 rounded-sm border transition flex flex-col justify-between min-h-[110px] ${
                        isBreak 
                          ? 'bg-[#0D0B0D]/60 border-[#2E1C22] text-[#7A6970] cursor-default'
                          : 'bg-[#0D0B0D] border-[#2E1C22] hover:border-[#FF2A4B] hover:shadow-[0_0_15px_rgba(255,42,75,0.15)] cursor-pointer group'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#B3A2A8] mb-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#FF2A4B]" />
                            {slot.start} - {slot.end}
                          </span>
                          {!isBreak && (
                            <span className={`px-1 py-0.2 rounded-2xs text-[9px] uppercase font-bold ${
                              isLab 
                                ? 'text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/20'
                                : 'text-[#FF2A4B] bg-[#FF2A4B]/10 border border-[#FF2A4B]/20'
                            }`}>
                              {slot.type}
                            </span>
                          )}
                        </div>

                        <h4 className={`text-xs font-mono font-bold tracking-tight uppercase line-clamp-2 ${
                          isBreak ? 'text-[#7A6970]' : 'text-white group-hover:text-[#FF2A4B] transition'
                        }`}>
                          {slot.subject}
                        </h4>

                        {slot.code && (
                          <div className="text-[10px] font-mono text-[#B3A2A8] mt-0.5">
                            {slot.code} {isMath && <span className="text-[#FF2A4B] text-[9px]">(Theory)</span>}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#2E1C22] flex items-center justify-between text-[9px] font-mono text-[#7A6970]">
                        {slot.faculty ? (
                          <span className="truncate max-w-[130px]">{slot.faculty}</span>
                        ) : (
                          <span>General Schedule</span>
                        )}
                        
                        {!isBreak && (
                          <span className="text-[#FF2A4B] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                            MARK <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Course Master Table */}
      <div className="mt-12 p-6 bg-[#161114] border border-[#2E1C22] rounded-md">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2E1C22]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-[#FF2A4B]" />
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Approved Course Registry & Faculty Coordinators (STU - 35)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#B3A2A8] uppercase">Semester III</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#2E1C22] text-[10px] text-[#B3A2A8] uppercase tracking-widest bg-[#0D0B0D]">
                <th className="py-2.5 px-3">Course Code</th>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3">Curriculum Mode</th>
                <th className="py-2.5 px-3">Faculty Coordinator</th>
                <th className="py-2.5 px-3 text-right">Lab Syllabus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E1C22]">
              {GTTC_SUBJECTS.map((s) => (
                <tr key={s.courseCode} className="hover:bg-[#1D151B] transition">
                  <td className="py-2.5 px-3 font-bold text-[#FF2A4B]">{s.courseCode}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">{s.courseName}</td>
                  <td className="py-2.5 px-3 text-[#B3A2A8]">{s.type}</td>
                  <td className="py-2.5 px-3 text-white">{s.coordinator}</td>
                  <td className="py-2.5 px-3 text-right">
                    {s.hasLab ? (
                      <span className="text-[#00FF88] text-[10px] font-bold">Yes (Lab Sessions Mapped)</span>
                    ) : (
                      <span className="text-[#FF2A4B] text-[10px] font-bold">Strictly Theory-Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
