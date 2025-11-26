import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ParentDashboard from '../screens/Parent/ParentDashboard';
import TrackBus from '../screens/Parent/TrackBus';
import Profile from '../screens/Common/Profile';
import Assignments from '../screens/Parent/Assignments';
import AttendanceScreen from '../screens/Parent/Attendance';

const Stack = createStackNavigator();

export default function ParentTabs() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={ParentDashboard}
      />
      <Stack.Screen
        name="Track"
        component={TrackBus}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
      />
      <Stack.Screen
        name="Assignments"
        component={Assignments}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
      />
    </Stack.Navigator>
  );
}
