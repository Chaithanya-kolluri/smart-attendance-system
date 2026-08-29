import { useEffect, useState } from 'react';
import './App.css';

interface Attendance {
  id: number;
  student_name: string;
  time: string;
  status: string;
}

interface Stats {
  total_students: number;
  present: number;
  absent: number;
}

function App() {
  const [data, setData] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchAll = async () => {
      try {
        const [attendanceRes, statsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/attendance/today'),
          fetch('http://127.0.0.1:8000/api/attendance/stats')
        ]);

        if (!attendanceRes.ok || !statsRes.ok) throw new Error('Failed to fetch data');

        const attendanceData = await attendanceRes.json();
        const statsData = await statsRes.json();

        setData(attendanceData);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchAll();

    // 2. WebSocket Connection
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/attendance');

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'attendance_marked') {
        const newRecord: Attendance = {
          id: message.id,
          student_name: message.student_name,
          time: message.time,
          status: message.status
        };
        setData(prev => [newRecord, ...prev]);
        setStats(prev => prev ? {...prev, present: prev.present + 1, absent: prev.absent - 1} : null);
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div id="center">
      <h1>Live Attendance Dashboard</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && stats && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
            <div style={{ background: '#f4f3ec', padding: '15px', borderRadius: '8px' }}>
                <p>Present</p>
                <h3>{stats.present}</h3>
            </div>
            <div style={{ background: '#f4f3ec', padding: '15px', borderRadius: '8px' }}>
                <p>Absent</p>
                <h3>{stats.absent}</h3>
            </div>
            <div style={{ background: '#f4f3ec', padding: '15px', borderRadius: '8px' }}>
                <p>Total</p>
                <h3>{stats.total_students}</h3>
            </div>
        </div>
      )}

      {!loading && !error && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Check-in Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(rec => (
              <tr key={rec.id}>
                <td>{rec.student_name}</td>
                <td>{new Date(rec.time).toLocaleTimeString()}</td>
                <td>{rec.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
