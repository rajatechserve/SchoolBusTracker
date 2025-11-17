import React from 'react';
import { View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function DriverDashboard() {
  const { user } = useAuth();
  return (
    <View style={{ flex:1, padding:16 }}>
      <Card style={{ padding:12 }}>
        <Title>Driver Dashboard</Title>
        <Paragraph>{user?.name} - Bus: {user?.bus}</Paragraph>
      </Card>
    </View>
  );
}
