
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Students(){
	const [list,setList]=useState([]);
	const [form,setForm]=useState({name:'',cls:'',parentId:'',busId:''});
	const user = getAuthUser();
	const load=()=>api.get('/students').then(r=>setList(r.data||[])).catch(()=>{});
	useEffect(()=>{load();},[]);
	const save=async()=>{ try{ const payload={...form}; if(!payload.parentId && user?.role==='parent') payload.parentId = user.id; if(form.id) await api.put('/students/'+form.id, payload); else await api.post('/students', payload); setForm({name:'',cls:'',parentId:'',busId:''}); load(); }catch(e){alert('Error');} };
	const edit=(s)=>setForm(s); const remove=async(id)=>{ if(!confirm('Delete?')) return; await api.delete('/students/'+id); load(); };
	return (<div><h2 className='text-xl font-semibold mb-4'>Students</h2>
		<div className='mb-4 flex flex-wrap gap-2'>
			<input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2'/>
			<input placeholder='Class' value={form.cls} onChange={e=>setForm({...form,cls:e.target.value})} className='border p-2'/>
			<input placeholder='Bus ID or Number' value={form.busId} onChange={e=>setForm({...form,busId:e.target.value})} className='border p-2'/>
			{user?.role!=='parent' && <input placeholder='Parent ID' value={form.parentId} onChange={e=>setForm({...form,parentId:e.target.value})} className='border p-2'/>}
			<button onClick={save} className='btn-primary'>{form.id?'Update':'Add'}</button>
		</div>
		<div className='space-y-2'>{list.map(s=>(<div key={s.id} className='p-3 bg-white rounded shadow flex justify-between items-center'>
			<div>
				<div className='font-medium'>{s.name}</div>
				<div className='text-sm text-slate-500'>Class: {s.cls || '—'} | Bus: {s.busId || '—'} | Parent: {s.parentId? s.parentId.slice(0,8)+'…':'—'}</div>
			</div>
			<div className='flex gap-2'>
				<button onClick={()=>edit(s)} className='text-blue-600'>Edit</button>
				<button onClick={()=>remove(s.id)} className='text-red-600'>Delete</button>
			</div>
		</div>))}</div>
	</div>);
}
