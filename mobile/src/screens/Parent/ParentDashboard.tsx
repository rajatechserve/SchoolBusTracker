import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Map from '../../components/Map';
import VehicleStatus from '../../components/VehicleStatus';

const ParentDashboard = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Parent Dashboard</Text>
            <Map />
            <VehicleStatus />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export default ParentDashboard;