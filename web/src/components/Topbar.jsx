
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
export default function Topbar(){
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('admin_token'); navigate('/login'); };
  return (<header className="bg-white shadow-sm">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
      <div className="text-2xl font-semibold text-slate-700">SchoolBus</div>
      <nav className="flex gap-4 text-sm text-slate-600">
        <Link to="/">Dashboard</Link>
        <Link to="/map">Map</Link>
        <Link to="/students">Students</Link>
        <Link to="/drivers">Drivers</Link>
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <button onClick={logout} className="text-sm px-3 py-2 rounded-md hover:bg-gray-50">Logout</button>
      </div>
    </div>
  </header>);
}
