
import React, { useEffect, useRef } from 'react';
import api, { getAuthUser } from '../services/api';
export default function Map(){
  const mapRef = useRef(null);
  useEffect(()=>{
    const L = window.L;
    if(!L) return;
    mapRef.current = L.map('map').setView([11.0168,77.554],12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    const markers = L.markerClusterGroup();
    mapRef.current.addLayer(markers);
    const busIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61207.png', iconSize: [28,28] });
    const load = async ()=>{
      try{
        const res = await api.get('/buses');
        markers.clearLayers();
        const user = getAuthUser();
        let buses = res.data||[];
        if(user?.role==='driver' && user.bus){
          buses = buses.filter(b=> b.number===user.bus || b.id===user.bus);
        } else if(user?.role==='parent' && user.bus){
          buses = buses.filter(b=> b.id===user.bus || b.number===user.bus);
        }
        buses.forEach(b=>{
          if(b.location){
            const m = L.marker([b.location.lat,b.location.lng], { icon: busIcon }).bindPopup(`<strong>${b.number}</strong><br/>${b.driverName||''}`);
            markers.addLayer(m);
          }
        });
      }catch(e){ console.log('map load err', e.message); }
    };
    load();
    const t = setInterval(load, 5000);
    return ()=>{ clearInterval(t); mapRef.current.remove(); };
  },[]);
  return (<div className="card"><h3 className="font-semibold mb-3">Live map</h3><div id="map" style={{height:'70vh'}}></div></div>);
}
