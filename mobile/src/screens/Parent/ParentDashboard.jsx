
import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import api from '../../services/api';

export default function ParentDashboard() {
  const [buses, setBuses] = useState([]);
  useEffect(()=>{
    const load = () => api.get('/buses').then(r=>setBuses(r.data||[])).catch(()=>{});
    load();
    const t = setInterval(load, 5000);
    return ()=>clearInterval(t);
  },[]);
  return (
    <View style={{ flex:1, padding:16 }}>
      <Title>Your Buses</Title>
      <FlatList data={buses} keyExtractor={b=>b.id} renderItem={({item})=>(
        <Card style={{ marginBottom:12 }}>
          <Card.Title title={item.number} subtitle={item.driverName} />
          <Card.Content><Paragraph>Location: {item.location ? `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}` : 'n/a'}</Paragraph></Card.Content>
        </Card>
      )} />
    </View>
  );
}
