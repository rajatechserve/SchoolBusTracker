import React, { useState, useEffect, useMemo } from 'react';
import api, { getAuthUser } from '../services/api';
import Map from './Map';

export default function DriverDashboard() {
  const [driver, setDriver] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'assignments'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = getAuthUser();
      
      // Get driver details
      const driverRes = await api.get(`/drivers/${user.id}`);
      setDriver(driverRes.data);

      // Get ALL assignments for this driver (no date filter)
      const assignmentsRes = await api.get('/assignments', { params: { driverId: user.id } });
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : (assignmentsRes.data?.data || []));

      // Get all buses and routes for reference
      const busesRes = await api.get('/buses');
      setBuses(Array.isArray(busesRes.data) ? busesRes.data : []);
      
      const routesRes = await api.get('/routes');
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);
      
      // Get the current assignments to get assigned buses and routes
      const currentAssignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : (assignmentsRes.data?.data || []);
      
      // Extract unique bus IDs and route IDs from current assignments
      const assignedBusIds = [...new Set(currentAssignments.map(a => a.busId).filter(Boolean))];
      const assignedRouteIds = [...new Set(currentAssignments.map(a => a.routeId).filter(Boolean))];
      
      // Get students for attendance - only those assigned to driver's buses or routes
      const studentsRes = await api.get('/students');
      const allStudents = studentsRes.data || [];
      const filteredStudents = allStudents.filter(s => 
        (s.busId && assignedBusIds.includes(s.busId)) || 
        (s.routeId && assignedRouteIds.includes(s.routeId))
      );
      setStudents(filteredStudents);
      
      // Get today's attendance
      loadTodayAttendance();
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };
  
  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await api.get('/attendance', {
        params: { dateFrom: today, dateTo: today }
      });
      setTodayAttendance(attendanceRes.data || []);
    } catch (e) {
      console.error('Failed to load attendance:', e);
    }
  };

  const getBusName = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus?.number || 'Unknown Bus';
  };

  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route?.name || 'Unknown Route';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return '—';
    if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
    return formatDate(start || end);
  };

  const filteredAssignments = useMemo(() => {
    if(!searchTerm.trim()) return assignments;
    const term = searchTerm.toLowerCase();
    return assignments.filter(a => {
      const busName = getBusName(a.busId).toLowerCase();
      const routeName = getRouteName(a.routeId).toLowerCase();
      const start = (a.startDate||'').toLowerCase();
      const end = (a.endDate||'').toLowerCase();
      return busName.includes(term) || routeName.includes(term) || start.includes(term) || end.includes(term);
    });
  }, [assignments, searchTerm]);

  const markAttendance = async (studentId, status) => {
    try {
      await api.post('/attendance', {
        studentId,
        busId: null,
        status,
        timestamp: Date.now()
      });
      loadTodayAttendance();
      alert(`Student marked as ${status}`);
    } catch (e) {
      alert('Error marking attendance: ' + (e.response?.data?.error || e.message));
    }
  };
  
  const getStudentAttendanceStatus = (studentId) => {
    const record = todayAttendance.find(a => a.studentId === studentId);
    return record?.status || null;
  };
  
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        {driver && (
          <div className="card p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">{driver.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium">{driver.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">License</p>
                <p className="font-medium">{driver.license || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'attendance'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          📝 Today's Attendance
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'assignments'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          📋 My Assignments
        </button>
      </div>

      {/* Today's Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Student Attendance - {new Date().toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</h2>
            <button onClick={loadTodayAttendance} className="text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded">
              🔄 Refresh
            </button>
          </div>
          {students.length === 0 ? (
            <p className="text-slate-500">No students found.</p>
          ) : (
            <div className="space-y-2">
              {students.map(student => {
                const status = getStudentAttendanceStatus(student.id);
                return (
                  <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg gap-3">
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-slate-500">
                        Class: {student.cls || '—'} | Pickup: {student.pickupLocation || '—'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {status === 'present' ? (
                        <span className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded font-medium text-sm">
                          ✓ Present
                        </span>
                      ) : status === 'absent' ? (
                        <span className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded font-medium text-sm">
                          ✗ Absent
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => markAttendance(student.id, 'present')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors"
                          >
                            ✓ Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'absent')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors"
                          >
                            ✗ Absent
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
            <strong>Summary:</strong> {todayAttendance.filter(a=>a.status==='present').length} Present • {todayAttendance.filter(a=>a.status==='absent').length} Absent • {students.length - todayAttendance.length} Pending
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">Assignments (All)</h2>
            <input
              type="text"
              placeholder="Search bus, route or date..."
              value={searchTerm}
              onChange={e=>setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
          </div>
          {filteredAssignments.length === 0 ? (
            <p className="text-slate-500">No assignments match.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-100">
                    <th className="text-left p-2">Start Date</th>
                    <th className="text-left p-2">End Date</th>
                    <th className="text-left p-2">Bus</th>
                    <th className="text-left p-2">Route</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(a => (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="p-2">{formatDate(a.startDate)}</td>
                      <td className="p-2">{formatDate(a.endDate)}</td>
                      <td className="p-2">{getBusName(a.busId)}</td>
                      <td className="p-2">{getRouteName(a.routeId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Map embedded />
      </div>
    </div>
  );
}
