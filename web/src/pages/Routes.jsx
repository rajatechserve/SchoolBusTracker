
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function RoutesPage(){
	const [list,setList]=useState([]);
	const [buses,setBuses]=useState([]);
	const [form,setForm]=useState({name:'',stops:'',busId:''});
	const [q,setQ]=useState('');
	const user = getAuthUser();
	const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
	const load=()=>api.get('/routes', { params: { search: q || undefined } }).then(r=>setList(r.data||[])).catch(()=>{});
	const loadBuses=()=>api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{});
	useEffect(()=>{load();},[q]);
	useEffect(()=>{loadBuses();},[]);
	const save=async()=>{ if(isViewer) return; try{ await api.post('/routes',{ name: form.name, stops: form.stops.split(',').map(s=>s.trim()), busId: form.busId||null }); setForm({name:'',stops:'',busId:''}); load(); }catch(e){alert('Error');} };
	const remove=async(id)=>{ if(isViewer) return; if(!confirm('Delete?')) return; await api.delete('/routes/'+id); load(); };
	const busNumber=(id)=> buses.find(b=>b.id===id)?.number || '—';
	return (<div><div className='flex items-center justify-between mb-4'><h2 className='text-xl font-semibold'>Routes {isViewer && <span className='text-xs text-slate-500'>(read-only)</span>}</h2><input placeholder='Search' value={q} onChange={e=>setQ(e.target.value)} className='border p-2'/></div>
		{isViewer && <div className='mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded'>Viewer role: modifications disabled.</div>}
		<div className='mb-4 flex flex-wrap gap-2'>
			<input placeholder='Route Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2 rounded' disabled={isViewer}/>
			<input placeholder='Stops (comma separated)' value={form.stops} onChange={e=>setForm({...form,stops:e.target.value})} className='border p-2 rounded min-w-[250px]' disabled={isViewer}/>
			<select value={form.busId} onChange={e=>setForm({...form,busId:e.target.value})} className='border p-2 rounded min-w-[140px]' disabled={isViewer}>
				<option value=''>Select Bus</option>
				{buses.map(b=>(<option key={b.id} value={b.id}>{b.number}</option>))}
			</select>
			<button onClick={save} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`} disabled={isViewer}>Add Route</button>
		</div>
		<div className='space-y-2'>
			{list.map(r=>(<div key={r.id} className='p-3 bg-white rounded shadow flex justify-between items-center'>
				<div>
					<div className='font-medium'>{r.name}</div>
					<div className='text-sm text-slate-500'>
						Stops: {Array.isArray(r.stops)?r.stops.join(', '):r.stops}
						{r.busId && <span className='ml-3'>• Bus: {busNumber(r.busId)}</span>}
					</div>
				</div>
				<div><button onClick={()=>remove(r.id)} disabled={isViewer} className={`text-red-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`}>Delete</button></div>
			</div>))}
		</div>
	</div>);
}
