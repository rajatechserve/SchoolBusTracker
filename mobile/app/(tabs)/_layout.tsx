import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  // If no user, shouldn't be here - but routing guard should handle this
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          height: 75,
          paddingBottom: 12,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 28, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 28, color }}>👤</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Assign',
          tabBarIcon: ({ color }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 28, color }}>📋</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alert',
          tabBarIcon: ({ color }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 28, color }}>🔔</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
