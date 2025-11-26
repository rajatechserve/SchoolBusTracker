import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppHeader from '../../components/AppHeader';

interface Student {
  id: string;
  name: string;
  cls: string;
  busId: string;
  routeId: string;
  pickupLocation: string;
}

interface Bus {
  id: string;
  number: string;
  driverName: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface Route {
  id: string;
  name: string;
}

interface Attendance {
  id: string;
  studentId: string;
  status: string;
  timestamp: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'children' | 'tracking'>('children');
  const [children, setChildren] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'tracking') {
      const interval = setInterval(loadBuses, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load children for this parent only
      console.log('Loading students for parent:', user?.id);
      const studentsRes = await api.get('/students', { params: { parentId: user?.id } });
      console.log('Students response:', studentsRes.data);
      const childrenData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      console.log('Filtered children count:', childrenData.length);
      setChildren(childrenData);

      // Get unique bus IDs from children
      const childBusIds = [...new Set(childrenData.map((c: Student) => c.busId).filter(Boolean))];

      // Load buses - filter for only buses assigned to this parent's children
      await loadBuses(childBusIds);

      // Load routes
      const routesRes = await api.get('/routes');
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);

      // Load attendance for present month - only for this parent's children
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const attendanceRes = await api.get('/attendance', {
        params: { dateFrom: startDate, dateTo: endDate }
      });
      const allAttendance = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      const childIds = childrenData.map((c: Student) => c.id);
      const childAttendance = allAttendance.filter((a: Attendance) => childIds.includes(a.studentId));
      setAttendance(childAttendance);
    } catch (e: any) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadBuses = async (childBusIds?: string[]) => {
    try {
      const busesRes = await api.get('/buses');
      const allBuses = Array.isArray(busesRes.data) ? busesRes.data : [];
      
      // Filter to only show buses assigned to this parent's children
      if (childBusIds && childBusIds.length > 0) {
        const filteredBuses = allBuses.filter((bus: Bus) => childBusIds.includes(bus.id));
        setBuses(filteredBuses);
      } else {
        // If no children yet, get child bus IDs from current children state
        const busIds = [...new Set(children.map((c: Student) => c.busId).filter(Boolean))];
        const filteredBuses = allBuses.filter((bus: Bus) => busIds.includes(bus.id));
        setBuses(filteredBuses);
      }
    } catch (e: any) {
      console.error('Failed to load buses:', e);
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

  const getAttendanceStats = (studentId: string) => {
    const studentAttendance = attendance.filter((a: Attendance) => a.studentId === studentId);
    const present = studentAttendance.filter((a: Attendance) => a.status === 'present').length;
    const absent = studentAttendance.filter((a: Attendance) => a.status === 'absent').length;
    return { present, absent, total: present + absent };
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
      {/* School Header with Menu */}
      <AppHeader showFullInfo={true} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'children' && styles.activeTab]}
          onPress={() => setActiveTab('children')}
        >
          <Text style={[styles.tabText, activeTab === 'children' && styles.activeTabText]}>
            👨‍👩‍👧‍👦 Children
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tracking' && styles.activeTab]}
          onPress={() => setActiveTab('tracking')}
        >
          <Text style={[styles.tabText, activeTab === 'tracking' && styles.activeTabText]}>
            🚍 Tracking
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Your Children Tab */}
        {activeTab === 'children' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            {children.length === 0 ? (
              <Text style={styles.emptyText}>No children found.</Text>
            ) : (
              <View>
                {children.map((child) => {
                  const stats = getAttendanceStats(child.id);
                  return (
                    <View key={child.id} style={styles.childCard}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childDetails}>Class: {child.cls || '—'}</Text>
                      <Text style={styles.childDetails}>Bus: {getBusName(child.busId)}</Text>
                      <Text style={styles.childDetails}>Route: {getRouteName(child.routeId)}</Text>
                      <Text style={styles.childDetails}>Pickup: {child.pickupLocation || '—'}</Text>
                      
                      <View style={styles.statsRow}>
                        <View style={styles.statBadge}>
                          <Text style={styles.statLabel}>Present</Text>
                          <Text style={styles.statValuePresent}>{stats.present}</Text>
                        </View>
                        <View style={styles.statBadge}>
                          <Text style={styles.statLabel}>Absent</Text>
                          <Text style={styles.statValueAbsent}>{stats.absent}</Text>
                        </View>
                        <View style={styles.statBadge}>
                          <Text style={styles.statLabel}>Total</Text>
                          <Text style={styles.statValue}>{stats.total}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Live Bus Tracking Tab */}
        {activeTab === 'tracking' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Live Bus Tracking</Text>
            <Text style={styles.sectionSubtitle}>
              Real-time location of your children's buses (updates every 5 seconds)
            </Text>
            {buses.length === 0 ? (
              <Text style={styles.emptyText}>No buses found for your children.</Text>
            ) : (
              <View>
                {buses.map((bus) => (
                  <View key={bus.id} style={styles.busCard}>
                    <View style={styles.busHeader}>
                      <Text style={styles.busNumber}>🚌 {bus.number}</Text>
                      <Text style={styles.busDriver}>Driver: {bus.driverName || '—'}</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Text style={styles.locationLabel}>📍 Location:</Text>
                      <Text style={styles.locationValue}>
                        {bus.location 
                          ? `${bus.location.lat.toFixed(4)}, ${bus.location.lng.toFixed(4)}`
                          : 'Not available'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
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
  headerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007BFF',
  },
  tabText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007BFF',
    fontWeight: '600',
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
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statBadge: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statValuePresent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statValueAbsent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
  },
  busCard: {
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
  busHeader: {
    marginBottom: 8,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  busDriver: {
    fontSize: 14,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  locationValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});