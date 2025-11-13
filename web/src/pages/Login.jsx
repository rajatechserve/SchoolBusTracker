
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [user,setUser]=useState('admin'); const [pass,setPass]=useState('admin123');
  const navigate = useNavigate();
  const handle = async (e)=>{
    e.preventDefault();
    try{
      const res = await api.post('/auth/login', { username: user, password: pass });
      localStorage.setItem('admin_token', res.data.token);
      navigate('/', { replace: true });
    }catch(err){ alert('Login failed: ' + (err.response?.data?.error || err.message)); }
  };
  return (<div className="flex items-center justify-center h-[70vh]">
    <form onSubmit={handle} className="w-full max-w-md bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Admin sign in</h2>
      <label className="text-sm text-gray-600">Username</label>
      <input value={user} onChange={(e)=>setUser(e.target.value)} className="w-full border rounded px-3 py-2 mt-1 mb-3 focus:outline-none focus:ring-2 focus:ring-sky-300"/>
      <label className="text-sm text-gray-600">Password</label>
      <input type="password" value={pass} onChange={(e)=>setPass(e.target.value)} className="w-full border rounded px-3 py-2 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-300"/>
      <button className="w-full bg-[var(--brand)] text-white py-2 rounded hover:opacity-95">Sign in</button>
    </form>
  </div>);
}
