
import React, { useState } from 'react';
import api, { setAuthToken, setAuthUser } from '../services/api';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('admin'); // 'admin' | 'driver' | 'parent' | 'school'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bus, setBus] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneValid = /^\+?\d{7,15}$/.test(phone.trim());
  const driverValid = name.trim().length >= 2 && phoneValid && bus.trim().length >= 2;
  const parentValid = name.trim().length >= 2 && phoneValid;
  const adminValid = username.trim() && password.trim();
  const schoolValid = username.trim() && password.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === 'admin') {
        const r = await api.post('/auth/login', { username, password });
        setAuthToken(r.data.token); setAuthUser({ role: 'admin', username }); if(onLogin) onLogin(username);
        window.location.href = '/';
      } else if (mode === 'school') {
        if (!schoolValid) return;
        const r = await api.post('/auth/school-login', { username, password });
        setAuthToken(r.data.token); setAuthUser({ role: 'school', ...r.data.school }); if(onLogin) onLogin(r.data.school.name);
        window.location.href = '/school-dashboard';
      } else if (mode === 'driver') {
        if (!driverValid) return; const r = await api.post('/auth/driver-login', { phone: phone.trim(), name: name.trim(), bus: bus.trim() });
        setAuthToken(r.data.token); setAuthUser({ role: 'driver', id: phone.trim(), name: name.trim(), bus: bus.trim() }); window.location.href = '/map';
      } else if (mode === 'parent') {
        if (!parentValid) return; const r = await api.post('/auth/parent-login', { phone: phone.trim(), name: name.trim() });
        // Fetch students to locate busId
        let busId = null; try { if (r.data?.parent?.id) { const studentsR = await api.get(`/parents/${r.data.parent.id}/students`); const first = (studentsR.data||[]).find(s=>s.busId); if(first) busId = first.busId; } } catch {}
        setAuthToken(r.data.token); setAuthUser({ role: 'parent', id: phone.trim(), name: name.trim(), bus: busId }); window.location.href = '/map';
      }
    } catch (err) {
      alert('Login failed: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-center mb-6 gap-2">
        {['admin','school','driver','parent'].map(m => (
          <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1 rounded border text-sm ${mode===m?'bg-blue-600 text-white':'bg-white'}`}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>
        ))}
      </div>
      <form onSubmit={submit} className="card space-y-3">
        {mode === 'admin' && (
          <>
            <h2 className="text-xl font-semibold mb-2">Admin Sign In</h2>
            <label className="block text-sm">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <label className="block text-sm">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <button disabled={!adminValid||loading} className="btn-primary w-full">{loading?'...':'Sign in'}</button>
          </>
        )}
        {mode === 'school' && (
          <>
            <h2 className="text-xl font-semibold mb-2">School Login</h2>
            <label className="block text-sm">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <label className="block text-sm">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <button disabled={!schoolValid||loading} className="btn-primary w-full">{loading?'...':'Login'}</button>
          </>
        )}
        {mode === 'driver' && (
          <>
            <h2 className="text-xl font-semibold mb-2">Driver Login</h2>
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <input placeholder="Mobile (+123...)" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <input placeholder="Bus Number" value={bus} onChange={e=>setBus(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <div className="text-xs text-slate-500">{driverValid? 'Ready':'Provide name, valid phone, bus (2+ chars)'}</div>
            <button disabled={!driverValid||loading} className="btn-primary w-full">{loading?'...':'Login'}</button>
          </>
        )}
        {mode === 'parent' && (
          <>
            <h2 className="text-xl font-semibold mb-2">Parent Login</h2>
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <input placeholder="Mobile (+123...)" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <div className="text-xs text-slate-500">{parentValid? 'Ready':'Provide name & valid phone'}</div>
            <button disabled={!parentValid||loading} className="btn-primary w-full">{loading?'...':'Login'}</button>
          </>
        )}
      </form>
    </div>
  );
}
