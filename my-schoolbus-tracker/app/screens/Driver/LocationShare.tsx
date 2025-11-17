import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LocationShare() {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const ref = useRef<NodeJS.Timeout | null>(null);

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { alert('Permission denied'); return; }
    setSharing(true);
    ref.current = setInterval(async () => {
      const l = await Location.getCurrentPositionAsync({});
      try { await api.post(`/buses/${user?.bus || user?.id}/location`, { lat: l.coords.latitude, lng: l.coords.longitude }); } catch(e) { console.log('err', e?.message); }
    }, 8000);
  };

  const stop = () => { if (ref.current) clearInterval(ref.current); setSharing(false); };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:20 }}>
      <Text>Sharing location for bus {user?.bus}</Text>
      <Button mode="contained" onPress={sharing ? stop : start} style={{ marginTop:20 }}>{sharing ? 'Stop' : 'Start'} Sharing</Button>
    </View>
  );
}
