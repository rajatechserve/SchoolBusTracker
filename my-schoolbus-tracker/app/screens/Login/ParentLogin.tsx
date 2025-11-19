import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api, { attachToken } from '../../services/api';
import { router } from 'expo-router';

export default function ParentLogin() {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginLocal } = useAuth();
  const rawPhone = phone.replace(/[^0-9]/g,'');
  const combined = `${countryCode}${rawPhone}`;
  const valid = /^\+\d{7,15}$/.test(combined);

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const resp = await api.post('/auth/parent-login', { phone: combined, studentId: studentId.trim() || undefined });
      const token = resp.data?.token;
      if (token) attachToken(token);
      const busId = resp.data?.parent?.bus || null;
      loginLocal('parent', { id: combined, name: resp.data?.parent?.name || `Parent ${combined.slice(-4)}`, phone: combined, bus: busId }, token);
      router.replace('/(tabs)');
    } catch(e:any){ console.warn('Parent login failed', e?.message); } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Login</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.ccButton} onPress={()=>setPickerOpen(true)}>
          <Text style={styles.ccText}>{countryCode}</Text>
        </TouchableOpacity>
        <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={[styles.input,{flex:1}]} keyboardType="phone-pad" />
      </View>
      <Text style={styles.helper}>{valid? 'Format OK' : 'Enter digits (7-15) after code'}</Text>
      <TextInput placeholder="Student ID (optional)" value={studentId} onChangeText={setStudentId} style={styles.input} />
      <TouchableOpacity disabled={!valid || loading} onPress={submit} style={[styles.button, (!valid||loading)&&styles.buttonDisabled]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <Modal visible={pickerOpen} transparent animationType="slide">
        <View style={styles.modalOuter}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(i)=>i}
              renderItem={({item})=> (
                <TouchableOpacity style={styles.codeRow} onPress={()=>{setCountryCode(item); setPickerOpen(false);}}>
                  <Text style={styles.codeText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={()=>setPickerOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const COUNTRY_CODES = ['+1','+44','+91','+61','+81','+49','+971','+966','+33','+39'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  row: { flexDirection:'row', alignItems:'center', marginBottom:8 },
  ccButton: { borderWidth:1, borderColor:'#ccc', borderRadius:5, paddingVertical:10, paddingHorizontal:12, marginRight:8 },
  ccText: { fontSize:16 },
  helper: { fontSize:12, color:'#555', marginBottom:12 },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalOuter:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', padding:24 },
  modalInner:{ backgroundColor:'#fff', borderRadius:8, padding:16, maxHeight:'80%' },
  modalTitle:{ fontSize:18, fontWeight:'600', marginBottom:12 },
  codeRow:{ paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#eee' },
  codeText:{ fontSize:16 },
  closeButton:{ marginTop:12, backgroundColor:'#007BFF', paddingVertical:10, borderRadius:6, alignItems:'center' },
  closeText:{ color:'#fff', fontWeight:'600' }
});
