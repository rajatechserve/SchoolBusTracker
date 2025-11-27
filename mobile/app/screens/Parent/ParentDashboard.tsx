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

interface Attendance {
  id: string;
  studentId: string;
  status: string;
  timestamp: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'children' | 'tracking' | 'assignments' | 'attendance'>('children');
  const [children, setChildren] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
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

      // Load children
      const studentsRes = await api.get('/students', { params: { parentId: user?.id } });
      const childrenData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setChildren(childrenData);

      // Load buses
      await loadBuses();

      // Load routes
      const routesRes = await api.get('/routes');
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);

      // Load assignments
      const assignmentsRes = await api.get('/assignments');
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);

      // Load drivers
      const driversRes = await api.get('/drivers');
      setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);

      // Load attendance for present month
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

  const loadBuses = async () => {
    try {
      const busesRes = await api.get('/buses');
      setBuses(Array.isArray(busesRes.data) ? busesRes.data : []);
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

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d: Driver) => d.id === driverId);
    return driver?.name || 'Unknown Driver';
  };

  const getDriverPhone = (driverId: string) => {
    const driver = drivers.find((d: Driver) => d.id === driverId);
    return driver?.phone || '—';
  };

  const getAttendanceStats = (studentId: string) => {
    const studentAttendance = attendance.filter((a: Attendance) => a.studentId === studentId);
    const present = studentAttendance.filter((a: Attendance) => a.status === 'present').length;
    const absent = studentAttendance.filter((a: Attendance) => a.status === 'absent').length;
    return { present, absent, total: present + absent };
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
      {/* Parent Info Card */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>{user?.name}</Text>
        <Text style={styles.headerSubtitle}>Phone: {user?.phone || '—'}</Text>
      </View>

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
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
            📋 Assignments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
          onPress={() => setActiveTab('attendance')}
        >
          <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
            📊 Attendance
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
            <Text style={styles.sectionSubtitle}>Real-time location of buses (updates every 5 seconds)</Text>
            {buses.length === 0 ? (
              <Text style={styles.emptyText}>No buses found.</Text>
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

        {/* Bus Assignments Tab */}
        {activeTab === 'assignments' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Bus Assignments</Text>
            <Text style={styles.sectionSubtitle}>View driver assignments for all buses</Text>
            {assignments.length === 0 ? (
              <Text style={styles.emptyText}>No assignments found.</Text>
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
        )}

        {/* Recent Attendance History Tab */}
        {activeTab === 'attendance' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Attendance History</Text>
            <Text style={styles.sectionSubtitle}>Present month attendance records</Text>
            {attendance.length === 0 ? (
              <Text style={styles.emptyText}>No attendance records found.</Text>
            ) : (
              <View>
                {attendance
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((record) => {
                    const child = children.find((c) => c.id === record.studentId);
                    return (
                      <View key={record.id} style={styles.attendanceCard}>
                        <View style={styles.attendanceInfo}>
                          <Text style={styles.attendanceName}>{child?.name || 'Unknown'}</Text>
                          <Text style={styles.attendanceDate}>
                            {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
                          </Text>
                        </View>
                        <View style={
                          record.status === 'present' 
                            ? styles.statusBadgePresent 
                            : styles.statusBadgeAbsent
                        }>
                          <Text style={styles.statusText}>
                            {record.status === 'present' ? '✓ Present' : '✗ Absent'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
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
  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  attendanceDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadgePresent: {
    backgroundColor: '#C8E6C9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusBadgeAbsent: {
    backgroundColor: '#FFCDD2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});