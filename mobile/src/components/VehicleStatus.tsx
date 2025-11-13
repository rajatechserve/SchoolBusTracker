import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VehicleStatus = ({ vehicle }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vehicle Status</Text>
            <Text style={styles.info}>Vehicle ID: {vehicle.id}</Text>
            <Text style={styles.info}>Current Location: {vehicle.location}</Text>
            <Text style={styles.info}>Status: {vehicle.status}</Text>
            <Text style={styles.info}>Estimated Arrival: {vehicle.estimatedArrival}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    info: {
        fontSize: 16,
        marginBottom: 4,
    },
});

export default VehicleStatus;