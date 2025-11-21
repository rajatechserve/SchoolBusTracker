import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';

export default function Parents(){
  const [list,setList]=useState([]);
    const user = getAuthUser();
    const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
  const [q,setQ]=useState('');
  const [form,setForm]=useState({id:null,name:'',phone:''});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [csvFile,setCsvFile]=useState(null);
  const [csvPreview,setCsvPreview]=useState([]); // [{name,phone,status}]
  const [importing,setImporting]=useState(false);

  const load=()=>api.get('/parents', { params: { search: q || undefined } }).then(r=>setList(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[q]);

  const save=async()=>{
    if(isViewer) return;
    setError('');
    if(!form.name.trim() || !/^\+?\d{7,15}$/.test(form.phone.trim())){ setError('Provide name and valid phone'); return; }
    setLoading(true);
    try{
      if(form.id){
        await api.put('/parents/'+form.id,{ name: form.name.trim(), phone: form.phone.trim() });
      } else {
        await api.post('/parents',{ name: form.name.trim(), phone: form.phone.trim() });
      }
      setForm({id:null,name:'',phone:''});
      load();
    }catch(e){
      if(e?.response?.status===409) setError('Phone already exists'); else setError(e?.response?.data?.error || e.message);
    }finally{ setLoading(false); }
  };

  const onFileChange = (e)=>{ const f = e.target.files?.[0]; setCsvFile(f||null); setCsvPreview([]); };
  const parseCsv = async ()=>{
    setError('');
    if(!csvFile) return;
    const text = await csvFile.text();
    const lines = text.split(/\r?\n/).filter(l=>l.trim());
    if(!lines.length){ setError('CSV empty'); return; }
    const header = lines[0].toLowerCase();
    const nameIdx = header.split(',').findIndex(h=>h.trim()==='name');
    const phoneIdx = header.split(',').findIndex(h=>h.trim()==='phone');
    if(nameIdx<0 || phoneIdx<0){ setError('CSV must have name,phone headers'); return; }
    const existingPhones = new Set(list.map(p=> (p.phone||'').trim()));
    const preview = [];
    for(let i=1;i<lines.length;i++){
      const cols = lines[i].split(',');
      if(cols.length < Math.max(nameIdx, phoneIdx)+1) continue;
      const name = cols[nameIdx].trim();
      const phone = cols[phoneIdx].trim();
      if(!name || !phone) continue;
      const duplicate = existingPhones.has(phone);
      preview.push({ name, phone, status: duplicate? 'duplicate-existing':'pending' });
    }
    setCsvPreview(preview);
  };
  const importCsv = async ()=>{
    if(isViewer) return;
    if(!csvPreview.length) return;
    setImporting(true); setError('');
    const results=[];
    for(const row of csvPreview){
      if(row.status.startsWith('duplicate')){ results.push({ ...row, status: row.status }); continue; }
      if(!/^\+?\d{7,15}$/.test(row.phone)){ results.push({ ...row, status:'invalid-phone' }); continue; }
      try{
        await api.post('/parents',{ name: row.name, phone: row.phone });
        results.push({ ...row, status:'imported' });
      }catch(e){
        if(e?.response?.status===409) results.push({ ...row, status:'duplicate-new' }); else results.push({ ...row, status:'error' });
      }
    }
    setCsvPreview(results);
    load();
    setImporting(false);
  };

  const edit=p=>setForm(p);
  const remove=async(id)=>{ if(isViewer) return; if(!confirm('Delete parent?')) return; await api.delete('/parents/'+id); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Parents {isViewer && <span className='text-xs text-slate-500'>(read-only)</span>}</h2>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="border p-2"/>
      </div>
      {isViewer && <div className='mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded'>Viewer role: modifications disabled.</div>}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2'/>
        <input placeholder='Phone' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className='border p-2'/>
        <div className='md:col-span-3 flex gap-2'>
          <button onClick={save} disabled={loading || isViewer} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`}>{form.id?'Update':'Add'} Parent</button>
          {form.id && <button onClick={()=>setForm({id:null,name:'',phone:''})} className='btn-secondary'>Cancel</button>}
        </div>
        {error && <div className='md:col-span-3 text-sm text-red-600'>{error}</div>}
      </div>
      <div className='mb-6 space-y-2'>
        <h3 className='font-semibold'>Bulk Import (CSV)</h3>
        <input type='file' accept='.csv' onChange={onFileChange} />
        <div className='flex gap-2'>
          <button onClick={parseCsv} disabled={!csvFile || isViewer} className={`btn-secondary ${isViewer?'opacity-50 cursor-not-allowed':''}`}>Parse</button>
          <button onClick={importCsv} disabled={!csvPreview.length || importing || isViewer} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`}>{importing? 'Importing...' : 'Import'}</button>
        </div>
        {csvPreview.length>0 && (
          <div className='text-xs max-h-60 overflow-auto border rounded p-2 bg-white'>
            <div className='mb-1'>Rows: {csvPreview.length}</div>
            {csvPreview.map((r,i)=>(<div key={i} className='flex justify-between border-b py-1'>
              <span>{r.name} - {r.phone}</span>
              <span className={r.status.includes('duplicate')||r.status==='error'?'text-red-600': r.status==='imported'?'text-green-600':'text-slate-500'}>{r.status}</span>
            </div>))}
          </div>
        )}
      </div>
      <div className='space-y-2'>
        {list.map(p=> (
          <div key={p.id} className='p-3 bg-white rounded shadow flex justify-between items-center'>
            <div>
              <div className='font-medium'>{p.name}</div>
              <div className='text-sm text-slate-500'>{p.phone}</div>
            </div>
            <div className='flex gap-3 text-sm'>
              <button onClick={()=>!isViewer && edit(p)} disabled={isViewer} className={`text-blue-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`}>Edit</button>
              <button onClick={()=>remove(p.id)} disabled={isViewer} className={`text-red-600 ${isViewer?'opacity-40 cursor-not-allowed':''}`}>Delete</button>
            </div>
          </div>
        ))}
        {list.length===0 && <div className='text-sm text-slate-500'>No parents found.</div>}
      </div>
    </div>
  );
}
