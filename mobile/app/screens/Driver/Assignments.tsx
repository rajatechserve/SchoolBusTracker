import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppHeader from '../../components/AppHeader';

interface Assignment {
  id: string;
  busId: string;
  routeId: string;
  startDate: string;
  endDate: string;
}

interface Bus {
  id: string;
  number: string;
}

interface Route {
  id: string;
  name: string;
}

export default function DriverAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get assignments for this driver
      const assignmentsRes = await api.get('/assignments', { params: { driverId: user?.id } });
      const driverAssignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
      setAssignments(driverAssignments);

      // Get buses and routes
      const busesRes = await api.get('/buses');
      setBuses(Array.isArray(busesRes.data) ? busesRes.data : []);
      
      const routesRes = await api.get('/routes');
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);
    } catch (e: any) {
      console.error('Failed to load assignments:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getBusName = (busId: string) => {
    const bus = buses.find((b: Bus) => b.id === busId);
    return bus?.number || 'Unknown Bus';
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find((r: Route) => r.id === routeId);
    return route?.name || 'Unknown Route';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Your Assignments</Text>
          <Text style={styles.sectionSubtitle}>Your assigned buses and routes</Text>
          
          {assignments.length === 0 ? (
            <Text style={styles.emptyText}>No assignments found.</Text>
          ) : (
            <View>
              {assignments.map((assignment) => (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <View style={styles.assignmentRow}>
                    <Text style={styles.assignmentLabel}>Bus:</Text>
                    <Text style={styles.assignmentValue}>{getBusName(assignment.busId)}</Text>
                  </View>
                  <View style={styles.assignmentRow}>
                    <Text style={styles.assignmentLabel}>Route:</Text>
                    <Text style={styles.assignmentValue}>{getRouteName(assignment.routeId)}</Text>
                  </View>
                  <View style={styles.assignmentRow}>
                    <Text style={styles.assignmentLabel}>Period:</Text>
                    <Text style={styles.assignmentValue}>
                      {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : '—'} - 
                      {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '—'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assignmentLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  assignmentValue: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
});
