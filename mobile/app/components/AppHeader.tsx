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
  SafeAreaView,
} from 'react-native';
import { Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api, { baseURL } from '../services/api';

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
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const slideAnim = useState(new Animated.Value(-width * 0.6))[0];
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [headerColorFrom, setHeaderColorFrom] = useState<string | null>(null);
  const [headerColorTo, setHeaderColorTo] = useState<string | null>(null);
  const [sidebarColorFrom, setSidebarColorFrom] = useState<string | null>(null);
  const [sidebarColorTo, setSidebarColorTo] = useState<string | null>(null);

  useEffect(() => {
    loadSchoolInfo();
    loadUserImage();
    
    // Set up polling to check for school data changes every 30 seconds
    const pollInterval = setInterval(() => {
      loadSchoolInfo();
    }, 30000); // 30 seconds
    
    return () => clearInterval(pollInterval);
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
      
      // Check if school data has changed by comparing with cached data
      const cachedSchoolData = await AsyncStorage.getItem(`schoolData_${user.schoolId}`);
      let shouldClearCache = false;
      
      if (cachedSchoolData) {
        const parsedCachedData = JSON.parse(cachedSchoolData);
        // Compare logo/photo URLs to detect changes
        if (parsedCachedData.logo !== schoolData.logo || parsedCachedData.photo !== schoolData.photo) {
          console.log('School data changed, clearing cache...');
          shouldClearCache = true;
          // Clear cached banner
          await AsyncStorage.removeItem(`schoolBanner_${user.schoolId}`);
          // Clear cached logo
          await AsyncStorage.removeItem(`schoolLogo_${user.schoolId}`);
        }
      }
      
      // Update cached school data
      await AsyncStorage.setItem(`schoolData_${user.schoolId}`, JSON.stringify({
        logo: schoolData.logo,
        photo: schoolData.photo,
        headerColorFrom: schoolData.headerColorFrom || null,
        headerColorTo: schoolData.headerColorTo || null,
        sidebarColorFrom: schoolData.sidebarColorFrom || null,
        sidebarColorTo: schoolData.sidebarColorTo || null,
        updatedAt: Date.now()
      }));

      // Persist colors locally for offline use
      await AsyncStorage.setItem(`schoolHeaderFrom_${user.schoolId}`, schoolData.headerColorFrom || '');
      await AsyncStorage.setItem(`schoolHeaderTo_${user.schoolId}`, schoolData.headerColorTo || '');
      await AsyncStorage.setItem(`schoolSidebarFrom_${user.schoolId}`, schoolData.sidebarColorFrom || '');
      await AsyncStorage.setItem(`schoolSidebarTo_${user.schoolId}`, schoolData.sidebarColorTo || '');
      setHeaderColorFrom(schoolData.headerColorFrom || null);
      setHeaderColorTo(schoolData.headerColorTo || null);
      setSidebarColorFrom(schoolData.sidebarColorFrom || null);
      setSidebarColorTo(schoolData.sidebarColorTo || null);
      
      // Prefer DB-served logo endpoint
      if (user?.schoolId) {
        const host = (baseURL || api.defaults.baseURL || '').replace(/\/api$/, '') || 'http://localhost:4000';
        const logoUrl = `${host}/api/schools/${user.schoolId}/logo`;
        schoolData.logo = logoUrl;
        console.log('Logo URL:', logoUrl);
        // Load and cache the logo locally similar to banner
        await loadLogoImage(logoUrl, shouldClearCache);
      }
      
      // Handle banner/photo URL for banner display
      if (showBanner) {
        const host = (baseURL || api.defaults.baseURL || '').replace(/\/api$/, '') || 'http://localhost:4000';
        const bannerUrl = `${host}/api/schools/${user.schoolId}/banner`;
        console.log('Banner URL:', bannerUrl);
        loadBannerImage(bannerUrl, shouldClearCache);
      }
      
      setSchool(schoolData);
      setLastRefreshTime(Date.now()); // Trigger re-render
      if (onSchoolLoaded) {
        onSchoolLoaded(schoolData);
      }
    } catch (e) {
      console.error('Failed to load school info:', e);
      // Fallback: load cached colors
      try {
        if (user?.schoolId) {
          const hFrom = await AsyncStorage.getItem(`schoolHeaderFrom_${user.schoolId}`);
          const hTo = await AsyncStorage.getItem(`schoolHeaderTo_${user.schoolId}`);
          const sFrom = await AsyncStorage.getItem(`schoolSidebarFrom_${user.schoolId}`);
          const sTo = await AsyncStorage.getItem(`schoolSidebarTo_${user.schoolId}`);
          setHeaderColorFrom(hFrom || null);
          setHeaderColorTo(hTo || null);
          setSidebarColorFrom(sFrom || null);
          setSidebarColorTo(sTo || null);
        }
      } catch (colorErr) {
        console.warn('Failed to load cached colors:', colorErr);
      }
    }
  };

  const loadLogoImage = async (logoUrl: string, forceClear: boolean = false) => {
    try {
      const urlWithBuster = logoUrl + (logoUrl.includes('?') ? `&v=${Date.now()}` : `?v=${Date.now()}`);
      if (!forceClear) {
        const cachedLogo = await AsyncStorage.getItem(`schoolLogo_${user?.schoolId}`);
        if (cachedLogo) {
          console.log('Using cached logo image');
          setLogoImage(cachedLogo);
          return;
        }
      } else {
        console.log('Force clearing logo cache and reloading');
      }

      let finalUri = urlWithBuster;
      if (urlWithBuster.startsWith('http')) {
        try {
          const fileName = `schoolLogo_${user?.schoolId}.jpg`;
          const filePath = FileSystem.cacheDirectory + fileName;
          const info = await FileSystem.getInfoAsync(filePath);
          if (!info.exists || forceClear) {
            console.log('Downloading logo image to cache:', filePath);
            await FileSystem.downloadAsync(urlWithBuster, filePath);
          }
          finalUri = filePath;
        } catch (downloadErr) {
          console.warn('Logo download failed, using remote URL:', downloadErr);
        }
      }
      console.log('Setting logo image URI:', finalUri);
      setLogoImage(finalUri);
      await AsyncStorage.setItem(`schoolLogo_${user?.schoolId}`, finalUri);
    } catch (error) {
      console.error('Failed to load logo image:', error);
    }
  };

  const loadBannerImage = async (logoUrl: string, forceClear: boolean = false) => {
    try {
      // Add cache-buster to avoid stale/partial cached streams on Android
      const urlWithBuster = logoUrl + (logoUrl.includes('?') ? `&v=${Date.now()}` : `?v=${Date.now()}`);
      // If forceClear is true, skip cache check
      if (!forceClear) {
        // Check if banner is already cached
        const cachedBanner = await AsyncStorage.getItem(`schoolBanner_${user?.schoolId}`);
        if (cachedBanner) {
          console.log('Using cached banner image');
          setBannerImage(cachedBanner);
          return;
        }
      } else {
        console.log('Force clearing banner cache and reloading');
      }
      
      // Attempt to download & cache locally for reliability (falls back to remote URL)
      let finalUri = urlWithBuster;
      if (urlWithBuster.startsWith('http')) {
        try {
          const fileName = `schoolBanner_${user?.schoolId}.jpg`;
          const filePath = FileSystem.cacheDirectory + fileName;
          const info = await FileSystem.getInfoAsync(filePath);
          if (!info.exists || forceClear) {
            console.log('Downloading banner image to cache:', filePath);
            await FileSystem.downloadAsync(urlWithBuster, filePath);
          }
          finalUri = filePath;
        } catch (downloadErr) {
          console.warn('Banner download failed, using remote URL:', downloadErr);
        }
      }
      console.log('Setting banner image URI:', finalUri);
      setBannerImage(finalUri);
      await AsyncStorage.setItem(`schoolBanner_${user?.schoolId}`, finalUri);
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
      toValue: -width * 0.6,
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
      toValue: -width * 0.6,
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
      {/* Header with Safe Area */}
      <SafeAreaView style={styles.safeArea}>
        {headerColorFrom && headerColorTo ? (
          <LinearGradient colors={[headerColorFrom, headerColorTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
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
              {logoImage ? (
                <Image source={{ uri: logoImage }} style={styles.logo} onError={(error: any) => { console.log('Cached logo load error:', error.nativeEvent?.error); setLogoImage(null); }} onLoad={() => console.log('Cached logo loaded successfully')} />
              ) : school?.logo ? (
                <Image source={{ uri: school.logo + (school.logo?.includes('?') ? `&v=${lastRefreshTime}` : `?v=${lastRefreshTime}`) }} style={styles.logo} onError={(error: any) => { console.log('Logo load error:', error.nativeEvent?.error); setSchool({ ...school, logo: undefined }); }} onLoad={() => console.log('Logo loaded successfully')} />
              ) : (
                <View style={styles.logoPlaceholder}><Text style={styles.logoText}>🏫</Text></View>
              )}
              <View style={styles.schoolDetails}>
                <Text style={[styles.schoolName, { color: '#fff' }]} numberOfLines={1}>{school?.name || 'School Name'}</Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
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
              {logoImage ? (
                <Image source={{ uri: logoImage }} style={styles.logo} onError={(error: any) => { console.log('Cached logo load error:', error.nativeEvent?.error); setLogoImage(null); }} onLoad={() => console.log('Cached logo loaded successfully')} />
              ) : school?.logo ? (
                <Image source={{ uri: school.logo + (school.logo?.includes('?') ? `&v=${lastRefreshTime}` : `?v=${lastRefreshTime}`) }} style={styles.logo} onError={(error: any) => { console.log('Logo load error:', error.nativeEvent?.error); setSchool({ ...school, logo: undefined }); }} onLoad={() => console.log('Logo loaded successfully')} />
              ) : (
                <View style={styles.logoPlaceholder}><Text style={styles.logoText}>🏫</Text></View>
              )}
              <View style={styles.schoolDetails}>
                <Text style={styles.schoolName} numberOfLines={1}>{school?.name || 'School Name'}</Text>
              </View>
            </View>
          </View>
        )}
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
          {logoImage ? (
            <Image
              source={{ uri: logoImage }}
              style={styles.logo}
              onError={(error: any) => {
                console.log('Cached logo load error:', error.nativeEvent?.error);
                setLogoImage(null);
              }}
              onLoad={() => console.log('Cached logo loaded successfully')}
            />
          ) : school?.logo ? (
            <Image
              source={{ uri: school.logo + (school.logo?.includes('?') ? `&v=${lastRefreshTime}` : `?v=${lastRefreshTime}`) }}
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
          </View>
        </View>
      </View>
      </SafeAreaView>

      {/* School Banner - Only on Home Page */}
      {showBanner && bannerImage && (
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: bannerImage }}
            style={styles.bannerImageDisplay}
            resizeMode="contain"
            onError={(error: any) => {
              console.log('Banner image load error:', error.nativeEvent?.error);
              setBannerImage(null);
            }}
            onLoad={() => console.log('Banner image loaded successfully')}
          />
        </View>
      )}

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        {/* Overlay only covers area outside drawer to keep drawer clickable */}
        <TouchableOpacity
          style={[styles.overlay, { left: width * 0.6 }]}
          activeOpacity={1}
          onPress={closeDrawer}
        />
        {sidebarColorFrom && sidebarColorTo ? (
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            <LinearGradient colors={[sidebarColorFrom, sidebarColorTo]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.drawer}>
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
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('profile')}>
                  <Text style={styles.menuItemIcon}>👤</Text>
                  <Text style={styles.menuItemText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('notifications')}>
                  <Text style={styles.menuItemIcon}>🔔</Text>
                  <Text style={styles.menuItemText}>Alert</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('assignments')}>
                  <Text style={styles.menuItemIcon}>📋</Text>
                  <Text style={styles.menuItemText}>Assignments</Text>
                </TouchableOpacity>
                {user?.role === 'parent' && (
                  <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('attendance')}>
                    <Text style={styles.menuItemIcon}>📊</Text>
                    <Text style={styles.menuItemText}>Attendance</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Logout Section at Bottom */}
              <View style={styles.logoutSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutIcon}>🚪</Text>
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.drawer,
              sidebarColorFrom ? { backgroundColor: sidebarColorFrom } : null,
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
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('dashboard')}>
                <Text style={styles.menuItemIcon}>🏠</Text>
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('profile')}>
                <Text style={styles.menuItemIcon}>👤</Text>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('notifications')}>
                <Text style={styles.menuItemIcon}>🔔</Text>
                <Text style={styles.menuItemText}>Alert</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('assignments')}>
                <Text style={styles.menuItemIcon}>📋</Text>
                <Text style={styles.menuItemText}>Assignments</Text>
              </TouchableOpacity>
              {user?.role === 'parent' && (
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('attendance')}>
                  <Text style={styles.menuItemIcon}>📊</Text>
                  <Text style={styles.menuItemText}>Attendance</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Logout Section at Bottom */}
            <View style={styles.logoutSection}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bannerContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  bannerImageDisplay: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
    backgroundColor: '#fff',
    padding: 2,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.6,
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
    backgroundColor: '#007BFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#d32f2f',
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
