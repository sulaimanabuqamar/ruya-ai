import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RideFlow'>;

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';

function mockPrice(): number {
  return Math.floor(12 + Math.random() * 7);
}

function mockDemand(): { label: string; score: number } {
  const score = Math.round((6 + Math.random() * 4) * 10) / 10;
  const label = score >= 8 ? 'High' : score >= 6 ? 'Medium' : 'Low';
  return { label, score };
}

export function RideFlowScreen({ route }: Props) {
  const { mode } = route.params;
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [earliest, setEarliest] = useState('08:00');
  const [latest, setLatest] = useState('08:30');
  const [snackVisible, setSnackVisible] = useState(false);

  const suggestedPrice = useMemo(() => mockPrice(), []);
  const demand = useMemo(() => mockDemand(), []);

  const handleSubmit = () => {
    const data = { from, to, earliest, latest, suggestedPrice, demand, mode };
    console.log('Ride flow submit:', data);
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
          <Ionicons name="map-outline" size={48} color={SUBTEXT} />
          <Text variant="bodySmall" style={styles.mapLabel}>
            Map view (pickup & dropoff)
          </Text>
        </View>

        <Card style={styles.formCard} mode="elevated">
          <Card.Content style={styles.formContent}>
            <Text variant="titleLarge" style={styles.formTitle}>
              {isNeed ? 'Book your ride' : 'Offer your ride'}
            </Text>

            <TextInput
              label="From"
              placeholder="Dubai Marina"
              value={from}
              onChangeText={setFrom}
              mode="outlined"
              left={<TextInput.Icon icon="location-outline" />}
              style={styles.input}
            />
            <TextInput
              label="To"
              placeholder="Dubai Internet City"
              value={to}
              onChangeText={setTo}
              mode="outlined"
              left={<TextInput.Icon icon="location-outline" />}
              style={styles.input}
            />

            <Text variant="labelMedium" style={styles.fieldLabel}>
              Departure window
            </Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <TextInput
                  placeholder="08:00"
                  value={earliest}
                  onChangeText={setEarliest}
                  mode="outlined"
                  style={[styles.input, styles.inputRow]}
                />
              </View>
              <View style={styles.half}>
                <TextInput
                  placeholder="08:30"
                  value={latest}
                  onChangeText={setLatest}
                  mode="outlined"
                  style={[styles.input, styles.inputRow]}
                />
              </View>
            </View>

            <View style={styles.readOnlyRow}>
              <Text variant="bodyMedium" style={styles.readOnlyLabel}>
                Suggested (approx.)
              </Text>
              <Text variant="titleMedium" style={styles.readOnlyValue}>
                {suggestedPrice} AED
              </Text>
            </View>

            <View style={styles.demandRow}>
              <Text variant="bodyMedium" style={styles.demandText}>
                Estimated demand: {demand.label} ({demand.score} / 10)
              </Text>
              <View style={[styles.demandBar, { width: `${demand.score * 10}%` }]} />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitBtn}
            >
              {isNeed ? 'Request ride' : 'Publish ride offer'}
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
        {isNeed ? 'Ride request submitted' : 'Ride offer published'}
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
    height: 220,
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
    marginTop: 0,
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
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  readOnlyLabel: {
    color: SUBTEXT,
  },
  readOnlyValue: {
    color: PRIMARY,
  },
  demandRow: {
    marginBottom: 24,
  },
  demandText: {
    color: TEXT,
    marginBottom: 8,
  },
  demandBar: {
    height: 8,
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  submitBtn: {
    borderRadius: 16,
  },
  snackbar: {
    backgroundColor: SURFACE,
  },
});
