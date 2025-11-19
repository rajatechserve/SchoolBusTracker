
import React, { useState } from 'react';
import api, { setAuthToken, setAuthUser } from '../services/api';

// Admin-only login for management console
export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = username.trim().length > 0 && password.trim().length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    try {
      const r = await api.post('/auth/login', { username: username.trim(), password: password.trim() });
      setAuthToken(r.data.token);
      setAuthUser({ role: 'admin', username: username.trim() });
      window.location.href = '/';
    } catch (err) {
      alert('Login failed: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-xl font-semibold">Admin Login</h2>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2"/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2"/>
        <button disabled={!valid||loading} className="btn-primary w-full">{loading?'...':'Sign In'}</button>
      </form>
    </div>
  );
}
