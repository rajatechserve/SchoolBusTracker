import React from 'react';
import { View } from 'react-native';
import { Title, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex:1, padding:16 }}>
      <Title>Profile</Title>
      <Button mode="outlined" onPress={logout} style={{ marginTop:20 }}>Logout</Button>
    </View>
  );
}
