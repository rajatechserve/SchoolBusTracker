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
            <h2 className="text-xl font-semibold mb-2">Welcome, {driver.name}</h2>
            <p className="text-slate-600"><strong>Phone:</strong> {driver.phone}</p>
            {driver.license && <p className="text-slate-600"><strong>License:</strong> {driver.license}</p>}
          </div>
        )}
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-4">Your Route Assignments (Next 30 Days)</h2>
        {assignments.length === 0 ? (
          <p className="text-slate-500">No assignments found for the next month.</p>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="border rounded p-4 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-slate-500">Period</p>
                    <p className="font-semibold">{formatDateRange(a.startDate, a.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bus</p>
                    <p className="font-semibold">{getBusName(a.busId)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Route</p>
                    <p className="font-semibold">{getRouteName(a.routeId)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Map embedded />
      </div>
    </div>
  );
}
