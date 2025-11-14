
import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Students(){ const [list,setList]=useState([]); const [form,setForm]=useState({name:'',cls:''}); const load=()=>api.get('/students').then(r=>setList(r.data||[])).catch(()=>{});
useEffect(()=>{load();},[]);
const save=async()=>{ try{ if(form.id) await api.put('/students/'+form.id, form); else await api.post('/students', form); setForm({name:'',cls:''}); load(); }catch(e){alert('Error');} };
const edit=(s)=>setForm(s); const remove=async(id)=>{ if(!confirm('Delete?')) return; await api.delete('/students/'+id); load(); };
return (<div><h2 className='text-xl font-semibold mb-4'>Students</h2><div className='mb-4'><input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2 mr-2'/><input placeholder='Class' value={form.cls} onChange={e=>setForm({...form,cls:e.target.value})} className='border p-2 mr-2'/><button onClick={save} className='btn-primary'>{form.id?'Update':'Add'}</button></div><div className='space-y-2'>{list.map(s=>(<div key={s.id} className='p-3 bg-white rounded shadow flex justify-between items-center'><div><div className='font-medium'>{s.name}</div><div className='text-sm text-slate-500'>{s.cls}</div></div><div className='flex gap-2'><button onClick={()=>edit(s)} className='text-blue-600'>Edit</button><button onClick={()=>remove(s.id)} className='text-red-600'>Delete</button></div></div>))}</div></div>); }
