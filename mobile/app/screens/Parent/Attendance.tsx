import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../services/api';
import AppHeader from '../../components/AppHeader';

interface Student {
  id: string;
  name: string;
}

interface Attendance {
  id: string;
  studentId: string;
  status: string;
  timestamp: number;
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load children for this parent only
      const studentsRes = await api.get('/students', { params: { parentId: user?.id } });
      const childrenData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setChildren(childrenData);

      // Load attendance for present month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const attendanceRes = await api.get('/attendance', {
        params: { dateFrom: startDate, dateTo: endDate }
      });
      const allAttendance = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      
      // Filter attendance for only this parent's children
      const childIds = childrenData.map((c: Student) => c.id);
      const childAttendance = allAttendance.filter((a: Attendance) => childIds.includes(a.studentId));
      
      setAttendance(childAttendance);
    } catch (e: any) {
      console.error('Failed to load attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
      <AppHeader showBackButton={true} />

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          <Text style={styles.sectionSubtitle}>Present month attendance records for your children</Text>
          
          {attendance.length === 0 ? (
            <Text style={styles.emptyText}>No attendance records found for your children.</Text>
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
