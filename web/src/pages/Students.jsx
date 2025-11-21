
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Students(){
	const [list,setList]=useState([]);
	const [form,setForm]=useState({name:'',cls:'',parentId:'',busId:''});
	const [buses,setBuses]=useState([]);
	const [parents,setParents]=useState([]);
	const [q,setQ]=useState('');
	const user = getAuthUser();
	const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
	const load=()=>api.get('/students', { params: { search: q || undefined } }).then(r=>setList(r.data||[])).catch(()=>{});
	const loadBuses=()=>api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{});
	const loadParents=()=>api.get('/parents').then(r=>setParents(r.data||[])).catch(()=>{});
	useEffect(()=>{ load(); },[q]);
	useEffect(()=>{ loadBuses(); if(user?.role!=='parent') loadParents(); },[]);
	const save=async()=>{ if(isViewer) return; try{ const payload={...form}; if(!payload.parentId && user?.role==='parent') payload.parentId = user.id; if(form.id) await api.put('/students/'+form.id, payload); else await api.post('/students', payload); setForm({name:'',cls:'',parentId:'',busId:''}); load(); }catch(e){alert('Error');} };
	const edit=(s)=>setForm(s); const remove=async(id)=>{ if(isViewer) return; if(!confirm('Delete?')) return; await api.delete('/students/'+id); load(); };
	const busNumber=(id)=> buses.find(b=>b.id===id)?.number || id || '—';
	const parentName=(id)=> parents.find(p=>p.id===id)?.name || (id? id.slice(0,8)+'…':'—');
	return (<div><div className='flex items-center justify-between mb-4'><h2 className='text-xl font-semibold'>Students {isViewer && <span className="text-xs text-slate-500">(read-only)</span>}</h2><input placeholder='Search' value={q} onChange={e=>setQ(e.target.value)} className='border p-2'/></div>
		{isViewer && <div className='mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded'>Viewer role: modifications disabled.</div>}
		<div className='mb-4 flex flex-wrap gap-2'>
			<input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2' disabled={isViewer}/>
			<input placeholder='Class' value={form.cls} onChange={e=>setForm({...form,cls:e.target.value})} className='border p-2' disabled={isViewer}/>
			<select value={form.busId} onChange={e=>setForm({...form,busId:e.target.value})} className='border p-2' disabled={isViewer}>
				<option value=''>Select Bus</option>
				{buses.map(b=>(<option key={b.id} value={b.id}>{b.number}</option>))}
			</select>
			{user?.role!=='parent' && (
				<select value={form.parentId} onChange={e=>setForm({...form,parentId:e.target.value})} className='border p-2' disabled={isViewer}>
					<option value=''>Select Parent</option>
					{parents.map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
				</select>
			)}
			<button onClick={save} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`} disabled={isViewer}>{form.id?'Update':'Add'}</button>
		</div>
		<div className='space-y-2'>{list.map(s=>(<div key={s.id} className='p-3 bg-white rounded shadow flex justify-between items-center'>
			<div>
				<div className='font-medium'>{s.name}</div>
				<div className='text-sm text-slate-500'>Class: {s.cls || '—'} | Bus: {busNumber(s.busId)} | Parent: {parentName(s.parentId)}</div>
			</div>
			<div className='flex gap-2'>
				<button onClick={()=>!isViewer && edit(s)} className={`text-blue-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`} disabled={isViewer}>Edit</button>
				<button onClick={()=>remove(s.id)} className={`text-red-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`} disabled={isViewer}>Delete</button>
			</div>
		</div>))}</div>
	</div>);
}
