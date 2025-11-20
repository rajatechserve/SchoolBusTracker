
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAuthUser } from '../services/api';

export default function Dashboard(){
  const [summary, setSummary] = useState({ buses: 0, drivers: 0, students: 0, parents: 0, routes: 0, schools: 0 });
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const user = getAuthUser();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setSummary(r.data || {})).catch(() => { });
  }, []);

  useEffect(() => {
    if (isAdmin) {
      api.get('/schools', { params: { search, page, limit } }).then(r => {
        setSchools(r.data?.data || []);
        setTotal(r.data?.total || 0);
      }).catch(() => { });
    }
  }, [search, page, isAdmin, limit]);

  const viewSchoolDashboard = async (schoolId) => {
    try {
      const r = await api.get(`/schools/${schoolId}/dashboard`);
      navigate('/school-details', { state: r.data });
    } catch (e) {
      alert('Error loading school dashboard');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="card p-6 bg-red-50">
          <div className="text-4xl font-bold text-red-600">{summary.schools}</div>
          <div className="text-sm text-slate-600">Schools</div>
        </div>
        <div className="card p-6 bg-blue-50">
          <div className="text-4xl font-bold text-blue-600">{summary.buses}</div>
          <div className="text-sm text-slate-600">Buses</div>
        </div>
        <div className="card p-6 bg-green-50">
          <div className="text-4xl font-bold text-green-600">{summary.drivers}</div>
          <div className="text-sm text-slate-600">Drivers</div>
        </div>
        <div className="card p-6 bg-purple-50">
          <div className="text-4xl font-bold text-purple-600">{summary.parents}</div>
          <div className="text-sm text-slate-600">Parents</div>
        </div>
        <div className="card p-6 bg-orange-50">
          <div className="text-4xl font-bold text-orange-600">{summary.routes}</div>
          <div className="text-sm text-slate-600">Routes</div>
        </div>
      </div>

      {isAdmin && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Schools</h2>
            <input placeholder="Search schools..." value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded w-64" />
          </div>
          <div className="space-y-2 mb-4">
            {schools.map(s => (
              <div key={s.id} className="p-4 bg-white rounded shadow flex justify-between items-center hover:bg-slate-50 cursor-pointer" onClick={() => viewSchoolDashboard(s.id)}>
                <div className="flex items-center gap-3">
                  {s.logo && <img src={s.logo} alt="Logo" className="h-10 w-10 object-contain" />}
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-slate-500">{[s.city, s.state].filter(Boolean).join(', ') || 'No location'}</div>
                  </div>
                </div>
                <button className="text-blue-600 text-sm">View Details →</button>
              </div>
            ))}
            {schools.length === 0 && <div className="text-sm text-slate-500">No schools found.</div>}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              <span className="px-3 py-1">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
