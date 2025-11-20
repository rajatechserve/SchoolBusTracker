
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Buses(){
  const [list,setList]=useState([]);
  const [drivers,setDrivers]=useState([]);
  const [routes,setRoutes]=useState([]);
  const [form,setForm]=useState({number:'',driverId:'',routeId:''});
  const user = getAuthUser();
  const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
  const load=()=>api.get('/buses').then(r=>setList(r.data||[])).catch(()=>{});
  const loadDrivers=()=>api.get('/drivers').then(r=>setDrivers(r.data||[])).catch(()=>{});
  const loadRoutes=()=>api.get('/routes').then(r=>setRoutes(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); loadDrivers(); loadRoutes(); },[]);
  const save=async()=>{ if(isViewer) return; try{ const payload = { number: form.number, driverId: form.driverId||null, routeId: form.routeId||null }; if(form.id) await api.put('/buses/'+form.id, payload); else await api.post('/buses', payload); setForm({number:'',driverId:'',routeId:''}); load(); }catch(e){ alert('Error: '+(e?.response?.data?.error||e.message)); } };
  const edit=(b)=> setForm({id:b.id,number:b.number,driverId:b.driverId,routeId:b.routeId||''});
  const remove=async(id)=>{ if(isViewer) return; if(!confirm('Delete?')) return; await api.delete('/buses/'+id); load(); };
  const getDriverName=(driverId)=> drivers.find(d=>d.id===driverId)?.name||'N/A';
  const getRouteName=(routeId)=> routes.find(r=>r.id===routeId)?.name||'N/A';
  return (<div><h2 className="text-xl font-semibold mb-4">Buses {isViewer && <span className="text-xs text-slate-500">(read-only)</span>}</h2>
    {isViewer && <div className="mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded">Viewer role: modifications disabled.</div>}
    <div className="mb-4 space-y-2">
      <input placeholder="Bus Number" value={form.number} onChange={e=>setForm({...form,number:e.target.value})} className="border p-2 w-60" disabled={isViewer}/>
      <select value={form.driverId} onChange={e=>setForm({...form,driverId:e.target.value})} className="border p-2 w-60" disabled={isViewer}><option value="">Select Driver</option>{drivers.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}</select>
      <select value={form.routeId} onChange={e=>setForm({...form,routeId:e.target.value})} className="border p-2 w-60" disabled={isViewer}><option value="">Select Route</option>{routes.map(r=>(<option key={r.id} value={r.id}>{r.name}</option>))}</select>
      <div><button onClick={save} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`} disabled={isViewer}>{form.id?'Update':'Add'} Bus</button></div>
    </div>
    <div className="space-y-2">{list.map(b=>(<div key={b.id} className="p-3 bg-white rounded shadow flex justify-between items-center"><div><div className="font-medium">{b.number}</div><div className="text-sm text-slate-500">Driver: {getDriverName(b.driverId)} • Route: {getRouteName(b.routeId)}</div></div><div className="flex gap-2"><button onClick={()=>!isViewer && edit(b)} className={`text-blue-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`} disabled={isViewer}>Edit</button><button onClick={()=>remove(b.id)} className={`text-red-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`} disabled={isViewer}>Delete</button></div></div>))}</div>
  </div>);
}
