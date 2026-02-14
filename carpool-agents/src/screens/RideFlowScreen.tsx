import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card, Text, TextInput, Button, Snackbar, List } from 'react-native-paper';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaceSuggestions, fetchPlaceDetails } from '../api/maps';
import type { PlaceSuggestion, LocationPoint } from '../api/maps';

type RideFlowProps = NativeStackScreenProps<RootStackParamList, 'RideFlow'>;

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

function mockPrice(): number {
  return Math.floor(12 + Math.random() * 7);
}

function mockDemand(): { label: string; score: number } {
  const score = Math.round((6 + Math.random() * 4) * 10) / 10;
  const label = score >= 8 ? 'High' : score >= 6 ? 'Medium' : 'Low';
  return { label, score };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function RideFlowScreen({ route }: RideFlowProps) {
  const { mode } = route.params;
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [pickupLocation, setPickupLocation] = useState<LocationPoint | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationPoint | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<PlaceSuggestion[]>([]);
  const [region, setRegion] = useState<typeof initialDubaiRegion | null>(null);
  const [isSelectingPickup, setIsSelectingPickup] = useState(true);
  const [earliest, setEarliest] = useState('08:00');
  const [latest, setLatest] = useState('08:30');
  const [snackVisible, setSnackVisible] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const debouncedPickup = useDebounce(pickupQuery, 300);
  const debouncedDropoff = useDebounce(dropoffQuery, 300);

  const suggestedPrice = useMemo(() => mockPrice(), []);
  const demand = useMemo(() => mockDemand(), []);

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
    if (debouncedPickup.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    let cancelled = false;
    fetchPlaceSuggestions(debouncedPickup).then((list) => {
      if (!cancelled) setPickupSuggestions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedPickup]);

  useEffect(() => {
    if (debouncedDropoff.length < 3) {
      setDropoffSuggestions([]);
      return;
    }
    let cancelled = false;
    fetchPlaceSuggestions(debouncedDropoff).then((list) => {
      if (!cancelled) setDropoffSuggestions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedDropoff]);

  const onPickupSuggestion = useCallback(async (s: PlaceSuggestion) => {
    const details = await fetchPlaceDetails(s.id);
    if (details) {
      setPickupLocation({ lat: details.lat, lng: details.lng, description: details.description });
      setPickupQuery(details.description);
      setPickupSuggestions([]);
      setRegion({
        latitude: details.lat,
        longitude: details.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      if (dropoffLocation && mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: details.lat, longitude: details.lng },
            { latitude: dropoffLocation.lat, longitude: dropoffLocation.lng },
          ],
          { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } }
        );
      }
    }
  }, [dropoffLocation]);

  const onDropoffSuggestion = useCallback(async (s: PlaceSuggestion) => {
    const details = await fetchPlaceDetails(s.id);
    if (details) {
      setDropoffLocation({ lat: details.lat, lng: details.lng, description: details.description });
      setDropoffQuery(details.description);
      setDropoffSuggestions([]);
      if (pickupLocation && mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
            { latitude: details.lat, longitude: details.lng },
          ],
          { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } }
        );
      } else {
        setRegion({
          latitude: details.lat,
          longitude: details.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    }
  }, [pickupLocation]);

  const onMapPress = useCallback(
    (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const desc = 'Pinned location';
      if (isSelectingPickup) {
        setPickupLocation({ lat: latitude, lng: longitude, description: desc });
        setPickupQuery(desc);
        setIsSelectingPickup(false);
      } else {
        setDropoffLocation({ lat: latitude, lng: longitude, description: desc });
        setDropoffQuery(desc);
        setIsSelectingPickup(true);
      }
    },
    [isSelectingPickup]
  );

  const handleSubmit = () => {
    const data = {
      pickupLocation,
      dropoffLocation,
      pickupQuery,
      dropoffQuery,
      earliest,
      latest,
      suggestedPrice,
      demand,
      mode,
    };
    console.log('Ride flow submit:', data);
    setSnackVisible(true);
  };

  const isNeed = mode === 'need';
  const mapRegion = region ?? initialDubaiRegion;

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setRegion}
          onPress={onMapPress}
        >
          {pickupLocation && (
            <Marker
              coordinate={{ latitude: pickupLocation.lat, longitude: pickupLocation.lng }}
              title="Pickup"
              pinColor={PRIMARY}
            />
          )}
          {dropoffLocation && (
            <Marker
              coordinate={{ latitude: dropoffLocation.lat, longitude: dropoffLocation.lng }}
              title="Dropoff"
            />
          )}
        </MapView>
        <View style={styles.mapHint}>
          <Text variant="bodySmall" style={styles.mapHintText}>
            Tap map: {isSelectingPickup ? 'set pickup' : 'set dropoff'}
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
              {isNeed ? 'Book your ride' : 'Offer your ride'}
            </Text>

            <TextInput
              label="From"
              placeholder="Dubai Marina"
              value={pickupQuery}
              onChangeText={setPickupQuery}
              mode="outlined"
              left={<TextInput.Icon icon="location-outline" />}
              style={styles.input}
            />
            {pickupSuggestions.length > 0 && (
              <Card style={styles.suggestionsCard}>
                {pickupSuggestions.slice(0, 4).map((s) => (
                  <List.Item
                    key={s.id}
                    title={s.description}
                    onPress={() => onPickupSuggestion(s)}
                    titleStyle={styles.suggestionTitle}
                  />
                ))}
              </Card>
            )}

            <TextInput
              label="To"
              placeholder="Dubai Internet City"
              value={dropoffQuery}
              onChangeText={setDropoffQuery}
              mode="outlined"
              left={<TextInput.Icon icon="location-outline" />}
              style={styles.input}
            />
            {dropoffSuggestions.length > 0 && (
              <Card style={styles.suggestionsCard}>
                {dropoffSuggestions.slice(0, 4).map((s) => (
                  <List.Item
                    key={s.id}
                    title={s.description}
                    onPress={() => onDropoffSuggestion(s)}
                    titleStyle={styles.suggestionTitle}
                  />
                ))}
              </Card>
            )}

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
  mapWrap: {
    height: 220,
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
