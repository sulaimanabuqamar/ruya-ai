import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import MapView from 'react-native-maps';
import { Card, Text, TextInput, Button, Snackbar, List, IconButton, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaceSuggestions, fetchPlaceDetails } from '../api/maps';
import type { PlaceSuggestion, LocationPoint } from '../api/maps';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import { TimePickerInput } from '../components/TimePickerInput';
import { parseTime } from '../utils/time';

type RideFlowProps = NativeStackScreenProps<RootStackParamList, 'RideFlow'>;
type SelectionMode = 'none' | 'pickup' | 'dropoff';

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
  const [pickupLocation, setPickupLocation] = useState<LocationPoint | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationPoint | null>(null);
  const [region, setRegion] = useState(initialDubaiRegion);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);

  const [earliestTime, setEarliestTime] = useState<Date | null>(parseTime('08:00'));
  const [latestTime, setLatestTime] = useState<Date | null>(parseTime('08:30'));
  const [snackVisible, setSnackVisible] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const suggestedPrice = useMemo(() => mockPrice(), []);
  const demand = useMemo(() => mockDemand(), []);

  const isFormValid =
    pickupLocation != null &&
    dropoffLocation != null &&
    earliestTime != null &&
    latestTime != null;

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
        }
      } catch {
        // keep default
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enterSelectionMode = useCallback(
    (mode: 'pickup' | 'dropoff') => {
      setSelectionMode(mode);
      setSearchQuery('');
      setSuggestions([]);
      setSelectedLocation(null);
      if (mode === 'pickup') {
        if (pickupLocation) {
          setRegion({
            latitude: pickupLocation.lat,
            longitude: pickupLocation.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else if (dropoffLocation) {
          setRegion({
            latitude: dropoffLocation.lat,
            longitude: dropoffLocation.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } else {
        if (dropoffLocation) {
          setRegion({
            latitude: dropoffLocation.lat,
            longitude: dropoffLocation.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else if (pickupLocation) {
          setRegion({
            latitude: pickupLocation.lat,
            longitude: pickupLocation.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      }
    },
    [pickupLocation, dropoffLocation]
  );

  const cancelSelection = useCallback(() => {
    setSelectionMode('none');
    setSearchQuery('');
    setSuggestions([]);
    setSelectedLocation(null);
  }, []);

  const confirmSelection = useCallback(() => {
    const location: LocationPoint =
      selectedLocation ?? {
        lat: region.latitude,
        lng: region.longitude,
        description: 'Pinned location',
      };
    if (selectionMode === 'pickup') {
      setPickupLocation(location);
    } else if (selectionMode === 'dropoff') {
      setDropoffLocation(location);
    }
    setSelectionMode('none');
    setSearchQuery('');
    setSuggestions([]);
    setSelectedLocation(null);
  }, [selectionMode, selectedLocation, region]);

  useEffect(() => {
    if (selectionMode === 'none') return;
    if (debouncedSearch.length < 3 || !GOOGLE_MAPS_API_KEY) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    fetchPlaceSuggestions(debouncedSearch).then((list) => {
      if (!cancelled) setSuggestions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectionMode]);

  const onSuggestionTap = useCallback(
    async (s: PlaceSuggestion) => {
      const details = await fetchPlaceDetails(s.id);
      if (details) {
        setSelectedLocation(details);
        setSuggestions([]);
        setRegion({
          latitude: details.lat,
          longitude: details.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    },
    []
  );

  const handleSubmit = () => {
    if (!isFormValid) return;
    console.log('Ride flow submit', {
      pickupLocation,
      dropoffLocation,
      earliestTime,
      latestTime,
      suggestedPrice,
      demand,
      mode,
    });
    setSnackVisible(true);
  };

  const isNeed = mode === 'need';

  if (selectionMode !== 'none') {
    const title =
      selectionMode === 'pickup'
        ? 'Select pickup location'
        : 'Select dropoff location';
    const currentDesc =
      selectedLocation?.description ??
      `${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)}`;

    return (
      <View style={styles.fullScreen}>
        <MapView
          style={StyleSheet.absoluteFill}
          region={region}
          onRegionChangeComplete={setRegion}
        />
        <View style={styles.selectionTopBar}>
          <IconButton
            icon="arrow-left"
            iconColor={TEXT}
            onPress={cancelSelection}
          />
          <Text variant="titleMedium" style={styles.selectionTitle}>
            {title}
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.centerPin} pointerEvents="none">
          <Ionicons name="location" size={48} color={PRIMARY} />
        </View>
        <View style={styles.bottomSheet}>
          <TextInput
            placeholder="Search address..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            style={styles.searchInput}
          />
          {!GOOGLE_MAPS_API_KEY && (
            <HelperText type="info" visible>
              Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY for search.
            </HelperText>
          )}
          {suggestions.length > 0 && (
            <Card style={styles.suggestionsCard}>
              {suggestions.slice(0, 4).map((s) => (
                <List.Item
                  key={s.id}
                  title={s.description}
                  onPress={() => onSuggestionTap(s)}
                  titleStyle={styles.suggestionTitle}
                />
              ))}
            </Card>
          )}
          <Text variant="bodySmall" style={styles.coordText}>
            {currentDesc}
          </Text>
          <Button mode="contained" onPress={confirmSelection} style={styles.confirmBtn}>
            Confirm
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

            <Pressable onPress={() => enterSelectionMode('pickup')}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color={PRIMARY} />
                <Text variant="bodyLarge" style={styles.locationLabel}>
                  Pickup
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.locationValue}
                  numberOfLines={1}
                >
                  {pickupLocation?.description ?? 'Tap to set'}
                </Text>
              </View>
            </Pressable>

            <Pressable onPress={() => enterSelectionMode('dropoff')}>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={20} color={SUBTEXT} />
                <Text variant="bodyLarge" style={styles.locationLabel}>
                  Dropoff
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.locationValue}
                  numberOfLines={1}
                >
                  {dropoffLocation?.description ?? 'Tap to set'}
                </Text>
              </View>
            </Pressable>

            <Text variant="labelMedium" style={styles.fieldLabel}>
              Departure window
            </Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <TimePickerInput
                  label="Earliest"
                  value={earliestTime}
                  onChange={setEarliestTime}
                  placeholder="Select time"
                  style={styles.inputRow}
                />
              </View>
              <View style={styles.half}>
                <TimePickerInput
                  label="Latest"
                  value={latestTime}
                  onChange={setLatestTime}
                  placeholder="Select time"
                  style={styles.inputRow}
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
              disabled={!isFormValid}
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
  fullScreen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  selectionTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(36, 36, 35, 0.9)',
    paddingTop: 48,
    paddingBottom: 12,
    zIndex: 10,
  },
  selectionTitle: {
    color: TEXT,
  },
  centerPin: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 24,
    top: SCREEN_HEIGHT / 2 - 48,
    zIndex: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: BACKGROUND,
    marginBottom: 8,
  },
  suggestionsCard: {
    backgroundColor: BACKGROUND,
    marginBottom: 8,
    borderRadius: 12,
  },
  suggestionTitle: {
    color: TEXT,
    fontSize: 14,
  },
  coordText: {
    color: SUBTEXT,
    marginBottom: 12,
  },
  confirmBtn: {
    borderRadius: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
  },
  formContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  formTitle: {
    color: TEXT,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: BACKGROUND,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationLabel: {
    color: TEXT,
    marginLeft: 8,
    width: 64,
  },
  locationValue: {
    color: SUBTEXT,
    flex: 1,
  },
  input: {
    backgroundColor: BACKGROUND,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
