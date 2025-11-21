import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAuthUser, SERVER_URL } from '../services/api';

export default function SchoolDashboard(){
  const [summary, setSummary] = useState({ buses: 0, drivers: 0, students: 0, parents: 0, routes: 0 });
  const [animatedCounts, setAnimatedCounts] = useState({ buses: 0, drivers: 0, students: 0, parents: 0, routes: 0 });
  const user = getAuthUser();
  const navigate = useNavigate();

  useEffect(()=>{
    api.get('/dashboard/summary').then(r=> setSummary(r.data||{})).catch(()=>{});
  },[]);

  // Animated counter effect
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    
    const counters = { buses: 0, drivers: 0, students: 0, parents: 0, routes: 0 };
    const increments = {
      buses: summary.buses / steps,
      drivers: summary.drivers / steps,
      students: summary.students / steps,
      parents: summary.parents / steps,
      routes: summary.routes / steps
    };
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      
      if (currentStep <= steps) {
        setAnimatedCounts({
          buses: Math.min(Math.floor(increments.buses * currentStep), summary.buses),
          drivers: Math.min(Math.floor(increments.drivers * currentStep), summary.drivers),
          students: Math.min(Math.floor(increments.students * currentStep), summary.students),
          parents: Math.min(Math.floor(increments.parents * currentStep), summary.parents),
          routes: Math.min(Math.floor(increments.routes * currentStep), summary.routes)
        });
      } else {
        setAnimatedCounts(summary);
        clearInterval(timer);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [summary]);

  const handleCardClick = (path, count) => {
    if (count > 0) {
      navigate(path);
    }
  };

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden shadow-lg p-8">
        {user?.photo && (
          <>
            <div className="absolute inset-0 z-0">
              <img 
                src={user.photo.startsWith('/uploads') ? `${SERVER_URL}${user.photo}` : user.photo} 
                alt="School Banner" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/85 to-blue-50/85 dark:from-slate-800/90 dark:to-slate-900/90 z-10"></div>
          </>
        )}
        <div className="relative z-20">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">School Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div 
          onClick={() => handleCardClick('/buses', summary.buses)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl shadow-lg ${summary.buses > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3 animate-pulse">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300">{animatedCounts.buses || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Buses</div>
        </div>
        <div 
          onClick={() => handleCardClick('/drivers', summary.drivers)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl shadow-lg ${summary.drivers > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3 animate-pulse">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 transition-all duration-300">{animatedCounts.drivers || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drivers</div>
        </div>
        <div 
          onClick={() => handleCardClick('/students', summary.students)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl shadow-lg ${summary.students > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3 animate-pulse">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300">{animatedCounts.students || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Students</div>
        </div>
        <div 
          onClick={() => handleCardClick('/parents', summary.parents)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl shadow-lg ${summary.parents > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3 animate-pulse">
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 transition-all duration-300">{animatedCounts.parents || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Parents</div>
        </div>
        <div 
          onClick={() => handleCardClick('/routes', summary.routes)} 
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl shadow-lg ${summary.routes > 0 ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300' : 'opacity-50'}`}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center mb-3 animate-pulse">
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 transition-all duration-300">{animatedCounts.routes || 0}</div>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Routes</div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
