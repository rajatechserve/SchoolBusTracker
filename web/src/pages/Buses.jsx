
import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Buses(){
  const [list,setList]=useState([]);
  const [form,setForm]=useState({number:'',driverId:'',driverName:'',driverPhone:''});
  const load=()=>api.get('/buses').then(r=>setList(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[]);
  const save=async()=>{ try{ if(form.id) await api.put('/buses/'+form.id, form); else await api.post('/buses', form); setForm({number:'',driverId:'',driverName:'',driverPhone:''}); load(); }catch(e){ alert('Error: '+(e?.response?.data?.error||e.message)); } };
  const edit=(b)=> setForm({id:b.id,number:b.number,driverId:b.driverId,driverName:b.driverName,driverPhone:b.driverPhone});
  const remove=async(id)=>{ if(!confirm('Delete?')) return; await api.delete('/buses/'+id); load(); };
  return (<div><h2 className="text-xl font-semibold mb-4">Buses</h2><div className="mb-4 space-y-2"><input placeholder="Number" value={form.number} onChange={e=>setForm({...form,number:e.target.value})} className="border p-2 w-60"/><input placeholder="Driver name" value={form.driverName} onChange={e=>setForm({...form,driverName:e.target.value})} className="border p-2 w-60"/><input placeholder="Driver phone" value={form.driverPhone} onChange={e=>setForm({...form,driverPhone:e.target.value})} className="border p-2 w-60"/><div><button onClick={save} className="btn-primary">{form.id?'Update':'Add'} Bus</button></div></div><div className="space-y-2">{list.map(b=>(<div key={b.id} className="p-3 bg-white rounded shadow flex justify-between items-center"><div><div className="font-medium">{b.number}</div><div className="text-sm text-slate-500">{b.driverName} • {b.driverPhone}</div></div><div className="flex gap-2"><button onClick={()=>edit(b)} className="text-blue-600">Edit</button><button onClick={()=>remove(b.id)} className="text-red-600">Delete</button></div></div>))}</div></div>);
}
