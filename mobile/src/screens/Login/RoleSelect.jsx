
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title } from 'react-native-paper';

export default function RoleSelect({ navigation }) {
  return (
    <View style={styles.container}>
      <Title>Select your role</Title>
      <Button mode="contained" onPress={() => navigation.navigate('DriverLogin')} style={{ marginTop: 16 }}>
        I'm a Driver
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('ParentLogin')} style={{ marginTop: 8 }}>
        I'm a Parent
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 } });
