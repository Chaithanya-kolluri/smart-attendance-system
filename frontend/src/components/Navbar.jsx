import React from 'react';

export default function Navbar({ activeTab, setActiveTab, selectedClass, systemStatus }) {
  const navItems = [
    { id: 'matrix', code: '01', label: 'Attendance Matrix', sub: 'High-Speed Mark' },
    { id: 'students', code: '02', label: 'Student Directory', sub: 'CRUD Roster' },
    { id: 'classes', code: '03', label: 'Class Registry', sub: 'Dynamic Divisions' },
    { id: 'biometrics', code: '04', label: 'Biometric Scanner', sub: '128-D Ingestion' }
  ];

  const isConnected = systemStatus?.status === 'healthy';

  return (
    <header className="border-b border-white/[0.08] bg-[#070709]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Mark */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xs bg-white/[0.04] border border-white/[0.12] group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2563eb] to-[#ccff00] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-2 h-2 bg-[#ccff00] rounded-none rotate-45 shadow-[0_0_12px_#ccff00]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-white uppercase">
                  Aura <span className="text-[#ccff00] font-mono text-xs tracking-widest font-normal">//</span> Studio
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-widest text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-xs uppercase">
                  {selectedClass?.code || 'DAIML'}
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                Student Management & IoT Attendance
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative px-4 py-2.5 transition-all duration-300 rounded-xs text-left ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {/* Glowing Underline Accent */}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#ccff00] shadow-[0_0_10px_#ccff00]" />
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono tracking-widest ${
                      isActive ? 'text-[#ccff00] font-bold' : 'text-neutral-600 group-hover:text-neutral-400'
                    }`}>
                      {item.code}
                    </span>
                    <span className="text-xs font-semibold tracking-tight uppercase font-sans">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Micro Telemetry Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xs bg-white/[0.02] border border-white/[0.08] text-[11px] font-mono">
              <span className="text-neutral-500">DB:</span>
              <span className={systemStatus?.database?.includes('Supabase') ? 'text-[#ccff00] font-medium' : 'text-[#3b82f6] font-medium'}>
                {systemStatus?.database?.includes('Supabase') ? 'POSTGRES' : 'LOCAL.MEM'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-white/[0.03] border border-white/[0.08]">
              <span className={`w-1.5 h-1.5 rounded-none rotate-45 ${
                isConnected ? 'bg-[#ccff00] shadow-[0_0_8px_#ccff00] animate-pulse' : 'bg-[#ff5500]'
              }`} />
              <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-neutral-300">
                {isConnected ? 'NODE: ONLINE' : 'NODE: LOCAL'}
              </span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between border-t border-white/[0.06] py-2 overflow-x-auto gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap ${
                  isActive ? 'text-[#ccff00] font-bold border-b border-[#ccff00]' : 'text-neutral-400'
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
