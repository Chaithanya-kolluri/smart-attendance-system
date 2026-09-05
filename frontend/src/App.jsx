import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LaptopRegistration from './components/LaptopRegistration';
import StudentView from './components/StudentView';
import TeacherDashboard from './components/TeacherDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('registration');
  const [systemStatus, setSystemStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check Backend Health
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      console.warn('Backend currently unreachable on /api/health:', err.message);
      setSystemStatus({
        status: 'disconnected',
        database: 'Offline / Connecting...'
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStudentRegistered = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Smart Attendance System • React + Express + Supabase + Raspberry Pi 4</span>
          </div>
          <div className="text-[11px] text-slate-600 font-mono">
            Optimized for 2GB RAM Edge Deployment
          </div>
        </div>
      </footer>
    </div>
  );
}
