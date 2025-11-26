import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  mobile: string;
  logo?: string;
}

interface AppHeaderProps {
  showFullInfo?: boolean;
  showBackButton?: boolean;
  showBanner?: boolean;
  onSchoolLoaded?: (school: School) => void;
}

export default function AppHeader({ showFullInfo = false, showBackButton = false, showBanner = false, onSchoolLoaded }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const slideAnim = useState(new Animated.Value(-width * 0.3))[0];

  useEffect(() => {
    loadSchoolInfo();
    loadUserImage();
  }, [user?.schoolId, user?.id]);

  const loadUserImage = async () => {
    if (!user?.id) return;
    try {
      const savedImage = await AsyncStorage.getItem(`userImage_${user.id}`);
      if (savedImage) {
        setUserImage(savedImage);
      }
    } catch (error) {
      console.error('Failed to load user image:', error);
    }
  };

  const loadSchoolInfo = async () => {
    if (!user?.schoolId) return;
    try {
      const response = await api.get(`/public/schools/${user.schoolId}`);
      console.log('School API Response:', response.data);
      
      const schoolData = response.data;
      
      // Handle logo URL
      if (schoolData.logo) {
        const logoPath = schoolData.logo.startsWith('/') ? schoolData.logo.substring(1) : schoolData.logo;
        
        // Construct full URL if needed
        if (!logoPath.startsWith('http')) {
          const baseURL = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://localhost:4000';
          schoolData.logo = `${baseURL}/${logoPath}`;
        } else {
          schoolData.logo = logoPath;
        }
        
        console.log('Logo URL:', schoolData.logo);
        
        // Load and cache banner image locally if showBanner is true
        if (showBanner) {
          loadBannerImage(schoolData.logo);
        }
      } else {
        console.log('No logo field in school data');
      }
      
      setSchool(schoolData);
      if (onSchoolLoaded) {
        onSchoolLoaded(schoolData);
      }
    } catch (e) {
      console.error('Failed to load school info:', e);
    }
  };

  const loadBannerImage = async (logoUrl: string) => {
    try {
      // Check if banner is already cached
      const cachedBanner = await AsyncStorage.getItem(`schoolBanner_${user?.schoolId}`);
      if (cachedBanner) {
        console.log('Using cached banner image');
        setBannerImage(cachedBanner);
        return;
      }
      
      // Use the logo URL directly as banner (will be displayed larger)
      console.log('Setting banner image from URL:', logoUrl);
      setBannerImage(logoUrl);
      
      // Cache the URL for future use
      await AsyncStorage.setItem(`schoolBanner_${user?.schoolId}`, logoUrl);
    } catch (error) {
      console.error('Failed to load banner image:', error);
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const changeUserImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setUserImage(imageUri);
        
        // Save to storage
        if (user?.id) {
          await AsyncStorage.setItem(`userImage_${user.id}`, imageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleLogout = async () => {
    console.log('=== LOGOUT BUTTON PRESSED ===');
    
    try {
      // Close drawer immediately
      setDrawerVisible(false);
      console.log('Drawer visibility set to false');
      
      // Clear auth state
      console.log('Clearing auth state...');
      logout();
      console.log('Auth cleared');
      
      // Navigate to login
      console.log('Navigating to login page...');
      router.replace('/login');
      console.log('Navigation complete');
      
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const navigateTo = (screen: string) => {
    // Close drawer animation first
    Animated.timing(slideAnim, {
      toValue: -width * 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
    
    // Navigate after animation starts  
    setTimeout(() => {
      try {
        console.log('Navigating to:', screen, 'Role:', user?.role);
        
        // Use Expo Router paths for tab navigation
        if (screen === 'dashboard') {
          router.push('/(tabs)/');
        } else if (screen === 'profile') {
          router.push('/(tabs)/profile');
        } else if (screen === 'assignments') {
          router.push('/(tabs)/assignments');
        } else if (screen === 'attendance') {
          // For parent role, attendance might be in assignments or separate
          router.push('/(tabs)/assignments');
        } else if (screen === 'notifications') {
          router.push('/(tabs)/notifications');
        }
        console.log('Navigation completed');
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to navigate to the screen.');
      }
    }, 50);
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={() => router.push('/(tabs)/')} style={styles.menuButton}>
            <Text style={styles.menuIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.schoolInfo}>
          {showBanner && bannerImage ? (
            <Image 
              source={{ uri: bannerImage }} 
              style={styles.bannerInHeader}
              resizeMode="cover"
              onError={(error: any) => {
                console.log('Banner image load error:', error.nativeEvent?.error);
                setBannerImage(null);
              }}
              onLoad={() => console.log('Banner image loaded successfully in header')}
            />
          ) : school?.logo ? (
            <Image 
              source={{ uri: school.logo }} 
              style={styles.logo}
              onError={(error: any) => {
                console.log('Logo load error:', error.nativeEvent?.error);
                setSchool({ ...school, logo: undefined });
              }}
              onLoad={() => console.log('Logo loaded successfully')}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>🏫</Text>
            </View>
          )}
          <View style={styles.schoolDetails}>
            <Text style={styles.schoolName} numberOfLines={1}>
              {school?.name || 'School Name'}
            </Text>
            {showFullInfo && (
              <>
                <Text style={styles.schoolAddress} numberOfLines={1}>
                  📍 {school?.address || 'Loading...'}
                </Text>
                {school?.phone && (
                  <Text style={styles.schoolPhone} numberOfLines={1}>
                    📞 {school.phone}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDrawer}
        />
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={changeUserImage} style={styles.avatarContainer}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.userImage} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatar}>
                    {user?.role === 'driver' ? '🚌' : '👨‍👩‍👧‍👦'}
                  </Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Text style={styles.editIcon}>✏️</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('dashboard')}
            >
              <Text style={styles.menuItemIcon}>🏠</Text>
              <Text style={styles.menuItemText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('profile')}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('notifications')}
            >
              <Text style={styles.menuItemIcon}>🔔</Text>
              <Text style={styles.menuItemText}>Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('assignments')}
            >
              <Text style={styles.menuItemIcon}>📋</Text>
              <Text style={styles.menuItemText}>Assignments</Text>
            </TouchableOpacity>

            {user?.role === 'parent' && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('attendance')}
              >
                <Text style={styles.menuItemIcon}>📊</Text>
                <Text style={styles.menuItemText}>Attendance</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Logout Section at Bottom */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 70,
  },
  bannerInHeader: {
    width: 120,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  schoolInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  schoolAddress: {
    fontSize: 12,
    color: '#666',
  },
  schoolPhone: {
    fontSize: 11,
    color: '#007BFF',
    marginTop: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.3,
    backgroundColor: '#fff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileSection: {
    backgroundColor: '#007BFF',
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    position: 'relative',
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 4,
  },
  menuSection: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff5252',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff5252',
    fontWeight: '600',
    flex: 1,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  footerSchoolName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  footerContact: {
    fontSize: 12,
    color: '#666',
  },
});
