
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DriverDashboard from '../screens/Driver/DriverDashboard';
import LocationShare from '../screens/Driver/LocationShare';
import Profile from '../screens/Common/Profile';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Home" component={DriverDashboard} options={{ tabBarIcon: ({color,size}) => <MaterialIcons name="home" size={size} color={color} />}} />
      <Tab.Screen name="Share" component={LocationShare} options={{ title:'Share Location', tabBarIcon: ({color,size}) => <MaterialIcons name="my-location" size={size} color={color} />}} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarIcon: ({color,size}) => <MaterialIcons name="person" size={size} color={color} />}} />
    </Tab.Navigator>
  );
}
