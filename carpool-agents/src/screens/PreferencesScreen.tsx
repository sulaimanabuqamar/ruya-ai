import React, { useState } from 'react';
import { StyleSheet, View, Switch as NativeSwitch } from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Snackbar,
} from 'react-native-paper';

const BACKGROUND = '#0B1020';
const TRACK_OFF = '#2A3050';

export function PreferencesScreen() {
  const [canDrive, setCanDrive] = useState(true);
  const [canRide, setCanRide] = useState(true);
  const [carCapacity, setCarCapacity] = useState('4');
  const [flexibility, setFlexibility] = useState('0.7');
  const [timeWindow, setTimeWindow] = useState('15');
  const [snackVisible, setSnackVisible] = useState(false);

  const handleSave = () => {
    const prefs = {
      canDrive,
      canRide,
      carCapacity: carCapacity,
      flexibility,
      timeWindow,
    };
    console.log('Saved preferences:', prefs);
    setSnackVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Rider Agent config
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Can drive</Text>
            <NativeSwitch
              value={Boolean(canDrive)}
              onValueChange={setCanDrive}
              thumbColor="#FFFFFF"
              ios_backgroundColor={TRACK_OFF}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Can ride as passenger</Text>
            <NativeSwitch
              value={Boolean(canRide)}
              onValueChange={setCanRide}
              thumbColor="#FFFFFF"
              ios_backgroundColor={TRACK_OFF}
            />
          </View>
          <TextInput
            label="Car capacity (including you)"
            value={carCapacity}
            onChangeText={setCarCapacity}
            keyboardType="number-pad"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Flexibility (0–1)"
            value={flexibility}
            onChangeText={setFlexibility}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Time window (minutes)"
            value={timeWindow}
            onChangeText={setTimeWindow}
            keyboardType="number-pad"
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            Save preferences
          </Button>
        </Card.Content>
      </Card>
      <Snackbar
        visible={Boolean(snackVisible)}
        onDismiss={() => setSnackVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        Preferences saved
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  title: {
    color: '#F0F2F5',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#151A30',
    borderRadius: 16,
  },
  cardContent: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  label: {
    color: '#F0F2F5',
    flex: 1,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#1E2440',
  },
  saveButton: {
    marginTop: 16,
  },
  snackbar: {
    backgroundColor: '#151A30',
  },
});
