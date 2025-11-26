import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AppHeader from '../components/AppHeader';

interface Assignment {
  id: string;
  busId: string;
  routeId: string;
  driverId?: string;
  startDate: string;
  endDate: string;
  busNumber?: string;
  routeName?: string;
  driverName?: string;
}

interface Bus {
  id: string;
  number: string;
}

interface Route {
  id: string;
  name: string;
}

interface Driver {
  id: string;
  name: string;
}

export default function AssignmentsScreen() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load buses, routes, and drivers
      const [busesRes, routesRes, driversRes, assignmentsRes] = await Promise.all([
        api.get('/buses'),
        api.get('/routes'),
        api.get('/drivers'),
        user?.role === 'driver' 
          ? api.get('/assignments', { params: { driverId: user.id } })
          : api.get('/assignments')
      ]);

      setBuses(Array.isArray(busesRes.data) ? busesRes.data : []);
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);
      setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
      
      const assignmentsData = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
      
      // Enrich assignments with bus, route, and driver names
      const enrichedAssignments = assignmentsData.map((assignment: Assignment) => {
        const bus = busesRes.data.find((b: Bus) => b.id === assignment.busId);
        const route = routesRes.data.find((r: Route) => r.id === assignment.routeId);
        const driver = driversRes.data.find((d: Driver) => d.id === assignment.driverId);
        
        return {
          ...assignment,
          busNumber: bus?.number || 'Unknown',
          routeName: route?.name || 'Unknown',
          driverName: driver?.name || 'Not Assigned'
        };
      });
      
      setAssignments(enrichedAssignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderItem = ({ item }: { item: Assignment }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.busInfo}>
          <Text style={styles.busIcon}>🚌</Text>
          <Text style={styles.busNumber}>{item.busNumber}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Route:</Text>
          <Text style={styles.value}>{item.routeName}</Text>
        </View>
        
        {user?.role !== 'driver' && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Driver:</Text>
            <Text style={styles.value}>{item.driverName}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Period:</Text>
          <Text style={styles.value}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/(tabs)/')}
      >
        <Text style={styles.backButtonIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.role === 'driver' ? 'My Assignments' : 'All Assignments'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {assignments.length > 0 ? (
        <FlatList
          data={assignments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No assignments found</Text>
          <Text style={styles.emptySubtext}>
            {user?.role === 'driver' 
              ? 'You have no active bus assignments'
              : 'No assignments available at this time'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  backButtonIcon: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'normal',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
