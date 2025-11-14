
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelect from '../screens/Login/RoleSelect';
import DriverLogin from '../screens/Login/DriverLogin';
import ParentLogin from '../screens/Login/ParentLogin';

const Stack = createNativeStackNavigator();
export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="RoleSelect" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelect" component={RoleSelect} />
      <Stack.Screen name="DriverLogin" component={DriverLogin} />
      <Stack.Screen name="ParentLogin" component={ParentLogin} />
    </Stack.Navigator>
  );
}
