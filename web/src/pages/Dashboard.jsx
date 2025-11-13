
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../ui/Card';

export default function Dashboard(){
  const [buses,setBuses]=useState([]);
  useEffect(()=>{ api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{}); const t=setInterval(()=>api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{}),5000); return ()=>clearInterval(t); },[]);
  return (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card title="Active buses" value={buses.filter(b=>b.started).length}>Live buses on route</Card>
    <Card title="Total buses" value={buses.length}>Registered buses</Card>
    <Card title="Students picked" value={buses.reduce((a,b)=>a+(b.pickedCount||0),0)}>Total pickups (recent)</Card>
    <section className="md:col-span-3 mt-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Recent buses</h3>
        </div>
        <div className="divide-y">
          {buses.map(b=>(<div key={b.id} className="py-3 flex items-center justify-between">
            <div><div className="font-medium">{b.number}</div><div className="text-sm text-gray-500">{b.driverName}</div></div>
            <div className="text-sm text-gray-600">{b.location ? `${b.location.lat.toFixed(4)}, ${b.location.lng.toFixed(4)}` : 'n/a'}</div>
          </div>))}
        </div>
      </div>
    </section>
  </div>);
}
