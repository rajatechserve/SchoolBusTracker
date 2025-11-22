
import React, { useEffect, useState } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Assignments(){
	const [drivers,setDrivers]=useState([]);
	const [buses,setBuses]=useState([]);
	const [routes,setRoutes]=useState([]);
	const [list,setList]=useState([]);
	const [form,setForm]=useState({driverId:'',busId:'',routeId:'',startDate:'',endDate:''});
	const [q,setQ]=useState('');
	const [startDateFilter,setStartDateFilter]=useState('');
	const [endDateFilter,setEndDateFilter]=useState('');
	const [busFilter,setBusFilter]=useState('');
	const [driverFilter,setDriverFilter]=useState('');
	const [routeFilter,setRouteFilter]=useState('');
	const user = getAuthUser();
	const isViewer = user?.role==='schoolUser' && user?.userRole==='viewer';
	
	const load=()=>api.get('/assignments', { 
		params: { 
			search: q || undefined,
			startDate: startDateFilter || undefined,
			endDate: endDateFilter || undefined,
			busId: busFilter || undefined,
			driverId: driverFilter || undefined,
			routeId: routeFilter || undefined
		} 
	}).then(r=>setList(r.data||[])).catch(()=>{});
	
	useEffect(()=>{ load(); },[q,startDateFilter,endDateFilter,busFilter,driverFilter,routeFilter]);
	useEffect(()=>{ 
		api.get('/drivers').then(r=>setDrivers(r.data||[])); 
		api.get('/buses').then(r=>setBuses(r.data||[])); 
		api.get('/routes').then(r=>setRoutes(r.data||[])); 
	},[]);
	
	const save=async()=>{ 
		if(isViewer) return; 
		if(!form.driverId || !form.busId) { alert('Driver and Bus are required'); return; }
		if(!form.startDate || !form.endDate) { alert('Start date and End date are required'); return; }
		if(new Date(form.startDate) > new Date(form.endDate)) { alert('Start date must be before or equal to End date'); return; }
		try{ 
			await api.post('/assignments', form); 
			setForm({driverId:'',busId:'',routeId:'',startDate:'',endDate:''}); 
			load(); 
		}catch(e){alert('Error: '+(e.response?.data?.error||e.message));} 
	};
	
	const remove=async(id)=>{ if(isViewer) return; if(!confirm('Delete this assignment?')) return; await api.delete('/assignments/'+id); load(); };
	
	const getDriverName=(id)=> drivers.find(d=>d.id===id)?.name || id || '—';
	const getBusNumber=(id)=> buses.find(b=>b.id===id)?.number || id || '—';
	const getRouteName=(id)=> routes.find(r=>r.id===id)?.name || id || '—';
	const formatDate=(d)=> d ? new Date(d).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '—';
	const formatDateRange=(start,end)=> {
		if(!start && !end) return '—';
		if(start && end) return `${formatDate(start)} - ${formatDate(end)}`;
		return formatDate(start || end);
	};
	
	return (
		<div>
			<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4'>
				<h2 className='text-xl font-semibold'>Assignments {isViewer && <span className='text-xs text-slate-500'>(read-only)</span>}</h2>
				<div className='flex flex-wrap gap-2 items-center'>
					<input placeholder='Search...' value={q} onChange={e=>setQ(e.target.value)} className='border p-2 rounded'/>
					<input type='date' value={startDateFilter} onChange={e=>setStartDateFilter(e.target.value)} className='border p-2 rounded text-sm' placeholder='Start Date'/>
					<input type='date' value={endDateFilter} onChange={e=>setEndDateFilter(e.target.value)} className='border p-2 rounded text-sm' placeholder='End Date'/>
					<select value={busFilter} onChange={e=>setBusFilter(e.target.value)} className='border p-2 rounded min-w-[120px]'>
						<option value=''>All Buses</option>
						{buses.map(b=>(<option key={b.id} value={b.id}>{b.number}</option>))}
					</select>
					<select value={driverFilter} onChange={e=>setDriverFilter(e.target.value)} className='border p-2 rounded min-w-[120px]'>
						<option value=''>All Drivers</option>
						{drivers.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}
					</select>
					<select value={routeFilter} onChange={e=>setRouteFilter(e.target.value)} className='border p-2 rounded min-w-[120px]'>
						<option value=''>All Routes</option>
						{routes.map(r=>(<option key={r.id} value={r.id}>{r.name}</option>))}
					</select>
				</div>
			</div>
			{isViewer && <div className='mb-4 p-3 bg-yellow-50 text-xs text-yellow-700 rounded'>Viewer role: modifications disabled.</div>}
			<div className='mb-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
				<h3 className='text-sm font-semibold mb-3'>Create Assignment</h3>
				<div className='flex flex-wrap gap-2'>
					<input 
						type='date' 
						value={form.startDate} 
						onChange={e=>setForm({...form,startDate:e.target.value})} 
						className='border p-2 rounded' 
						placeholder='Start Date'
						disabled={isViewer}
						required
					/>
					<input 
						type='date' 
						value={form.endDate} 
						onChange={e=>setForm({...form,endDate:e.target.value})} 
						className='border p-2 rounded' 
						placeholder='End Date'
						disabled={isViewer}
						required
					/>
					<select value={form.driverId} onChange={e=>setForm({...form,driverId:e.target.value})} className='border p-2 rounded min-w-[150px]' disabled={isViewer}>
						<option value=''>Select Driver</option>
						{drivers.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}
					</select>
					<select value={form.busId} onChange={e=>setForm({...form,busId:e.target.value})} className='border p-2 rounded min-w-[150px]' disabled={isViewer}>
						<option value=''>Select Bus</option>
						{buses.map(b=>(<option key={b.id} value={b.id}>{b.number}</option>))}
					</select>
					<select value={form.routeId} onChange={e=>setForm({...form,routeId:e.target.value})} className='border p-2 rounded min-w-[150px]' disabled={isViewer}>
						<option value=''>Select Route (Optional)</option>
						{routes.map(r=> (<option key={r.id} value={r.id}>{r.name}</option>))}
					</select>
					<button onClick={save} className={`btn-primary ${isViewer?'opacity-50 cursor-not-allowed':''}`} disabled={isViewer}>Assign</button>
				</div>
			</div>
			<div className='space-y-2'>
				{list.map(a=>(
					<div key={a.id} className='p-4 bg-white dark:bg-slate-800 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
						<div className='flex-1'>
							<div className='flex flex-wrap gap-3 items-center'>
								<span className='text-sm font-semibold text-blue-600 dark:text-blue-400'>{formatDateRange(a.startDate,a.endDate)}</span>
								<span className='text-slate-400'>•</span>
								<span className='font-medium'>{getDriverName(a.driverId)}</span>
								<span className='text-slate-400'>→</span>
								<span className='font-medium'>{getBusNumber(a.busId)}</span>
								{a.routeId && (
									<>
										<span className='text-slate-400'>/</span>
										<span className='text-sm text-slate-600 dark:text-slate-400'>{getRouteName(a.routeId)}</span>
									</>
								)}
							</div>
						</div>
						<div>
							<button 
								onClick={()=>remove(a.id)} 
								disabled={isViewer} 
								className={`text-red-600 hover:text-red-700 text-sm ${isViewer?'opacity-40 cursor-not-allowed':''}`}
							>
								Delete
							</button>
						</div>
					</div>
				))}
				{list.length===0 && <div className='text-center text-sm text-slate-500 py-8'>No assignments found.</div>}
			</div>
		</div>
	);
}
