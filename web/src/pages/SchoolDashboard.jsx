import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';

export default function SchoolDashboard(){
  const [summary, setSummary] = useState({ buses: 0, drivers: 0, students: 0 });
  const user = getAuthUser();
  const schoolPhoto = user?.photo || '';

  useEffect(()=>{
    api.get('/dashboard/summary').then(r=> setSummary(r.data||{})).catch(()=>{});
  },[]);

  const bgStyle = schoolPhoto ? {
    backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${schoolPhoto})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '400px'
  } : {};

  return (
    <div style={bgStyle} className="p-6 rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Welcome to {user?.name || 'School'} Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 bg-blue-50">
          <div className="text-4xl font-bold text-blue-600">{summary.buses}</div>
          <div className="text-sm text-slate-600">Buses</div>
        </div>
        <div className="card p-6 bg-green-50">
          <div className="text-4xl font-bold text-green-600">{summary.drivers}</div>
          <div className="text-sm text-slate-600">Drivers</div>
        </div>
        <div className="card p-6 bg-purple-50">
          <div className="text-4xl font-bold text-purple-600">{summary.students}</div>
          <div className="text-sm text-slate-600">Students</div>
        </div>
      </div>
    </div>
  );
}
