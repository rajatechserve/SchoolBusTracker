
import React, { useEffect, useState } from 'react';
import api from '../services/api';
export default function Attendance(){ const [students,setStudents]=useState([]); const [list,setList]=useState([]);
useEffect(()=>{ api.get('/students').then(r=>setStudents(r.data||[])); api.get('/attendance').then(r=>setList(r.data||[])); },[]);
const record=async(sid)=>{ try{ await api.post('/attendance', { studentId: sid, busId: null, status: 'present' }); const r=await api.get('/attendance'); setList(r.data||[]); }catch(e){alert('Error');} };
return (<div><h2 className='text-xl font-semibold mb-4'>Attendance</h2><div className='mb-4'>{students.map(s=>(<div key={s.id} className='flex items-center gap-2 mb-2'><div className='w-48'>{s.name}</div><button onClick={()=>record(s.id)} className='bg-green-600 text-white px-3 py-1 rounded'>Mark Present</button></div>))}</div><div className='mt-4'><h3 className='font-semibold'>Records</h3>{list.map(r=>(<div key={r.id} className='p-2 border rounded mb-2'>{r.studentId} • {new Date(r.timestamp||0).toLocaleString()} • {r.status}</div>))}</div></div>); }
