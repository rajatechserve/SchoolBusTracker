import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function ParentLogin({ navigation }: { navigation: any }) {
  const [phone, setPhone] = useState('');
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Title>Parent Login</Title>
      <TextInput label="Phone" value={phone} onChangeText={setPhone} style={styles.input} />
      <Button mode="contained" onPress={() => { login('parent', { id: phone || 'parent1', name: 'Parent' }); }} style={styles.btn}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex:1, justifyContent:'center', padding:20 }, input: { marginTop:12 }, btn: { marginTop:20 } });
