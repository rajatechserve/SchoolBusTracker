import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DriverLogin from './screens/Driver/DriverLogin';
import DriverDashboard from './screens/Driver/DriverDashboard';
import ParentLogin from './screens/Parent/ParentLogin';
import ParentDashboard from './screens/Parent/ParentDashboard';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ParentLogin">
        <Stack.Screen name="DriverLogin" component={DriverLogin} />
        <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
        <Stack.Screen name="ParentLogin" component={ParentLogin} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;