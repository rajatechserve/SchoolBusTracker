
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
import Schools from './pages/Schools';
import SchoolDashboard from './pages/SchoolDashboard';
import SchoolDetails from './pages/SchoolDetails';
import SchoolUsers from './pages/SchoolUsers';
import SchoolProfile from './pages/SchoolProfile';
import Login from './pages/Login';
import api, { getAuthUser, setAuthToken, setAuthUser, SERVER_URL } from './services/api';
import { useTheme } from './context/ThemeContext';

function Sidebar({ authUser, onLogoUpdate }){ 
  const isAdmin = authUser?.role === 'admin';
  const isSchoolAdmin = authUser?.role === 'school';
  const isSchoolUser = authUser?.role === 'schoolUser';
  const userRole = authUser?.userRole; // viewer | editor | manager
  const isViewer = isSchoolUser && userRole === 'viewer';
  const logo = (isSchoolAdmin || isSchoolUser) ? authUser?.logo : null;
  const [adminLogo, setAdminLogo] = React.useState(localStorage.getItem('adminLogo') || null);
  
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdminLogo(reader.result);
      localStorage.setItem('adminLogo', reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  return (
  <aside className="w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 dark:from-slate-800 dark:to-slate-900 border-r border-indigo-700 dark:border-slate-700 hidden md:block shadow-lg">
    <div className="p-6 text-2xl font-semibold text-white flex items-center justify-center">
      {isAdmin ? (
        <div className="flex items-center justify-center cursor-pointer group relative w-full" title="Click to upload logo">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            id="admin-logo-upload"
          />
          {adminLogo ? (
            <img 
              src={adminLogo.startsWith('/uploads') ? `${SERVER_URL}${adminLogo}` : adminLogo} 
              alt="Admin Logo" 
              className="h-20 w-auto max-w-[180px] object-contain" 
            />
          ) : (
            <span className="text-center">SchoolBus</span>
          )}
        </div>
      ) : logo ? (
        <img 
          src={logo.startsWith('/uploads') ? `${SERVER_URL}${logo}` : logo} 
          alt="School Logo" 
          className="h-20 w-auto max-w-[180px] object-contain" 
        />
      ) : (
        <span className="text-center">SchoolBus</span>
      )}
    </div>
    <nav className="p-4 space-y-2 text-sm">
      {isAdmin && (
        <>
          <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/">Dashboard</Link>
          <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/schools">Schools</Link>
        </>
      )}
      {(isSchoolAdmin || isSchoolUser) && (
        <>
          <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/school-dashboard">Dashboard</Link>
          {isSchoolAdmin && <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/school-profile">School Profile</Link>}
          <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/buses">Buses</Link>
          <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/drivers">Drivers</Link>
          <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/students">Students</Link>
          <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/map">Live Map</Link>
          {isSchoolAdmin && <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/school-users">Users & Roles</Link>}
          {!isViewer && <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/parents">Parents</Link>}
          {!isViewer && <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/assignments">Assignments</Link>}
          {!isViewer && <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/attendance">Attendance</Link>}
          {!isViewer && <Link className="block py-3 px-4 rounded-lg text-white hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200 font-medium" to="/routes">Routes</Link>}
        </>
      )}
    </nav>
  </aside>
);} 

function Header({ onLogout, authUser }) {
  const username = authUser?.username;
  const schoolName = authUser?.name || authUser?.schoolName;
  const isSchool = authUser?.role === 'school' || authUser?.role === 'schoolUser';
  const isAdmin = authUser?.role === 'admin';
  const { theme, setTheme } = useTheme();
  
  const ThemeIcon = ({ type }) => {
    if (type === 'light') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    if (type === 'dark') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  };
  
  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-slate-800 dark:to-slate-900 border-b border-blue-600 dark:border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {isSchool ? (
          <>
            <div className="flex-1"></div>
            <div className="text-xl font-bold text-white drop-shadow-md">{schoolName}</div>
            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-1">
                <button onClick={() => setTheme('light')} className={`p-1.5 rounded ${theme === 'light' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`} title="Light mode"><ThemeIcon type="light" /></button>
                <button onClick={() => setTheme('dark')} className={`p-1.5 rounded ${theme === 'dark' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`} title="Dark mode"><ThemeIcon type="dark" /></button>
                <button onClick={() => setTheme('auto')} className={`p-1.5 rounded ${theme === 'auto' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`} title="Auto (system)"><ThemeIcon type="auto" /></button>
              </div>
              <div className="text-sm text-white">Signed in as <strong className="font-semibold">{username}</strong></div>
              <button onClick={onLogout} className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-medium">Logout</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1"></div>
            <div className="text-xl font-bold text-white drop-shadow-md">{isAdmin ? 'Admin Console' : ''}</div>
            <div className="flex-1 flex items-center justify-end gap-4">
              {authUser ? (
                <>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-1">
                    <button onClick={() => setTheme('light')} className={`p-1.5 rounded ${theme === 'light' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`} title="Light mode"><ThemeIcon type="light" /></button>
                    <button onClick={() => setTheme('dark')} className={`p-1.5 rounded ${theme === 'dark' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`} title="Dark mode"><ThemeIcon type="dark" /></button>
                    <button onClick={() => setTheme('auto')} className={`p-1.5 rounded ${theme === 'auto' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`} title="Auto (system)"><ThemeIcon type="auto" /></button>
                  </div>
                  <div className="text-sm text-white">Signed in as <strong className="font-semibold">{username}</strong></div>
                  <button onClick={onLogout} className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-medium">Logout</button>
                </>
              ) : (
                <Link to="/login" className="text-sm text-white hover:text-white/80">Sign in</Link>
              )}
            </div>
          </>
        )}
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
      <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
        <Sidebar authUser={authUserState} onLogoUpdate={() => setAuthUserState(getAuthUser())} />
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
              <Route path="/schools" element={<Schools/>} />
              <Route path="/school-dashboard" element={<SchoolDashboard/>} />
              <Route path="/school-details" element={<SchoolDetails/>} />
              <Route path="/school-users" element={<SchoolUsers/>} />
              <Route path="/school-profile" element={<SchoolProfile/>} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
