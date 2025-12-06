import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  type LayoutChangeEvent
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppHeader from '../../components/AppHeader';
import { Image, Dimensions } from 'react-native';
import Constants from 'expo-constants';

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

interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'children'>('children');
  const [children, setChildren] = useState<Student[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState<{ lat:number; lng:number; running:boolean; lastPingAt:number|null } | null>(null);
  const [busLat, setBusLat] = useState<number | null>(null);
  const [busLng, setBusLng] = useState<number | null>(null);
  const screenHeight = Dimensions.get('window').height;
  const [headerHeight, setHeaderHeight] = useState<number>(88);
  const [tabsHeight, setTabsHeight] = useState<number>(56);
  const mapHeight = Math.max(240, Math.floor(screenHeight - headerHeight - tabsHeight));

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
      const childBusIdsSet = new Set(childrenData.map((c: Student) => c.busId).filter(Boolean));
      const childBusIds = Array.from(childBusIdsSet);

      // Load buses - filter for only buses assigned to this parent's children
      await loadBuses(childBusIds as string[]);

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
      // Try to fetch live bus location for the parent's school
      try {
        if (user?.schoolId) {
          const liveResp = await api.request({ method: 'get', url: `/live?schoolId=${user.schoolId}` });
          const items = Array.isArray(liveResp.data) ? liveResp.data : [];
          const first = items.find((i: any) => typeof i.lat === 'number' && typeof i.lng === 'number');
          if (first) {
            setBusLat(first.lat);
            setBusLng(first.lng);
          }
        }
      } catch {}
    } catch (e: any) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadBuses = async (childBusIds?: string[]) => {
    try {
      const busesRes = await api.get('/buses');
      const allBuses: Bus[] = Array.isArray(busesRes.data) ? busesRes.data : [] as any[];
      
      // Filter to only show buses assigned to this parent's children
      if (childBusIds && childBusIds.length > 0) {
        const filteredBuses = allBuses.filter((bus: Bus) => childBusIds.indexOf(bus.id) !== -1);
        setBuses(filteredBuses);
      } else {
        // If no children yet, get child bus IDs from current children state
        const busIdsSet = new Set(children.map((c: Student) => c.busId).filter(Boolean));
        const busIds = Array.from(busIdsSet);
        const filteredBuses = allBuses.filter((bus: Bus) => busIds.indexOf(bus.id) !== -1);
        setBuses(filteredBuses);
      }
    } catch (e: any) {
      console.error('Failed to load buses:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchLive();
    setRefreshing(false);
  };

  const fetchLive = async () => {
    try {
      const childBusIdsArr: string[] = Array.from(new Set(children.map((c: Student) => c.busId).filter(Boolean))) as string[];
      const busId = childBusIdsArr[0];
      if (!busId) return setLive(null);
      const res = await api.get(`/public/bus/${busId}/live`);
      const d = res.data;
      if (d && d.location) setLive({ lat: d.location.lat, lng: d.location.lng, running: !!d.running, lastPingAt: d.lastPingAt || null });
      else setLive({ lat: 0, lng: 0, running: !!d.running, lastPingAt: d.lastPingAt || null });
    } catch (e) {
      console.warn('Failed to fetch live bus status');
    }
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
      <View onLayout={(e: LayoutChangeEvent)=> setHeaderHeight(e.nativeEvent.layout.height)}>
        <AppHeader onSchoolLoaded={setSchool} showBanner={false} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Full-width map occupying top area */}
        {busLat !== null && busLng !== null && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Bus Location</Text>
            <Image
              style={[styles.mapImage, { height: mapHeight }]}
              resizeMode="cover"
              source={{
                uri: (() => {
                  const key = (Constants?.expoConfig?.extra as any)?.googleMapsApiKey || '';
                  const base = `https://maps.googleapis.com/maps/api/staticmap?center=${busLat},${busLng}&zoom=15&size=640x300&maptype=roadmap`;
                  const markerIcon = 'https://raw.githubusercontent.com/google/material-design-icons/master/maps/2x_web/ic_directions_bus_black_48dp.png';
                  const markers = `&markers=icon:${encodeURIComponent(markerIcon)}%7C${busLat},${busLng}`;
                  const keyParam = key ? `&key=${key}` : '';
                  return base + markers + keyParam;
                })()
              }}
            />
          </View>
        )}

        {/* Tabs moved below the map */}
        <View style={styles.tabContainer} onLayout={(e: LayoutChangeEvent)=> setTabsHeight(e.nativeEvent.layout.height)}>
          <TouchableOpacity 
            style={[styles.tab, styles.activeTab]}
            onPress={() => setActiveTab('children')}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              👨‍👩‍👧‍👦 Children
            </Text>
          </TouchableOpacity>
        </View>
        {/* Tracking tab removed; include bus info inside children cards */}
        {/* Your Children Tab */}
        {activeTab === 'children' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            {children.length === 0 ? (
              <Text style={styles.emptyText}>No children found.</Text>
            ) : (
              <View>
                 {children.map((child: any) => {
                  const stats = getAttendanceStats(child.id);
                   const bus = buses.find((b: any)=> b.id === child.busId);
                  return (
                    <View key={child.id} style={styles.childCard}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childDetails}>Class: {child.cls || '—'}</Text>
                      <Text style={styles.childDetails}>Bus: {getBusName(child.busId)}</Text>
                      <Text style={styles.childDetails}>Driver: {bus?.driverName || '—'} {bus?.driverPhone ? `(📞 ${bus.driverPhone})` : ''}</Text>
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
                 {buses.map((bus: any) => (
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

        {/* Removed bottom school info box; address/phone shown in header */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 12,
    marginTop: 0,
    marginBottom: 8,
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  mapImage: {
    width: '100%',
    borderRadius: 6,
  },
  schoolInfoBox: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
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
    paddingVertical: 6,
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
  liveBox: {
    backgroundColor: '#fff',
    padding: 8,
    margin: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  liveText: {
    fontSize: 14,
    color: '#333',
  },
  tabContent: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
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
    gap: 6,
    marginTop: 8,
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