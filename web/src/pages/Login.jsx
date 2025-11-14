
import React, { useState } from 'react';
import api from '../services/api';
export default function Login({onLogin}){
  const [u,setU]=useState('admin'), [p,setP]=useState('admin123');
  const submit=async(e)=>{ e.preventDefault(); try{ const r=await api.post('/auth/login',{username:u,password:p}); localStorage.setItem('admin_token', r.data.token); localStorage.setItem('admin_user', u); if(onLogin) onLogin(u); window.location.href='/'; }catch(err){ alert('Login failed: '+(err?.response?.data?.error||err.message)); } };
  return (<div className="max-w-md mx-auto"><form onSubmit={submit} className="card"><h2 className="text-xl font-semibold mb-4">Admin sign in</h2><label className="block text-sm">Username</label><input value={u} onChange={e=>setU(e.target.value)} className="w-full border rounded px-3 py-2 mt-1 mb-3"/><label className="block text-sm">Password</label><input type="password" value={p} onChange={e=>setP(e.target.value)} className="w-full border rounded px-3 py-2 mt-1 mb-4"/><button className="btn-primary w-full">Sign in</button></form></div>);
}
