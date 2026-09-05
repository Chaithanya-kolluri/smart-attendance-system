import React from 'react';

export default function Navbar({ activeTab, setActiveTab, selectedClass, systemStatus }) {
  const navItems = [
    { id: 'matrix', code: '01', label: 'Attendance Matrix', sub: 'High-Speed Mark' },
    { id: 'timetable', code: '02', label: 'Schedule Timetable', sub: 'GTTC Master Grid' },
    { id: 'reports', code: '03', label: 'Class Reports', sub: 'Turnout & Analytics' },
    { id: 'students', code: '04', label: 'Student Directory', sub: 'Onboard & Faces' },
    { id: 'classes', code: '05', label: 'Class Registry', sub: 'Division Mappings' }
  ];

  const isConnected = systemStatus?.status === 'healthy';

  return (
    <header className="border-b border-[#2E1C22] bg-[#0D0B0D]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Mark with Crimson Cybernetic Core */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xs bg-[#161114] border border-[#FF2A4B]/30 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF2A4B] to-[#E60033] opacity-25 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-2 h-2 bg-[#FF2A4B] rounded-none rotate-45 shadow-[0_0_12px_#FF2A4B]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-white uppercase">
                  Aura <span className="text-[#FF2A4B] font-mono text-xs tracking-widest font-normal">//</span> Cyber
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-widest text-[#FF2A4B] bg-[#FF2A4B]/10 border border-[#FF2A4B]/30 rounded-xs uppercase">
                  {selectedClass?.code || 'DAIML'}
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-[#B3A2A8] uppercase">
                IoT Attendance & Biometrics
              </span>
            </div>
          </div>

          {/* Desktop Navigation (5 Streamlined Tabs) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative px-3 lg:px-4 py-2.5 transition-all duration-200 rounded-xs text-left ${
                    isActive
                      ? 'text-white'
                      : 'text-[#B3A2A8] hover:text-white'
                  }`}
                >
                  {/* Glowing Crimson Underline Accent */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FF2A4B] shadow-[0_0_12px_#FF2A4B]" />
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono tracking-widest ${
                      isActive ? 'text-[#FF2A4B] font-bold' : 'text-[#7A6970] group-hover:text-[#B3A2A8]'
                    }`}>
                      {item.code}
                    </span>
                    <span className="text-xs font-semibold tracking-tight uppercase font-mono">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Micro Telemetry Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xs bg-[#161114] border border-[#2E1C22] text-[11px] font-mono">
              <span className="text-[#B3A2A8]">DB:</span>
              <span className={systemStatus?.database?.includes('Supabase') ? 'text-[#FF2A4B] font-medium' : 'text-[#FFB800] font-medium'}>
                {systemStatus?.database?.includes('Supabase') ? 'POSTGRES' : 'LOCAL.CACHE'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-[#161114] border border-[#2E1C22]">
              <span className={`w-1.5 h-1.5 rounded-none rotate-45 ${
                isConnected ? 'bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse' : 'bg-[#FF2A4B]'
              }`} />
              <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-neutral-300">
                {isConnected ? 'CORE: ONLINE' : 'CORE: READY'}
              </span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between border-t border-[#2E1C22] py-2 overflow-x-auto gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap ${
                  isActive ? 'text-[#FF2A4B] font-bold border-b-2 border-[#FF2A4B]' : 'text-[#B3A2A8]'
                }`}
              >
                <span>{item.code} {item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
