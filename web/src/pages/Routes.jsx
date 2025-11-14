
import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function RoutesPage(){ const [list,setList]=useState([]); const [form,setForm]=useState({name:'',stops:''}); const load=()=>api.get('/routes').then(r=>setList(r.data||[])).catch(()=>{});
useEffect(()=>{load();},[]);
const save=async()=>{ try{ await api.post('/routes',{ name: form.name, stops: form.stops.split(',').map(s=>s.trim()) }); setForm({name:'',stops:''}); load(); }catch(e){alert('Error');} };
const remove=async(id)=>{ if(!confirm('Delete?')) return; await api.delete('/routes/'+id); load(); };
return (<div><h2 className='text-xl font-semibold mb-4'>Routes</h2><div className='mb-4'><input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2 mr-2'/><input placeholder='Stops (comma separated)' value={form.stops} onChange={e=>setForm({...form,stops:e.target.value})} className='border p-2 mr-2'/><button onClick={save} className='btn-primary'>Add Route</button></div><div className='space-y-2'>{list.map(r=>(<div key={r.id} className='p-3 bg-white rounded shadow flex justify-between items-center'><div><div className='font-medium'>{r.name}</div><div className='text-sm text-slate-500'>{Array.isArray(r.stops)?r.stops.join(', '):r.stops}</div></div><div><button onClick={()=>remove(r.id)} className='text-red-600'>Delete</button></div></div>))}</div></div>); }
