import React from 'react';
import { useAuth } from '../context/AuthContext';
import DriverDashboard from '../screens/Driver/DriverDashboard';
import ParentDashboard from '../screens/Parent/ParentDashboard';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Not logged in</Text>
      </View>
    );
  }

  // Show appropriate dashboard based on user role
  if (user.role === 'driver') {
    return <DriverDashboard />;
  }

  if (user.role === 'parent') {
    return <ParentDashboard />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Unknown user role</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
});
