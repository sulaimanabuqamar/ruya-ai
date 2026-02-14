import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ParkingFlow'>;

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';

function mockBookingProbability(): number {
  return Math.floor(60 + Math.random() * 35);
}

export function ParkingFlowScreen({ route }: Props) {
  const { mode } = route.params;
  const [location, setLocation] = useState('');
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('17:00');
  const [price, setPrice] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const bookingProbability = useMemo(() => mockBookingProbability(), []);

  const handleSubmit = () => {
    const data = {
      location,
      fromTime,
      toTime,
      price,
      bookingProbability,
      mode,
    };
    console.log('Parking flow submit:', data);
    setSnackVisible(true);
  };

  const isNeed = mode === 'need';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location-outline" size={48} color={SUBTEXT} />
          <Text variant="bodySmall" style={styles.mapLabel}>
            Parking location area
          </Text>
        </View>

        <Card style={styles.formCard} mode="elevated">
          <Card.Content style={styles.formContent}>
            <Text variant="titleLarge" style={styles.formTitle}>
              {isNeed ? 'Find a parking spot' : 'Offer a parking spot'}
            </Text>

            <TextInput
              label="Location for parking"
              placeholder="Business Bay Tower A"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              left={<TextInput.Icon icon="location-outline" />}
              style={styles.input}
            />

            <Text variant="labelMedium" style={styles.fieldLabel}>
              {isNeed ? 'Need spot from [time] to [time]' : 'Spot available from [time] to [time]'}
            </Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <TextInput
                  placeholder="From"
                  value={fromTime}
                  onChangeText={setFromTime}
                  mode="outlined"
                  style={[styles.input, styles.inputRow]}
                />
              </View>
              <View style={styles.half}>
                <TextInput
                  placeholder="To"
                  value={toTime}
                  onChangeText={setToTime}
                  mode="outlined"
                  style={[styles.input, styles.inputRow]}
                />
              </View>
            </View>

            <TextInput
              label="Add price (AED)"
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.probRow}>
              <Text variant="bodyMedium" style={styles.probText}>
                Expected booking probability: {bookingProbability}%
              </Text>
              <Text variant="bodySmall" style={styles.probHint}>
                AI-generated insight
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitBtn}
            >
              {isNeed ? 'Search parking spots' : 'Publish parking spot'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        {isNeed ? 'Searching for spots…' : 'Parking spot published'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: SURFACE,
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: {
    color: SUBTEXT,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  formTitle: {
    color: TEXT,
    marginBottom: 20,
  },
  input: {
    backgroundColor: BACKGROUND,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  half: {
    flex: 1,
  },
  inputRow: {
    marginBottom: 0,
  },
  fieldLabel: {
    color: SUBTEXT,
    marginBottom: 8,
  },
  probRow: {
    marginBottom: 24,
  },
  probText: {
    color: TEXT,
  },
  probHint: {
    color: SUBTEXT,
    marginTop: 4,
  },
  submitBtn: {
    borderRadius: 16,
  },
  snackbar: {
    backgroundColor: SURFACE,
  },
});
