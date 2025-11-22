
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Attendance(){
	const [students,setStudents]=useState([]);
	const [list,setList]=useState([]);
	const [q,setQ]=useState('');
	const user = getAuthUser();
	const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
	const load=()=>api.get('/attendance', { params: { search: q || undefined } }).then(r=>setList(r.data||[])).catch(()=>{});
	useEffect(()=>{ load(); },[q]);
	useEffect(()=>{ api.get('/students').then(r=>setStudents(r.data||[])); },[]);
	const record=async(sid)=>{ if(isViewer) return; try{ await api.post('/attendance', { studentId: sid, busId: null, status: 'present' }); load(); }catch(e){alert('Error');} };
	return (<div><div className='flex items-center justify-between mb-4'><h2 className='text-xl font-semibold'>Attendance {isViewer && <span className='text-xs text-slate-500'>(read-only)</span>}</h2><input placeholder='Search' value={q} onChange={e=>setQ(e.target.value)} className='border p-2'/></div>
		{isViewer && <div className='mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded'>Viewer role: modifications disabled.</div>}
		<div className='mb-4'>{students.map(s=>(<div key={s.id} className='flex items-center gap-2 mb-2'><div className='w-48'>{s.name}</div><button onClick={()=>record(s.id)} disabled={isViewer} className={`bg-green-600 text-white px-3 py-1 rounded ${isViewer?'opacity-40 cursor-not-allowed':''}`}>Mark Present</button></div>))}</div>
		<div className='mt-4'><h3 className='font-semibold'>Records</h3>{list.map(r=>(<div key={r.id} className='p-2 border rounded mb-2'>{r.studentId} • {new Date(r.timestamp||0).toLocaleString()} • {r.status}</div>))}</div>
	</div>);
}
