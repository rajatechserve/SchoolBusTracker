import React, { useState, useEffect } from 'react';
import api, { getAuthUser } from '../services/api';

export default function ParentDashboard() {
  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = getAuthUser();
      
      // Get parent details
      const parentRes = await api.get(`/parents/${user.id}`);
      setParent(parentRes.data);

      // Get students for this parent
      const studentsRes = await api.get(`/parents/${user.id}/students`);
      setStudents(studentsRes.data || []);

      // Get attendance for the last 30 days for all students
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const startDate = oneMonthAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const attendanceRes = await api.get('/attendance', {
        params: { startDate, endDate }
      });
      
      // Filter attendance for this parent's students
      const studentIds = studentsRes.data?.map(s => s.id) || [];
      const filteredAttendance = (attendanceRes.data?.data || []).filter(a => 
        studentIds.includes(a.studentId)
      );
      setAttendance(filteredAttendance);

      // Get all buses for reference
      const busesRes = await api.get('/buses');
      setBuses(busesRes.data?.data || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getBusName = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus?.number || 'Not Assigned';
  };

  const getStudentAttendance = (studentId) => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    const present = studentAttendance.filter(a => a.status === 'present').length;
    const absent = studentAttendance.filter(a => a.status === 'absent').length;
    return { present, absent, total: studentAttendance.length };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Parent Dashboard</h1>
        {parent && (
          <div className="card p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Welcome, {parent.name}</h2>
            <p className="text-slate-600"><strong>Phone:</strong> {parent.phone}</p>
          </div>
        )}
      </div>

      <div className="card p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Children</h2>
        {students.length === 0 ? (
          <p className="text-slate-500">No students found.</p>
        ) : (
          <div className="space-y-4">
            {students.map((student) => {
              const { present, absent, total } = getStudentAttendance(student.id);
              return (
                <div key={student.id} className="border rounded p-4 bg-slate-50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-slate-600">Class: {student.cls || 'Not Assigned'}</p>
                      <p className="text-sm text-slate-600">Bus: {getBusName(student.busId)}</p>
                    </div>
                    <div className="border-l pl-4">
                      <p className="text-xs text-slate-500 mb-1">Attendance (Last 30 Days)</p>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{present}</p>
                          <p className="text-xs text-slate-500">Present</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">{absent}</p>
                          <p className="text-xs text-slate-500">Absent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Attendance History</h2>
        {attendance.length === 0 ? (
          <p className="text-slate-500">No attendance records found for the last month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Bus</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 20).map((a) => {
                  const student = students.find(s => s.id === a.studentId);
                  return (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="p-2">{formatDate(a.timestamp)}</td>
                      <td className="p-2">{student?.name || 'Unknown'}</td>
                      <td className="p-2">{getBusName(a.busId)}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          a.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <a href="/map" className="btn-primary inline-block">
          View Live Bus Tracking
        </a>
      </div>
    </div>
  );
}
