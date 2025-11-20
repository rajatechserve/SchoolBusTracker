import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Schools(){
  const [list,setList]=useState([]);
  const [form,setForm]=useState({name:'',address:''});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const load=()=>api.get('/schools').then(r=>setList(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[]);
  const save=async()=>{
    setError('');
    if(!form.name.trim()){ setError('Name required'); return; }
    setLoading(true);
    try{
      await api.post('/schools',{ name: form.name.trim(), address: form.address.trim()||null });
      setForm({name:'',address:''});
      load();
    }catch(e){ setError(e?.response?.data?.error || e.message); }
    finally{ setLoading(false); }
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Schools</h2>
      <div className="mb-4 flex flex-wrap gap-2 items-start">
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="border p-2" />
        <input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="border p-2 w-80" />
        <button onClick={save} disabled={loading} className="btn-primary">{loading?'Saving...':'Add School'}</button>
        {error && <div className="w-full text-sm text-red-600">{error}</div>}
      </div>
      <div className="space-y-2">
        {list.map(s=> (<div key={s.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
          <div>
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-slate-500">{s.address || 'No address'}</div>
          </div>
        </div>))}
        {list.length===0 && <div className="text-sm text-slate-500">No schools yet.</div>}
      </div>
    </div>
  );
}
