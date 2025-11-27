import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
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
  pickupLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

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

interface Attendance {
  id: string;
  studentId: string;
  status: string;
}

interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'locations'>('attendance');
  const [students, setStudents] = useState<Student[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [locationForm, setLocationForm] = useState({ 
    pickupLat: '', 
    pickupLng: '', 
    dropLat: '', 
    dropLng: '' 
  });

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

      // Get assigned bus IDs
      const assignedBusIds = [...new Set(driverAssignments.map((a: Assignment) => a.busId).filter(Boolean))];

      // Get students for assigned buses
      const studentsRes = await api.get('/students');
      const allStudents = studentsRes.data || [];
      const filteredStudents = allStudents.filter((s: Student) => 
        s.busId && assignedBusIds.includes(s.busId)
      );
      setStudents(filteredStudents);

      // Get today's attendance
      loadTodayAttendance();
    } catch (e: any) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await api.get('/attendance', {
        params: { dateFrom: today, dateTo: today }
      });
      setTodayAttendance(attendanceRes.data || []);
    } catch (e: any) {
      console.error('Failed to load attendance:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent') => {
    try {
      await api.post('/attendance', {
        studentId,
        busId: null,
        status,
        timestamp: Date.now()
      });
      loadTodayAttendance();
      Alert.alert('Success', `Student marked as ${status}`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    }
  };

  const editLocation = (student: Student) => {
    setEditingStudent(student);
    setLocationForm({
      pickupLat: student.pickupLat?.toString() || '',
      pickupLng: student.pickupLng?.toString() || '',
      dropLat: student.dropLat?.toString() || '',
      dropLng: student.dropLng?.toString() || ''
    });
  };

  const saveLocation = async () => {
    if (!editingStudent) return;
    try {
      await api.put(`/students/${editingStudent.id}`, {
        pickupLat: locationForm.pickupLat ? parseFloat(locationForm.pickupLat) : null,
        pickupLng: locationForm.pickupLng ? parseFloat(locationForm.pickupLng) : null,
        dropLat: locationForm.dropLat ? parseFloat(locationForm.dropLat) : null,
        dropLng: locationForm.dropLng ? parseFloat(locationForm.dropLng) : null
      });
      Alert.alert('Success', 'Location saved successfully');
      setEditingStudent(null);
      setLocationForm({ pickupLat: '', pickupLng: '', dropLat: '', dropLng: '' });
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    }
  };

  const getStudentAttendanceStatus = (studentId: string) => {
    const record = todayAttendance.find((a: Attendance) => a.studentId === studentId);
    return record?.status || null;
  };

  const getBusName = (busId: string) => {
    const bus = buses.find((b: Bus) => b.id === busId);
    return bus?.number || 'Unknown Bus';
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find((r: Route) => r.id === routeId);
    return route?.name || 'Unknown Route';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      <AppHeader onSchoolLoaded={setSchool} showBanner={true} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
          onPress={() => setActiveTab('attendance')}
        >
          <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
            📝 Attendance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
          onPress={() => setActiveTab('locations')}
        >
          <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>
            📍 Locations
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Today's Attendance Tab */}
        {activeTab === 'attendance' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Student Attendance - {new Date().toLocaleDateString()}</Text>
              <TouchableOpacity onPress={loadTodayAttendance} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>
            
            {students.length === 0 ? (
              <Text style={styles.emptyText}>No students found.</Text>
            ) : (
              <View>
                {students.map((student) => {
                  const status = getStudentAttendanceStatus(student.id);
                  return (
                    <View key={student.id} style={styles.studentCard}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentDetails}>
                          Class: {student.cls || '—'} | Pickup: {student.pickupLocation || '—'}
                        </Text>
                      </View>
                      <View style={styles.attendanceButtons}>
                        {status === 'present' ? (
                          <View style={styles.statusBadgePresent}>
                            <Text style={styles.statusText}>✓ Present</Text>
                          </View>
                        ) : status === 'absent' ? (
                          <View style={styles.statusBadgeAbsent}>
                            <Text style={styles.statusText}>✗ Absent</Text>
                          </View>
                        ) : (
                          <>
                            <TouchableOpacity 
                              style={styles.presentButton}
                              onPress={() => markAttendance(student.id, 'present')}
                            >
                              <Text style={styles.buttonText}>✓ Present</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.absentButton}
                              onPress={() => markAttendance(student.id, 'absent')}
                            >
                              <Text style={styles.buttonText}>✗ Absent</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })}
                <View style={styles.summary}>
                  <Text style={styles.summaryText}>
                    <Text style={styles.summaryBold}>Summary: </Text>
                    {todayAttendance.filter(a => a.status === 'present').length} Present • 
                    {todayAttendance.filter(a => a.status === 'absent').length} Absent • 
                    {students.length - todayAttendance.length} Pending
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Student Locations Tab */}
        {activeTab === 'locations' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Student Pick/Drop Locations</Text>
            <Text style={styles.sectionSubtitle}>
              Set pickup and drop-off locations for each student. These locations will be visible to parents.
            </Text>

            {editingStudent && (
              <View style={styles.editForm}>
                <Text style={styles.editFormTitle}>Editing: {editingStudent.name}</Text>
                
                <Text style={styles.inputLabel}>Pickup Location</Text>
                <View style={styles.locationInputRow}>
                  <TextInput
                    placeholder="Latitude"
                    value={locationForm.pickupLat}
                    onChangeText={(text) => setLocationForm({ ...locationForm, pickupLat: text })}
                    style={[styles.input, styles.locationInput]}
                    keyboardType="numeric"
                  />
                  <TextInput
                    placeholder="Longitude"
                    value={locationForm.pickupLng}
                    onChangeText={(text) => setLocationForm({ ...locationForm, pickupLng: text })}
                    style={[styles.input, styles.locationInput]}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.inputLabel}>Drop-off Location</Text>
                <View style={styles.locationInputRow}>
                  <TextInput
                    placeholder="Latitude"
                    value={locationForm.dropLat}
                    onChangeText={(text) => setLocationForm({ ...locationForm, dropLat: text })}
                    style={[styles.input, styles.locationInput]}
                    keyboardType="numeric"
                  />
                  <TextInput
                    placeholder="Longitude"
                    value={locationForm.dropLng}
                    onChangeText={(text) => setLocationForm({ ...locationForm, dropLng: text })}
                    style={[styles.input, styles.locationInput]}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.editFormButtons}>
                  <TouchableOpacity style={styles.saveButton} onPress={saveLocation}>
                    <Text style={styles.buttonText}>💾 Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => {
                      setEditingStudent(null);
                      setLocationForm({ pickupLat: '', pickupLng: '', dropLat: '', dropLng: '' });
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {students.length === 0 ? (
              <Text style={styles.emptyText}>No students found.</Text>
            ) : (
              <View>
                {students.map((student) => (
                  <View key={student.id} style={styles.locationCard}>
                    <View style={styles.locationInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentDetails}>
                        Class: {student.cls || '—'} | Bus: {getBusName(student.busId)}
                      </Text>
                      <Text style={styles.locationStatus}>
                        {student.pickupLat && student.pickupLng ? (
                          <Text style={styles.locationSet}>✓ Pickup: ({student.pickupLat}, {student.pickupLng})</Text>
                        ) : (
                          <Text style={styles.locationMissing}>⚠ No pickup location</Text>
                        )}
                        {'\n'}
                        {student.dropLat && student.dropLng ? (
                          <Text style={styles.locationSet}>✓ Drop: ({student.dropLat}, {student.dropLng})</Text>
                        ) : (
                          <Text style={styles.locationMissing}>⚠ No drop location</Text>
                        )}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.setLocationButton}
                      onPress={() => editLocation(student)}
                    >
                      <Text style={styles.buttonText}>📍 Set</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* School Info Box - Moved to bottom */}
        {school && (
          <View style={styles.schoolInfoBox}>
            <Text style={styles.infoBoxText}>📍 {school.address || 'No address available'}</Text>
            {school.phone && (
              <Text style={styles.infoBoxText}>📞 {school.phone}</Text>
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
  schoolInfoBox: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 12,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  refreshButton: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#007BFF',
  },
  studentCard: {
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
  studentInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 12,
    color: '#666',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presentButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  absentButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusBadgePresent: {
    flex: 1,
    backgroundColor: '#C8E6C9',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusBadgeAbsent: {
    flex: 1,
    backgroundColor: '#FFCDD2',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
  },
  summaryBold: {
    fontWeight: 'bold',
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
  },
  editForm: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  editFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  locationInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  locationInput: {
    flex: 1,
  },
  editFormButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  locationCard: {
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
  locationInfo: {
    flex: 1,
  },
  locationStatus: {
    fontSize: 12,
    marginTop: 8,
  },
  locationSet: {
    color: '#4CAF50',
  },
  locationMissing: {
    color: '#ff9800',
  },
  setLocationButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
});
