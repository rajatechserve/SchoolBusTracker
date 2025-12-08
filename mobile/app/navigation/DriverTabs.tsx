import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import DriverDashboard from '../screens/Driver/DriverDashboard';
import DriverMap from '../screens/Driver/Map';
import Profile from '../screens/Common/Profile';
import DriverAssignments from '../screens/Driver/Assignments';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

type TabBarIconProps = {
  color: string;
  size: number;
};

export default function DriverTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DriverDashboard}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={DriverMap}
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={DriverAssignments}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
