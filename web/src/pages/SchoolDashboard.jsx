import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';

export default function SchoolDashboard(){
  const [summary, setSummary] = useState({ buses: 0, drivers: 0, students: 0, parents: 0, routes: 0 });
  const user = getAuthUser();

  useEffect(()=>{
    api.get('/dashboard/summary').then(r=> setSummary(r.data||{})).catch(()=>{});
  },[]);

  return (
    <div>
      <div className="mb-6 p-6 bg-white rounded shadow flex items-start gap-4">
        {user?.logo && <img src={user.logo} alt="Logo" className="h-20 w-20 object-contain" />}
        <div>
          <h1 className="text-2xl font-bold">{user?.name || 'School Dashboard'}</h1>
          <div className="text-sm text-slate-600">{[user?.address, user?.city, user?.state].filter(Boolean).join(', ')}</div>
        </div>
      </div>

      {user?.photo && (
        <div className="mb-6">
          <img src={user.photo} alt="School" className="w-full h-48 object-cover rounded shadow" />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">School Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card p-6 bg-blue-50">
          <div className="text-4xl font-bold text-blue-600">{summary.buses || 0}</div>
          <div className="text-sm text-slate-600">Buses</div>
        </div>
        <div className="card p-6 bg-green-50">
          <div className="text-4xl font-bold text-green-600">{summary.drivers || 0}</div>
          <div className="text-sm text-slate-600">Drivers</div>
        </div>
        <div className="card p-6 bg-purple-50">
          <div className="text-4xl font-bold text-purple-600">{summary.students || 0}</div>
          <div className="text-sm text-slate-600">Students</div>
        </div>
        <div className="card p-6 bg-yellow-50">
          <div className="text-4xl font-bold text-yellow-600">{summary.parents || 0}</div>
          <div className="text-sm text-slate-600">Parents</div>
        </div>
        <div className="card p-6 bg-orange-50">
          <div className="text-4xl font-bold text-orange-600">{summary.routes || 0}</div>
          <div className="text-sm text-slate-600">Routes</div>
        </div>
      </div>
    </div>
  );
}
