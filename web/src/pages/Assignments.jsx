
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Assignments(){
	const [drivers,setDrivers]=useState([]);
	const [buses,setBuses]=useState([]);
	const [routes,setRoutes]=useState([]);
	const [list,setList]=useState([]);
	const [form,setForm]=useState({driverId:'',busId:'',routeId:''});
	const user = getAuthUser();
	const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
	useEffect(()=>{ api.get('/drivers').then(r=>setDrivers(r.data||[])); api.get('/buses').then(r=>setBuses(r.data||[])); api.get('/routes').then(r=>setRoutes(r.data||[])); api.get('/assignments').then(r=>setList(r.data||[])); },[]);
	const save=async()=>{ if(isViewer) return; try{ await api.post('/assignments', form); const r=await api.get('/assignments'); setList(r.data||[]); }catch(e){alert('Error');} };
	const remove=async(id)=>{ if(isViewer) return; if(!confirm('Delete?')) return; await api.delete('/assignments/'+id); const r=await api.get('/assignments'); setList(r.data||[]); };
	return (<div><h2 className='text-xl font-semibold mb-4'>Assignments {isViewer && <span className='text-xs text-slate-500'>(read-only)</span>}</h2>
		{isViewer && <div className='mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded'>Viewer role: modifications disabled.</div>}
		<div className='mb-4'>
			<select value={form.driverId} onChange={e=>setForm({...form,driverId:e.target.value})} className='border p-2 mr-2' disabled={isViewer}><option value=''>Select driver</option>{drivers.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}</select>
			<select value={form.busId} onChange={e=>setForm({...form,busId:e.target.value})} className='border p-2 mr-2' disabled={isViewer}><option value=''>Select bus</option>{buses.map(b=>(<option key={b.id} value={b.id}>{b.number}</option>))}</select>
			<select value={form.routeId} onChange={e=>setForm({...form,routeId:e.target.value})} className='border p-2 mr-2' disabled={isViewer}><option value=''>Select route</option>{routes.map(r=> (<option key={r.id} value={r.id}>{r.name}</option>))}</select>
			<button onClick={save} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`} disabled={isViewer}>Assign</button>
		</div>
		<div className='space-y-2'>{list.map(a=>(<div key={a.id} className='p-3 bg-white rounded shadow flex justify-between items-center'><div>{a.driverId} → {a.busId} / {a.routeId}</div><div><button onClick={()=>remove(a.id)} disabled={isViewer} className={`text-red-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`}>Delete</button></div></div>))}</div>
	</div>);
}
