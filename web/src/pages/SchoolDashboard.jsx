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
        <div className="mb-6">
          <img 
            src={user.photo.startsWith('/uploads') ? `${SERVER_URL}${user.photo}` : user.photo} 
            alt="School Banner" 
            className="w-full h-64 object-cover rounded shadow" 
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">School Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => handleCardClick('/buses', summary.buses)} 
          className={`card p-6 bg-blue-50 dark:bg-blue-900/20 rounded shadow ${summary.buses > 0 ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-all' : 'opacity-50'}`}
        >
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{summary.buses || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Buses</div>
        </div>
        <div 
          onClick={() => handleCardClick('/drivers', summary.drivers)} 
          className={`card p-6 bg-green-50 dark:bg-green-900/20 rounded shadow ${summary.drivers > 0 ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-all' : 'opacity-50'}`}
        >
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">{summary.drivers || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Drivers</div>
        </div>
        <div 
          onClick={() => handleCardClick('/students', summary.students)} 
          className={`card p-6 bg-purple-50 dark:bg-purple-900/20 rounded shadow ${summary.students > 0 ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-all' : 'opacity-50'}`}
        >
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{summary.students || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Students</div>
        </div>
        <div 
          onClick={() => handleCardClick('/parents', summary.parents)} 
          className={`card p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded shadow ${summary.parents > 0 ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-all' : 'opacity-50'}`}
        >
          <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{summary.parents || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Parents</div>
        </div>
        <div 
          onClick={() => handleCardClick('/routes', summary.routes)} 
          className={`card p-6 bg-orange-50 dark:bg-orange-900/20 rounded shadow ${summary.routes > 0 ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-all' : 'opacity-50'}`}
        >
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{summary.routes || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Routes</div>
        </div>
      </div>
    </div>
  );
}
