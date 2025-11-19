import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Drivers(){
  const [list,setList]=useState([]); const [q,setQ]=useState(''); const [form,setForm]=useState({id:null,name:'',phone:'',license:''});
  const [error,setError]=useState('');
  const [csvFile,setCsvFile]=useState(null);
  const [csvPreview,setCsvPreview]=useState([]); // {name,phone,license,status}
  const [importing,setImporting]=useState(false);
  const load=()=>api.get('/drivers').then(r=>setList(r.data||[])).catch(()=>{});
  useEffect(()=>{ load(); },[]);
  const save=async()=>{ setError(''); try{
    if(!form.name.trim() || !/^\+?\d{7,15}$/.test(form.phone.trim())) { setError('Valid name & phone required'); return; }
    if(form.id) {
      await api.put('/drivers/' + form.id, form);
    } else {
      await api.post('/drivers', form);
    }
    setForm({ id:null,name: '', phone: '', license: '' });
    load();
  }catch(e){ if(e?.response?.status===409) setError('Phone already exists'); else setError(e.response?.data?.error || 'Unexpected error'); } };

  const onFileChange = (e)=>{ const f=e.target.files?.[0]; setCsvFile(f||null); setCsvPreview([]); };
  const parseCsv = async ()=>{
    setError(''); if(!csvFile) return; const text = await csvFile.text();
    const lines = text.split(/\r?\n/).filter(l=>l.trim()); if(!lines.length){ setError('CSV empty'); return; }
    const header = lines[0].toLowerCase();
    const colsH = header.split(',');
    const nameIdx = colsH.findIndex(h=>h.trim()==='name');
    const phoneIdx = colsH.findIndex(h=>h.trim()==='phone');
    const licIdx = colsH.findIndex(h=>h.trim()==='license');
    if(nameIdx<0 || phoneIdx<0){ setError('CSV must have name,phone headers'); return; }
    const existingPhones = new Set(list.map(d=> (d.phone||'').trim()));
    const preview=[];
    for(let i=1;i<lines.length;i++){
      const cols = lines[i].split(','); if(cols.length < Math.max(nameIdx, phoneIdx, licIdx)+1) continue;
      const name=cols[nameIdx].trim(); const phone=cols[phoneIdx].trim(); const license = licIdx>=0? cols[licIdx].trim(): '';
      if(!name || !phone) continue;
      const duplicate = existingPhones.has(phone);
      preview.push({ name, phone, license, status: duplicate? 'duplicate-existing':'pending' });
    }
    setCsvPreview(preview);
  };
  const importCsv = async ()=>{
    if(!csvPreview.length) return; setImporting(true); const results=[];
    for(const row of csvPreview){
      if(row.status.startsWith('duplicate')){ results.push(row); continue; }
      if(!/^\+?\d{7,15}$/.test(row.phone)){ results.push({ ...row, status:'invalid-phone'}); continue; }
      try{ await api.post('/drivers',{ name: row.name, phone: row.phone, license: row.license||null }); results.push({ ...row, status:'imported'}); }
      catch(e){ if(e?.response?.status===409) results.push({ ...row, status:'duplicate-new'}); else results.push({ ...row, status:'error'}); }
    }
    setCsvPreview(results); load(); setImporting(false);
  };
  const edit=(d)=>setForm(d); const remove=async(id)=>{ if(!confirm('Delete?')) return; await api.delete('/drivers/'+id); load(); };
  const filtered = list.filter(x=> x.name.toLowerCase().includes(q.toLowerCase()) || x.phone.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Drivers</h2><input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="border p-2"/></div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className='border p-2'/>
        <input placeholder='Phone' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className='border p-2'/>
        <input placeholder='License' value={form.license} onChange={e=>setForm({...form,license:e.target.value})} className='border p-2'/>
        <div className='md:col-span-3 flex gap-2'>
          <button onClick={save} className='btn-primary'>{form.id?'Update':'Add'} Driver</button>
          {form.id && <button onClick={()=>setForm({id:null,name:'',phone:'',license:''})} className='btn-secondary'>Cancel</button>}
        </div>
        {error && <div className='md:col-span-3 text-sm text-red-600'>{error}</div>}
      </div>
      <div className='mb-6 space-y-2'>
        <h3 className='font-semibold'>Bulk Import (CSV)</h3>
        <input type='file' accept='.csv' onChange={onFileChange} />
        <div className='flex gap-2'>
          <button onClick={parseCsv} disabled={!csvFile} className='btn-secondary'>Parse</button>
          <button onClick={importCsv} disabled={!csvPreview.length || importing} className='btn-primary'>{importing? 'Importing...' : 'Import'}</button>
        </div>
        {csvPreview.length>0 && (
          <div className='text-xs max-h-60 overflow-auto border rounded p-2 bg-white'>
            <div className='mb-1'>Rows: {csvPreview.length}</div>
            {csvPreview.map((r,i)=>(<div key={i} className='flex justify-between border-b py-1'>
              <span>{r.name} - {r.phone}{r.license? ' • '+r.license:''}</span>
              <span className={r.status.includes('duplicate')||r.status==='error'?'text-red-600': r.status==='imported'?'text-green-600':'text-slate-500'}>{r.status}</span>
            </div>))}
          </div>
        )}
      </div>
      <div className='space-y-2'>
        {filtered.map(d=>(
          <div key={d.id} className='p-3 bg-white rounded shadow flex justify-between items-center'>
            <div>
              <div className='font-medium'>{d.name}</div>
              <div className='text-sm text-slate-500'>{d.phone} • {d.license}</div>
            </div>
            <div className='flex gap-2'>
              <button onClick={()=>edit(d)} className='text-blue-600'>Edit</button>
              <button onClick={()=>remove(d.id)} className='text-red-600'>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className='text-sm text-slate-500'>No drivers found.</div>}
      </div>
    </div>
  );
}
}
