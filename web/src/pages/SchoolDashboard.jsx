import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAuthUser, SERVER_URL } from '../services/api';

export default function SchoolDashboard(){
  const [summary, setSummary] = useState({ buses: 0, drivers: 0, students: 0, parents: 0, routes: 0 });
  const user = getAuthUser();
  const navigate = useNavigate();

  useEffect(()=>{
    api.get('/dashboard/summary').then(r=> setSummary(r.data||{})).catch(()=>{});
  },[]);

  const handleCardClick = (path, count) => {
    if (count > 0) {
      navigate(path);
    }
  };

  return (
    <div>
      {/* Welcome Banner with School Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 mb-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Welcome to {user?.name || 'School Dashboard'}
            </h1>
            {(user?.address || user?.city || user?.state) && (
              <div className="text-slate-600 dark:text-slate-400 space-y-1">
                {user?.address && <p>{user.address}</p>}
                {(user?.city || user?.state) && (
                  <p>{[user.city, user.state].filter(Boolean).join(', ')}</p>
                )}
                {(user?.phone || user?.mobile) && (
                  <p className="text-sm">
                    {user.phone && <span>📞 {user.phone}</span>}
                    {user.phone && user.mobile && <span className="mx-2">•</span>}
                    {user.mobile && <span>📱 {user.mobile}</span>}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {user?.photo && (
        <div className="mb-6 relative rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 to-purple-100/80 dark:from-slate-800/90 dark:to-slate-900/90 mix-blend-overlay"></div>
          <img 
            src={user.photo.startsWith('/uploads') ? `${SERVER_URL}${user.photo}` : user.photo} 
            alt="School Banner" 
            className="w-full h-64 object-cover opacity-70" 
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">School Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div 
          onClick={() => handleCardClick('/buses', summary.buses)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl shadow-lg ${summary.buses > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{summary.buses || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Buses</div>
        </div>
        <div 
          onClick={() => handleCardClick('/drivers', summary.drivers)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl shadow-lg ${summary.drivers > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">{summary.drivers || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drivers</div>
        </div>
        <div 
          onClick={() => handleCardClick('/students', summary.students)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl shadow-lg ${summary.students > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{summary.students || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Students</div>
        </div>
        <div 
          onClick={() => handleCardClick('/parents', summary.parents)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl shadow-lg ${summary.parents > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3">
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">{summary.parents || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Parents</div>
        </div>
        <div 
          onClick={() => handleCardClick('/routes', summary.routes)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl shadow-lg ${summary.routes > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3">
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{summary.routes || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Routes</div>
        </div>
      </div>
    </div>
  );
}
