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

interface Student {
  id: string;
  name: string;
  busId: string;
  routeId: string;
}

interface Bus {
  id: string;
  number: string;
}

interface Route {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  driverId: string;
  busId: string;
  routeId: string;
  startDate: string;
  endDate: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
}

export default function Assignments() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load children for this parent
      const studentsRes = await api.get('/students', { params: { parentId: user?.id } });
      const childrenData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setChildren(childrenData);

      // Get unique bus IDs from children
      const childBusIds = [...new Set(childrenData.map((c: Student) => c.busId).filter(Boolean))];

      // Load all data
      const [busesRes, routesRes, assignmentsRes, driversRes] = await Promise.all([
        api.get('/buses'),
        api.get('/routes'),
        api.get('/assignments'),
        api.get('/drivers')
      ]);

      const allBuses = Array.isArray(busesRes.data) ? busesRes.data : [];
      const allRoutes = Array.isArray(routesRes.data) ? routesRes.data : [];
      const allAssignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
      const allDrivers = Array.isArray(driversRes.data) ? driversRes.data : [];

      // Filter assignments for buses that belong to parent's children
      const relevantAssignments = allAssignments.filter((a: Assignment) => 
        childBusIds.includes(a.busId)
      );

      setBuses(allBuses);
      setRoutes(allRoutes);
      setAssignments(relevantAssignments);
      setDrivers(allDrivers);
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

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d: Driver) => d.id === driverId);
    return driver?.name || 'Unknown Driver';
  };

  const getDriverPhone = (driverId: string) => {
    const driver = drivers.find((d: Driver) => d.id === driverId);
    return driver?.phone || '—';
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
          <Text style={styles.sectionTitle}>Bus Assignments</Text>
          <Text style={styles.sectionSubtitle}>
            Driver assignments for your children's buses
          </Text>
          
          {assignments.length === 0 ? (
            <Text style={styles.emptyText}>No assignments found for your children's buses.</Text>
          ) : (
            <View>
              {assignments.map((assignment) => (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <View style={styles.assignmentRow}>
                    <Text style={styles.assignmentLabel}>Driver:</Text>
                    <Text style={styles.assignmentValue}>{getDriverName(assignment.driverId)}</Text>
                  </View>
                  <View style={styles.assignmentRow}>
                    <Text style={styles.assignmentLabel}>Phone:</Text>
                    <Text style={styles.assignmentValue}>{getDriverPhone(assignment.driverId)}</Text>
                  </View>
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
