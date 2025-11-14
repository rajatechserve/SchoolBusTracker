
import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Dashboard(){
  const [summary, setSummary] = useState({});
  const [buses, setBuses] = useState([]);
  useEffect(()=>{ api.get('/dashboard/summary').then(r=>setSummary(r.data)).catch(()=>{}); api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{}); const t=setInterval(()=>api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{}),5000); return ()=>clearInterval(t); },[]);
  return (<div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card"><div className="text-sm text-muted">Buses</div><div className="text-2xl font-semibold">{summary.buses||0}</div></div>
      <div className="card"><div className="text-sm text-muted">Drivers</div><div className="text-2xl font-semibold">{summary.drivers||0}</div></div>
      <div className="card"><div className="text-sm text-muted">Students</div><div className="text-2xl font-semibold">{summary.students||0}</div></div>
    </div>
    <div className="card"><h3 className="font-semibold mb-3">Recent buses</h3>{buses.map(b=>(<div key={b.id} className="py-2 border-b last:border-b-0"><div className="font-medium">{b.number}</div><div className="text-sm text-slate-500">{b.driverName} • {b.location?`${b.location.lat.toFixed(4)}, ${b.location.lng.toFixed(4)}`:'n/a'}</div></div>))}</div>
  </div>);
}
