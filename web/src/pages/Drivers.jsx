import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Drivers(){
  const [list,setList]=useState([]); const [q,setQ]=useState(''); const [form,setForm]=useState({name:'',phone:'',license:''});
  const load=()=>api.get('/drivers').then(r=>setList(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[]);
  const save=async()=>{ try{ const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  if (form.id) {
    await api.put('/drivers/' + form.id, form, config);
  } else {
    await api.post('/drivers', form, config);
  }
  setForm({ name: '', phone: '', license: '' });
  load(); }catch(e){ const errorMessage = e.response?.data?.error || 'An unexpected error occurred';
  alert(`Error: ${errorMessage}`);
  };
  };
  const edit=(d)=>setForm(d); const remove=async(id)=>{ if(!confirm('Delete?')) return; await api.delete('/drivers/'+id); load(); };
  const filtered = list.filter(x=> x.name.toLowerCase().includes(q.toLowerCase()) || x.phone.toLowerCase().includes(q.toLowerCase()));
  return (<div><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Drivers</h2><input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="border p-2"/></div><div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3"><input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2'/><input placeholder='Phone' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className='border p-2'/><input placeholder='License' value={form.license} onChange={e=>setForm({...form,license:e.target.value})} className='border p-2'/><div className='md:col-span-3'><button onClick={save} className='btn-primary'>{form.id?'Update':'Add'} Driver</button></div></div><div className='space-y-2'>{filtered.map(d=>(<div key={d.id} className='p-3 bg-white rounded shadow flex justify-between items-center'><div><div className='font-medium'>{d.name}</div><div className='text-sm text-slate-500'>{d.phone} • {d.license}</div></div><div className='flex gap-2'><button onClick={()=>edit(d)} className='text-blue-600'>Edit</button><button onClick={()=>remove(d.id)} className='text-red-600'>Delete</button></div></div>))}</div></div>);
}
