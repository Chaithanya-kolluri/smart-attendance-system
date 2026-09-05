import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LaptopRegistration from './components/LaptopRegistration';
import StudentView from './components/StudentView';
import TeacherDashboard from './components/TeacherDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('registration');
  const [systemStatus, setSystemStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch {
      setSystemStatus({
        status: 'disconnected',
        database: 'OFFLINE'
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleStudentRegistered = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-white selection:bg-[#ccff00] selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Ambient Layered Grid & Soft Radial Lighting */}
      <div className="fixed inset-0 pointer-events-none bg-architectural-grid opacity-60 z-0" />
      <div className="fixed inset-0 pointer-events-none bg-ambient-noise z-0" />

      {/* Main Structural Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Gallery-Grade Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          systemStatus={systemStatus}
        />

        {/* Content Viewport with Fluid Animation */}
        <main className="flex-1">
          {activeTab === 'registration' && (
            <LaptopRegistration onStudentRegistered={handleStudentRegistered} />
          )}
          {activeTab === 'student' && (
            <StudentView key={refreshKey} />
          )}
          {activeTab === 'teacher' && (
            <TeacherDashboard key={refreshKey} />
          )}
        </main>

        {/* Architectural Footer */}
        <footer className="border-t border-white/[0.08] bg-[#070709]/80 backdrop-blur-md py-8">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-none rotate-45 shadow-[0_0_6px_#ccff00]" />
              <span className="text-neutral-400">Aura Smart Attendance</span>
              <span>•</span>
              <span>React 19 + Express + Supabase + Raspberry Pi 4</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-600">
              <span>RAM ALLOCATION: 2GB FIXED</span>
              <span>•</span>
              <span className="text-neutral-400">BUILD: REVAMP.V2.PROD</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
