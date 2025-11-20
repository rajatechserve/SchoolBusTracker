
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/Map';
import Students from './pages/Students';
import Drivers from './pages/Drivers';
import Assignments from './pages/Assignments';
import Attendance from './pages/Attendance';
import Buses from './pages/Buses';
import RoutesPage from './pages/Routes';
import Parents from './pages/Parents';
import Login from './pages/Login';
import api, { getAuthUser, setAuthToken, setAuthUser } from './services/api';

function Sidebar(){ return (
  <aside className="w-64 bg-white border-r hidden md:block">
    <div className="p-6 text-2xl font-semibold text-slate-700">SchoolBus</div>
    <nav className="p-4 space-y-2 text-sm">
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/">Dashboard</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/map">Map</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/buses">Buses</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/drivers">Drivers</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/students">Students</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/parents">Parents</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/assignments">Assignments</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/attendance">Attendance</Link>
      <Link className="block py-2 px-3 rounded hover:bg-slate-50" to="/routes">Routes</Link>
    </nav>
  </aside>
);} 

function Header({ onLogout, authUser }) {
  const name = authUser?.username || authUser?.name;
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">Admin console</div>
        <div className="flex items-center gap-4">
          {authUser ? (
            <>
              <div className="text-sm text-slate-700">Signed in as <strong>{name}</strong></div>
              <button onClick={onLogout} className="text-sm text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-slate-600">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App(){
  const [authUserState, setAuthUserState] = useState(getAuthUser());
  useEffect(()=>{ setAuthUserState(getAuthUser()); },[]);
  const logout = () => { setAuthToken(null); setAuthUser(null); setAuthUserState(null); window.location.href = '/login'; };
  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header onLogout={logout} authUser={authUserState} />
          <main className="p-6 max-w-7xl mx-auto">
            <Routes>
              <Route path="/login" element={<Login onLogin={() => { setAuthUserState(getAuthUser()); }} />} />
              <Route path="/" element={<Dashboard/>} />
              <Route path="/map" element={<MapPage/>} />
              <Route path="/buses" element={<Buses/>} />
              <Route path="/drivers" element={<Drivers/>} />
              <Route path="/students" element={<Students/>} />
              <Route path="/parents" element={<Parents/>} />
              <Route path="/assignments" element={<Assignments/>} />
              <Route path="/attendance" element={<Attendance/>} />
              <Route path="/routes" element={<RoutesPage/>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
