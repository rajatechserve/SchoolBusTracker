
import React from 'react';
import { View } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

export default function DriverDashboard({ route, navigation }) {
  const { driver, bus } = route.params || {};

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={{ marginBottom: 16, padding: 12 }}>
        <Title>Bus {bus}</Title>
        <Paragraph>Driver: {driver}</Paragraph>
      </Card>
      <Button mode="contained" onPress={() => navigation.navigate('LocationShare', { bus })}>
        Start Sharing
      </Button>
    </View>
  );
}
