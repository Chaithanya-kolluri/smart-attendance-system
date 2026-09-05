import React from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Zap,
  Coffee
} from 'lucide-react';
import { GTTC_METADATA, GTTC_SUBJECTS, WEEKLY_SCHEDULE } from '../data/timetableData';

export default function TimetableScheduleView({ onSelectSlotForAttendance }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-24 animate-reveal">
      
      {/* Official Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#ccff00] uppercase font-semibold">
              04.0 // Master Schedule Matrix
            </span>
            <span className="h-px w-10 bg-white/[0.1]" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              GTTC Centre Code: STU - 35
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tighter text-white uppercase leading-[0.95]">
            Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">Timetable.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-mono">
            {GTTC_METADATA.institution} • {GTTC_METADATA.course} ({GTTC_METADATA.semester})
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.02] border border-white/[0.08] rounded-xs text-neutral-300">
            <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-none rotate-45" />
            <span>Theory Session</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-xs text-[#ccff00]">
            <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-none rotate-45" />
            <span>Laboratory Block</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.02] border border-white/[0.08] rounded-xs text-neutral-400">
            <Coffee className="w-3 h-3 text-[#f59e0b]" />
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
              className="p-5 bg-[#0c0c10] border border-white/[0.08] rounded-sm hover:border-white/[0.18] transition-colors"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-none rotate-45 bg-[#ccff00]" />
                  <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight">
                    {day}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    Instructional Sequence
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  8:00 AM — 5:30 PM IST
                </span>
              </div>

              {/* Day Period Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {scheduleSlots.map((slot, idx) => {
                  const isBreak = slot.isBreak;
                  const isLab = slot.type === 'Lab';
                  const isSpecial = slot.type === 'Special';

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!isBreak) {
                          onSelectSlotForAttendance(slot, day);
                        }
                      }}
                      className={`p-3 rounded-xs border flex flex-col justify-between transition-all duration-200 ${
                        isBreak 
                          ? 'bg-black/30 border-white/[0.04] opacity-50 cursor-default'
                          : isLab
                          ? 'bg-[#ccff00]/5 border-[#ccff00]/25 hover:border-[#ccff00] hover:bg-[#ccff00]/10 cursor-pointer group'
                          : 'bg-white/[0.02] border-white/[0.08] hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 cursor-pointer group'
                      }`}
                    >
                      <div>
                        {/* Time Slot */}
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                          <span className={isLab ? 'text-[#ccff00] font-semibold' : 'text-neutral-400'}>
                            {slot.start} - {slot.end}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500">
                            {slot.type}
                          </span>
                        </div>

                        {/* Subject Title */}
                        <div className="text-xs font-display font-bold text-white uppercase tracking-tight group-hover:text-[#ccff00] transition-colors leading-snug">
                          {slot.subject}
                        </div>

                        {/* Course Code */}
                        <div className="text-[10px] font-mono text-neutral-400 mt-1">
                          {slot.code}
                        </div>
                      </div>

                      {/* Footer: Faculty & One-Click Trigger */}
                      <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] font-mono text-neutral-500">
                        <span className="truncate max-w-[120px]">
                          {slot.faculty ? slot.faculty.split(' ')[0] + ' ' + (slot.faculty.split(' ')[1] || '') : ''}
                        </span>

                        {!isBreak && (
                          <span className="text-[9px] text-[#ccff00] opacity-0 group-hover:opacity-100 uppercase tracking-widest font-bold flex items-center gap-0.5 transition-opacity">
                            Mark <ArrowRight className="w-2.5 h-2.5" />
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

      {/* Official Course Coordinators Reference Table */}
      <div className="mt-14 pt-8 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#ccff00] uppercase font-bold">
              Official Syllabus Registry
            </span>
            <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight mt-1">
              Course Details & Faculty Coordinators
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">
            Govt. of Karnataka Approved
          </span>
        </div>

        <div className="border border-white/[0.08] rounded-sm overflow-x-auto bg-[#0c0c10]">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/40 text-[10px] text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Sl.No</th>
                <th className="py-3.5 px-4 font-semibold">Course Code</th>
                <th className="py-3.5 px-6 font-semibold">Course Name</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Hours/Wk</th>
                <th className="py-3.5 px-6 font-semibold">Course Co-ordinator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {GTTC_SUBJECTS.map((sub) => (
                <tr key={sub.slNo} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 text-neutral-500">{sub.slNo}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] text-[#ccff00] font-bold rounded-xs">
                      {sub.courseCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-white font-sans font-semibold">
                    {sub.courseName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded-2xs ${
                      sub.type === 'Lab' 
                        ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30' 
                        : 'bg-white/[0.03] text-neutral-300 border border-white/[0.08]'
                    }`}>
                      {sub.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">{sub.hoursPerWeek} hrs</td>
                  <td className="py-3.5 px-6 text-neutral-200 font-sans font-medium">
                    {sub.coordinator}
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
