
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken, setAuthUser } from '../services/api';

// Admin-only login for management console
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const valid = username.trim().length > 0 && password.trim().length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    try {
      setError(null);
      const r = await api.post('/auth/login', { username: username.trim(), password: password.trim() });
      if(!r.data?.token) throw new Error('Missing token in response');
      setAuthToken(r.data.token);
      const userObj = { role: 'admin', username: username.trim() };
      setAuthUser(userObj);
      if (typeof onLogin === 'function') onLogin(userObj);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-xl font-semibold">Admin Login</h2>
        <p className="text-xs text-slate-500">Default credentials: admin / admin123</p>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input autoComplete="username" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2"/>
        <input autoComplete="current-password" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2"/>
        <button type="submit" disabled={!valid||loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <span className="animate-pulse">•••</span>}
          <span>{loading? 'Signing in...' : 'Sign In'}</span>
        </button>
      </form>
    </div>
  );
}
