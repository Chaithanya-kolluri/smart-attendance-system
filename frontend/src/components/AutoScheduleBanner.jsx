import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  User, 
  Coffee, 
  CheckCircle2, 
  BookOpen, 
  RotateCw,
  Zap
} from 'lucide-react';
import { getLiveSlotInIST, WEEKLY_SCHEDULE, GTTC_METADATA } from '../data/timetableData';

export default function AutoScheduleBanner({ onSelectSlotForAttendance }) {
  // Real-time IST clock state
  const [istTimeStr, setIstTimeStr] = useState('');
  const [istDateStr, setIstDateStr] = useState('');
  
  // Simulation overrides (allows testing any day/time from GTTC timetable)
  const [simulatedDay, setSimulatedDay] = useState('');
  const [simulatedTime, setSimulatedTime] = useState('');

  // Update real-time IST clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      setIstTimeStr(timeFormatter.format(now));
      setIstDateStr(dateFormatter.format(now));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute active or upcoming timetable slot in IST
  const liveInfo = getLiveSlotInIST(
    simulatedDay || null, 
    simulatedTime || null
  );

  const activeSlot = liveInfo.activeSlot;
  const nextSlot = liveInfo.nextSlot;
  const targetSlot = activeSlot && !activeSlot.isBreak ? activeSlot : nextSlot;

  const handleQuickMarkAttendance = () => {
    if (targetSlot) {
      onSelectSlotForAttendance(targetSlot, liveInfo.activeDay);
    }
  };

  return (
    <div className="border-b border-white/[0.08] bg-gradient-to-r from-[#0c0c10] via-[#09090d] to-[#0c0c10] py-4 px-6 sm:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Real-Time IST Clock & Institution Metadata */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xs bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00]">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {istTimeStr || '01:21:00 PM'} IST
              </span>
              <span className="text-neutral-500 font-mono text-[10px]">•</span>
              <span className="text-[#ccff00] font-mono text-[10px] uppercase font-semibold">
                {simulatedDay ? `SIMULATED: ${simulatedDay}` : (istDateStr || 'Saturday, Sep 5')}
              </span>
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
              GTTC Devanahalli • STU-35 • {GTTC_METADATA.semester} DAIML
            </div>
          </div>
        </div>

        {/* Center: Live Timetable Slot Card */}
        <div className="flex-1 max-w-xl mx-auto lg:mx-4 p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-xs flex items-center justify-between gap-3">
          {targetSlot ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <span className={`w-2 h-2 rounded-none rotate-45 flex-shrink-0 ${
                activeSlot && !activeSlot.isBreak ? 'bg-[#ccff00] shadow-[0_0_8px_#ccff00]' : 'bg-[#3b82f6]'
              }`} />
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                    {activeSlot && !activeSlot.isBreak ? 'CURRENT ACTIVE PERIOD:' : 'NEXT SCHEDULED PERIOD:'}
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold text-white bg-white/[0.08] border border-white/[0.1] rounded-2xs">
                    {targetSlot.start} - {targetSlot.end} IST
                  </span>
                </div>
                <div className="text-xs font-display font-bold text-white uppercase tracking-tight truncate mt-0.5">
                  {targetSlot.subject} <span className="font-mono text-[11px] font-normal text-neutral-400">({targetSlot.code})</span>
                </div>
                {targetSlot.faculty && (
                  <div className="text-[10px] font-mono text-neutral-500 truncate">
                    Faculty: {targetSlot.faculty} {targetSlot.batch ? `• Batch: ${targetSlot.batch}` : ''}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-neutral-400">
              {liveInfo.message || 'No scheduled periods active.'}
            </div>
          )}

          {/* Quick Mark Attendance Action Button */}
          {targetSlot && !targetSlot.isBreak && (
            <button
              type="button"
              onClick={handleQuickMarkAttendance}
              className="flex-shrink-0 px-3.5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-black font-mono text-[10px] uppercase tracking-wider font-bold rounded-xs shadow-[0_0_12px_rgba(204,255,0,0.3)] transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Mark This Slot</span>
            </button>
          )}
        </div>

        {/* Right: Quick Timetable Day/Slot Simulator Selector */}
        <div className="flex items-center gap-2 self-end lg:self-auto font-mono text-xs">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
            Slot Tester:
          </span>
          <select
            value={simulatedDay ? `${simulatedDay}|${simulatedTime}` : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSimulatedDay('');
                setSimulatedTime('');
              } else {
                const [d, t] = val.split('|');
                setSimulatedDay(d);
                setSimulatedTime(t);
              }
            }}
            className="px-2.5 py-1.5 bg-[#070709] border border-white/[0.15] text-[11px] font-mono text-neutral-200 rounded-xs focus:outline-none focus:border-[#ccff00]"
          >
            <option value="">⏰ Live Real-Time (IST)</option>
            <option value="Monday|09:00">Mon 8:30 AM — EM FOR AI (Theory)</option>
            <option value="Monday|11:00">Mon 10:45 AM — PYTHON (Theory)</option>
            <option value="Monday|12:00">Mon 11:45 AM — C++ (Theory)</option>
            <option value="Monday|14:00">Mon 1:15 PM — MC & ES Lab / C++ Lab</option>
            <option value="Tuesday|09:00">Tue 8:30 AM — MC & ES (Theory)</option>
            <option value="Wednesday|11:00">Wed 10:45 AM — EM FOR AI (Theory)</option>
            <option value="Wednesday|14:00">Wed 1:15 PM — Python Lab / DBMS Lab</option>
            <option value="Thursday|11:00">Thu 10:45 AM — C++ (Theory)</option>
            <option value="Friday|09:00">Fri 8:30 AM — EM Revision</option>
            <option value="Friday|14:30">Fri 2:15 PM — SPORTS</option>
          </select>
        </div>

      </div>
    </div>
  );
}
