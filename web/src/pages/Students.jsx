
import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Students(){
  const [students,setStudents]=useState([]);
  const [form,setForm]=useState({id:'',name:'',cls:''});
  useEffect(()=>{ api.get('/students').then(r=>setStudents(r.data||[])).catch(()=>{}); },[]);
  const save=async()=>{ try{ if(form.id) await api.put(`/students/${form.id}`, { name: form.name, cls: form.cls }); else await api.post('/students', { name: form.name, cls: form.cls }); setForm({id:'',name:'',cls:''}); const r=await api.get('/students'); setStudents(r.data||[]); }catch(e){alert('Error');} };
  const edit=(s)=>setForm(s);
  const del=async(id)=>{ if(!confirm('Delete?')) return; await api.delete(`/students/${id}`); const r=await api.get('/students'); setStudents(r.data||[]); };
  return (<div className="bg-white rounded-lg shadow p-4"><h3 className="font-semibold mb-3">Students</h3>
    <div className="flex gap-2 mb-4"><input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="border rounded px-2 py-1"/><input placeholder="Class" value={form.cls} onChange={e=>setForm({...form,cls:e.target.value})} className="border rounded px-2 py-1"/><button onClick={save} className="bg-[var(--brand)] text-white px-3 py-1 rounded">{form.id?'Update':'Add'}</button></div>
    <div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-sm text-gray-500"><tr><th>Name</th><th>Class</th><th></th></tr></thead><tbody>{students.map(s=>(<tr key={s.id} className="border-t"><td className="py-2">{s.name}</td><td>{s.cls}</td><td><button onClick={()=>edit(s)} className="text-sky-600 mr-2">Edit</button><button onClick={()=>del(s.id)} className="text-red-500">Delete</button></td></tr>))}</tbody></table></div></div>);
}
