
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Students(){
	const [list,setList]=useState([]);
	const [form,setForm]=useState({name:'',cls:'',parentId:'',busId:''});
	const [buses,setBuses]=useState([]);
	const [parents,setParents]=useState([]);
	const user = getAuthUser();
	const load=()=>api.get('/students').then(r=>setList(r.data||[])).catch(()=>{});
	const loadBuses=()=>api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{});
	const loadParents=()=>api.get('/parents').then(r=>setParents(r.data||[])).catch(()=>{});
	useEffect(()=>{ load(); loadBuses(); if(user?.role!=='parent') loadParents(); },[]);
	const save=async()=>{ try{ const payload={...form}; if(!payload.parentId && user?.role==='parent') payload.parentId = user.id; if(form.id) await api.put('/students/'+form.id, payload); else await api.post('/students', payload); setForm({name:'',cls:'',parentId:'',busId:''}); load(); }catch(e){alert('Error');} };
	const edit=(s)=>setForm(s); const remove=async(id)=>{ if(!confirm('Delete?')) return; await api.delete('/students/'+id); load(); };
	const busNumber=(id)=> buses.find(b=>b.id===id)?.number || id || '—';
	const parentName=(id)=> parents.find(p=>p.id===id)?.name || (id? id.slice(0,8)+'…':'—');
	return (<div><h2 className='text-xl font-semibold mb-4'>Students</h2>
		<div className='mb-4 flex flex-wrap gap-2'>
			<input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2'/>
			<input placeholder='Class' value={form.cls} onChange={e=>setForm({...form,cls:e.target.value})} className='border p-2'/>
			<select value={form.busId} onChange={e=>setForm({...form,busId:e.target.value})} className='border p-2'>
				<option value=''>Select Bus</option>
				{buses.map(b=>(<option key={b.id} value={b.id}>{b.number}</option>))}
			</select>
			{user?.role!=='parent' && (
				<select value={form.parentId} onChange={e=>setForm({...form,parentId:e.target.value})} className='border p-2'>
					<option value=''>Select Parent</option>
					{parents.map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
				</select>
			)}
			<button onClick={save} className='btn-primary'>{form.id?'Update':'Add'}</button>
		</div>
		<div className='space-y-2'>{list.map(s=>(<div key={s.id} className='p-3 bg-white rounded shadow flex justify-between items-center'>
			<div>
				<div className='font-medium'>{s.name}</div>
				<div className='text-sm text-slate-500'>Class: {s.cls || '—'} | Bus: {busNumber(s.busId)} | Parent: {parentName(s.parentId)}</div>
			</div>
			<div className='flex gap-2'>
				<button onClick={()=>edit(s)} className='text-blue-600'>Edit</button>
				<button onClick={()=>remove(s.id)} className='text-red-600'>Delete</button>
			</div>
		</div>))}</div>
	</div>);
}
