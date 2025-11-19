import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DriverDashboard() {
  const { user } = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <Text style={styles.paragraph}>{user?.name} - Bus: {user?.bus}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
  },
});
