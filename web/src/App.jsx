
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
  <aside className="w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 hidden md:block">
    <div className="p-6 text-2xl font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
      {isAdmin ? (
        <div className="flex items-center gap-2 cursor-pointer group relative" title="Click to upload logo">
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
              className="h-12 w-auto max-w-[150px] object-contain" 
            />
          ) : (
            <span>SchoolBus</span>
          )}
        </div>
      ) : logo ? (
        <img 
          src={logo.startsWith('/uploads') ? `${SERVER_URL}${logo}` : logo} 
          alt="School Logo" 
          className="h-12 w-auto max-w-[150px] object-contain" 
        />
      ) : (
        'SchoolBus'
      )}
    </div>
    <nav className="p-4 space-y-2 text-sm">
      {isAdmin && (
        <>
          <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/">Dashboard</Link>
          <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/schools">Schools</Link>
        </>
      )}
      {(isSchoolAdmin || isSchoolUser) && (
        <>
          <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/school-dashboard">Dashboard</Link>
          {isSchoolAdmin && <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/school-profile">School Profile</Link>}
          <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/buses">Buses</Link>
          <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/drivers">Drivers</Link>
          <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/students">Students</Link>
          <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/map">Live Map</Link>
          {isSchoolAdmin && <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/school-users">Users & Roles</Link>}
          {!isViewer && <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/parents">Parents</Link>}
          {!isViewer && <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/assignments">Assignments</Link>}
          {!isViewer && <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/attendance">Attendance</Link>}
          {!isViewer && <Link className="block py-2 px-3 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" to="/routes">Routes</Link>}
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
    <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {isSchool ? (
          <>
            <div className="flex-1"></div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{schoolName}</div>
            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="flex items-center gap-2 border dark:border-slate-600 rounded-lg p-1">
                <button onClick={() => setTheme('light')} className={`p-1.5 rounded ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Light mode"><ThemeIcon type="light" /></button>
                <button onClick={() => setTheme('dark')} className={`p-1.5 rounded ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Dark mode"><ThemeIcon type="dark" /></button>
                <button onClick={() => setTheme('auto')} className={`p-1.5 rounded ${theme === 'auto' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Auto (system)"><ThemeIcon type="auto" /></button>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300">Signed in as <strong>{username}</strong></div>
              <button onClick={onLogout} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Logout</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1"></div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{isAdmin ? 'Admin Console' : ''}</div>
            <div className="flex-1 flex items-center justify-end gap-4">
              {authUser ? (
                <>
                  <div className="flex items-center gap-2 border dark:border-slate-600 rounded-lg p-1">
                    <button onClick={() => setTheme('light')} className={`p-1.5 rounded ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Light mode"><ThemeIcon type="light" /></button>
                    <button onClick={() => setTheme('dark')} className={`p-1.5 rounded ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Dark mode"><ThemeIcon type="dark" /></button>
                    <button onClick={() => setTheme('auto')} className={`p-1.5 rounded ${theme === 'auto' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Auto (system)"><ThemeIcon type="auto" /></button>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">Signed in as <strong>{username}</strong></div>
                  <button onClick={onLogout} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Logout</button>
                </>
              ) : (
                <Link to="/login" className="text-sm text-slate-600 dark:text-slate-400">Sign in</Link>
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
