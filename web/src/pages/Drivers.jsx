
import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Drivers(){
  const [drivers,setDrivers]=useState([]);
  const [form,setForm]=useState({driverId:'',driverName:'',driverPhone:'',_editing:false});
  useEffect(()=>{ api.get('/drivers').then(r=>setDrivers(r.data||[])).catch(()=>{}); },[]);
  const save=async()=>{ try{ if(form._editing) await api.put(`/drivers/${form.driverId}`, { driverName: form.driverName, driverPhone: form.driverPhone }); else await api.post('/drivers', { driverId: form.driverId, driverName: form.driverName, driverPhone: form.driverPhone }); setForm({driverId:'',driverName:'',driverPhone:'',_editing:false}); const r=await api.get('/drivers'); setDrivers(r.data||[]); }catch(e){alert('Error');} };
  const edit=(d)=>setForm({...d,_editing:true});
  const del=async(id)=>{ if(!confirm('Delete?')) return; await api.delete(`/drivers/${id}`); const r=await api.get('/drivers'); setDrivers(r.data||[]); };
  return (<div className="bg-white rounded-lg shadow p-4"><h3 className="font-semibold mb-3">Drivers</h3>
    <div className="flex gap-2 mb-4"><input placeholder="Driver ID" value={form.driverId} onChange={e=>setForm({...form,driverId:e.target.value})} className="border rounded px-2 py-1"/><input placeholder="Name" value={form.driverName} onChange={e=>setForm({...form,driverName:e.target.value})} className="border rounded px-2 py-1"/><input placeholder="Phone" value={form.driverPhone} onChange={e=>setForm({...form,driverPhone:e.target.value})} className="border rounded px-2 py-1"/><button onClick={save} className="bg-[var(--brand)] text-white px-3 py-1 rounded">{form._editing?'Update':'Add'}</button></div>
    <div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-sm text-gray-500"><tr><th>ID</th><th>Name</th><th>Phone</th><th></th></tr></thead><tbody>{drivers.map(d=>(<tr key={d.driverId} className="border-t"><td className="py-2">{d.driverId}</td><td>{d.driverName}</td><td>{d.driverPhone}</td><td><button onClick={()=>edit(d)} className="text-sky-600 mr-2">Edit</button><button onClick={()=>del(d.driverId)} className="text-red-500">Delete</button></td></tr>))}</tbody></table></div></div>);
}
