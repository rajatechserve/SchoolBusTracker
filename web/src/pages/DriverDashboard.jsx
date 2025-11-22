import React, { useState, useEffect } from 'react';
import api, { getAuthUser } from '../services/api';
import Map from './Map';

export default function DriverDashboard() {
  const [driver, setDriver] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Get assignments for the current driver for the next month
      const today = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = oneMonthLater.toISOString().split('T')[0];
      
      const assignmentsRes = await api.get('/assignments', {
        params: { driverId: user.id, startDate, endDate }
      });
      setAssignments(assignmentsRes.data?.data || []);

      // Get all buses and routes for reference
      const busesRes = await api.get('/buses');
      setBuses(busesRes.data?.data || []);
      
      const routesRes = await api.get('/routes');
      setRoutes(routesRes.data?.data || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Driver Dashboard</h1>
        {driver && (
          <div className="card p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">{driver.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium">{driver.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">License</p>
                <p className="font-medium">{driver.license || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">School</p>
                <p className="font-medium">{driver.schoolId || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-4">Assignments (Viewing Only)</h2>
        {assignments.length === 0 ? (
          <p className="text-slate-500">No assignments found.</p>
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
                {assignments.map(a => (
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

      <div className="mt-6">
        <Map embedded />
      </div>
    </div>
  );
}
