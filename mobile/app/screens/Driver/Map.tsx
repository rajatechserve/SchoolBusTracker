import React, { useEffect, useRef, useState, useCallback } from 'react';
declare const require: any;
import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DriverMap(){
  const { user } = useAuth();
  const webRef = useRef<WebView|null>(null);
  const [mapReady, setMapReady] = useState(false);

  const post = (data:any)=>{ if(webRef.current) webRef.current.postMessage(JSON.stringify(data)); };

  const fetchLive = useCallback(async()=>{
    try{
      const busId = (user as any)?.bus;
      if(!busId) return;
      const resp = await api.get(`/api/public/bus/${busId}/live`);
      const live = resp?.data || {};
      const loc = live?.location;
      if(mapReady){
        if(loc && typeof loc.lat==='number' && typeof loc.lng==='number'){
          post({ type:'UPDATE_BUS', lat: loc.lat, lng: loc.lng });
        }
        const strip = Array.isArray(live?.strip) ? live.strip : [];
        if(strip.length>1){ post({ type:'SET_ROUTE', path: strip.map((p:any)=>({lat:p.lat,lng:p.lng})) }); }
      }
    }catch{}
  },[mapReady, user]);

  useEffect(()=>{ fetchLive(); const id = setInterval(fetchLive, 3000); return ()=> clearInterval(id); },[fetchLive]);

  const onMessage = (e:any)=>{
    try{
      const data = JSON.parse(e.nativeEvent.data);
      if(data.type==='MAP_READY'){ setMapReady(true); }
    }catch{}
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        style={styles.map}
        originWhitelist={["*"]}
        source={require('./map-template.html')}
        onMessage={onMessage}
        javaScriptEnabled
        cacheEnabled={false}
        injectedJavaScript={`(function(){
          try { window.__GOOGLE_MAPS_KEY = ${(Constants?.expoConfig?.extra as any)?.googleMapsApiKey ? `'${(Constants?.expoConfig?.extra as any)?.googleMapsApiKey}'` : "''"}; } catch(e){}
        })();`}
      />
      {!mapReady && (<View style={styles.banner}><Text style={styles.bannerText}>Loading map…</Text></View>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 },
  map:{ flex:1 },
  banner:{ position:'absolute', left:12, top:8, backgroundColor:'#00000099', paddingHorizontal:10, paddingVertical:6, borderRadius:12 },
  bannerText:{ color:'#fff', fontSize:12, fontWeight:'600' }
});
