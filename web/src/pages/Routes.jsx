
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function RoutesPage(){
	const [list,setList]=useState([]);
	const [form,setForm]=useState({name:'',stops:''});
	const user = getAuthUser();
	const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
	const load=()=>api.get('/routes').then(r=>setList(r.data||[])).catch(()=>{});
	useEffect(()=>{load();},[]);
	const save=async()=>{ if(isViewer) return; try{ await api.post('/routes',{ name: form.name, stops: form.stops.split(',').map(s=>s.trim()) }); setForm({name:'',stops:''}); load(); }catch(e){alert('Error');} };
	const remove=async(id)=>{ if(isViewer) return; if(!confirm('Delete?')) return; await api.delete('/routes/'+id); load(); };
	return (<div><h2 className='text-xl font-semibold mb-4'>Routes {isViewer && <span className='text-xs text-slate-500'>(read-only)</span>}</h2>
		{isViewer && <div className='mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded'>Viewer role: modifications disabled.</div>}
		<div className='mb-4'>
			<input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2 mr-2' disabled={isViewer}/>
			<input placeholder='Stops (comma separated)' value={form.stops} onChange={e=>setForm({...form,stops:e.target.value})} className='border p-2 mr-2' disabled={isViewer}/>
			<button onClick={save} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`} disabled={isViewer}>Add Route</button>
		</div>
		<div className='space-y-2'>
			{list.map(r=>(<div key={r.id} className='p-3 bg-white rounded shadow flex justify-between items-center'>
				<div><div className='font-medium'>{r.name}</div><div className='text-sm text-slate-500'>{Array.isArray(r.stops)?r.stops.join(', '):r.stops}</div></div>
				<div><button onClick={()=>remove(r.id)} disabled={isViewer} className={`text-red-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`}>Delete</button></div>
			</div>))}
		</div>
	</div>);
}
