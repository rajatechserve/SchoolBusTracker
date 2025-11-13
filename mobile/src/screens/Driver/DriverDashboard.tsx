import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VehicleStatus from '../../components/VehicleStatus';
import Map from '../../components/Map';

const DriverDashboard = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Driver Dashboard</Text>
            <VehicleStatus />
            <Map />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default DriverDashboard;