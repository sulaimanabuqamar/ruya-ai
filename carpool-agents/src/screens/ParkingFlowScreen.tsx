import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card, Text, TextInput, Button, Snackbar, List } from 'react-native-paper';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaceSuggestions, fetchPlaceDetails } from '../api/maps';
import type { PlaceSuggestion, LocationPoint } from '../api/maps';

type ParkingFlowProps = NativeStackScreenProps<RootStackParamList, 'ParkingFlow'>;

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';

const initialDubaiRegion = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

function mockBookingProbability(): number {
  return Math.floor(60 + Math.random() * 35);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function ParkingFlowScreen({ route }: ParkingFlowProps) {
  const { mode } = route.params;
  const [parkingQuery, setParkingQuery] = useState('');
  const [parkingLocation, setParkingLocation] = useState<LocationPoint | null>(null);
  const [parkingSuggestions, setParkingSuggestions] = useState<PlaceSuggestion[]>([]);
  const [region, setRegion] = useState<typeof initialDubaiRegion | null>(null);
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('17:00');
  const [price, setPrice] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const debouncedQuery = useDebounce(parkingQuery, 300);
  const bookingProbability = useMemo(() => mockBookingProbability(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && !cancelled) {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else if (!cancelled) {
          setRegion(initialDubaiRegion);
        }
      } catch {
        if (!cancelled) setRegion(initialDubaiRegion);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setParkingSuggestions([]);
      return;
    }
    let cancelled = false;
    fetchPlaceSuggestions(debouncedQuery).then((list) => {
      if (!cancelled) setParkingSuggestions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const onSuggestion = useCallback(async (s: PlaceSuggestion) => {
    const details = await fetchPlaceDetails(s.id);
    if (details) {
      setParkingLocation({
        lat: details.lat,
        lng: details.lng,
        description: details.description,
      });
      setParkingQuery(details.description);
      setParkingSuggestions([]);
      setRegion({
        latitude: details.lat,
        longitude: details.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, []);

  const onMapPress = useCallback(
    (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setParkingLocation({
        lat: latitude,
        lng: longitude,
        description: 'Pinned location',
      });
      setParkingQuery('Pinned location');
    },
    []
  );

  const handleSubmit = () => {
    const data = {
      parkingLocation,
      parkingQuery,
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
  const mapRegion = region ?? initialDubaiRegion;

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setRegion}
          onPress={onMapPress}
        >
          {parkingLocation && (
            <Marker
              coordinate={{
                latitude: parkingLocation.lat,
                longitude: parkingLocation.lng,
              }}
              title="Parking"
              pinColor={PRIMARY}
            />
          )}
        </MapView>
        <View style={styles.mapHint}>
          <Text variant="bodySmall" style={styles.mapHintText}>
            Tap map to set parking location
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard} mode="elevated">
          <Card.Content style={styles.formContent}>
            <Text variant="titleLarge" style={styles.formTitle}>
              {isNeed ? 'Find a parking spot' : 'Offer a parking spot'}
            </Text>

            <TextInput
              label="Location for parking"
              placeholder="Business Bay Tower A"
              value={parkingQuery}
              onChangeText={setParkingQuery}
              mode="outlined"
              left={<TextInput.Icon icon="location-outline" />}
              style={styles.input}
            />
            {parkingSuggestions.length > 0 && (
              <Card style={styles.suggestionsCard}>
                {parkingSuggestions.slice(0, 4).map((s) => (
                  <List.Item
                    key={s.id}
                    title={s.description}
                    onPress={() => onSuggestion(s)}
                    titleStyle={styles.suggestionTitle}
                  />
                ))}
              </Card>
            )}

            <Text variant="labelMedium" style={styles.fieldLabel}>
              {isNeed
                ? 'Need spot from [time] to [time]'
                : 'Spot available from [time] to [time]'}
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
  mapWrap: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  mapHint: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  mapHintText: {
    color: TEXT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
  suggestionsCard: {
    backgroundColor: BACKGROUND,
    marginBottom: 12,
    borderRadius: 12,
  },
  suggestionTitle: {
    color: TEXT,
    fontSize: 14,
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
