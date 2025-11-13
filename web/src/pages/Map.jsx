
import React, { useEffect, useRef } from 'react';
import api from '../services/api';
export default function MapPage(){
  const mapRef = useRef();
  const markersRef = useRef(null);
  useEffect(()=> {
    const L = window.L;
    if(!L) return;
    mapRef.current = L.map('map').setView([11.0168,77.554], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current);
    markersRef.current = L.markerClusterGroup();
    mapRef.current.addLayer(markersRef.current);
    const icon = L.divIcon({ html: '<div style="background:var(--brand); border-radius:8px; padding:6px; color:white; font-weight:600; font-size:12px;">BUS</div>', className:'' , iconSize: [40,24] });
    const load = async ()=>{
      try{
        const res = await api.get('/buses');
        markersRef.current.clearLayers();
        for(const b of res.data){
          if(b.location){
            const m = L.marker([b.location.lat, b.location.lng], { icon }).bindPopup(`<strong>${b.number}</strong><br/>${b.driverName}`);
            markersRef.current.addLayer(m);
          }
        }
      }catch(e){ console.error(e); }
    };
    load();
    const t = setInterval(load, 5000);
    return ()=>{ clearInterval(t); mapRef.current.remove(); }
  },[]);

  return (<div className="bg-white rounded-lg shadow p-4"><h3 className="font-semibold mb-3">Live map (clustered)</h3><div id="map" style={{height:'70vh'}}></div></div>);
}
