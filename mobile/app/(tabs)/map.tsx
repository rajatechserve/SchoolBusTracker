import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ParentMap from '../screens/Parent/Map';
import DriverMap from '../screens/Driver/Map';

export default function MapTab() {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>Please log in</Text>
      </View>
    );
  }

  if (user.role === 'parent') {
    return <ParentMap />;
  }
  if (user.role === 'driver') {
    return <DriverMap />;
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 16 }}>Role not supported</Text>
    </View>
  );
}
