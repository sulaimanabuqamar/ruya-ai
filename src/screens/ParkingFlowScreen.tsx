import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import MapView from 'react-native-maps';
import {
  Card,
  Text,
  TextInput,
  Button,
  Snackbar,
  List,
  IconButton,
  HelperText,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaceSuggestions, fetchPlaceDetails } from '../api/maps';
import type { PlaceSuggestion, LocationPoint } from '../api/maps';
import { isValidPositiveNumber } from '../utils/validation';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import { TimePickerInput } from '../components/TimePickerInput';
import { parseTime, formatTime } from '../utils/time';

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function mockBookingProbability(
  fromTime: Date | null,
  toTime: Date | null,
  price: string,
  priceValid: boolean
): number | null {
  if (!fromTime || !toTime || !priceValid) {
    return null;
  }
  
  const priceValue = price.trim() === '' ? 0 : Number(price);
  const windowHours = (toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60);
  
  // Simple heuristic: cheaper + longer window => higher probability
  const normalizedPrice = Math.min(priceValue / 20, 1); // 0-1 for 0-20 AED
  let score = 0.7 + windowHours * 0.05 - normalizedPrice * 0.3;
  score = Math.max(0.1, Math.min(score, 0.95));
  
  return Math.round(score * 100);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function ParkingFlowScreen({ route, navigation }: ParkingFlowProps) {
  const { mode } = route.params;
  const [selectionMode, setSelectionMode] = useState<'none' | 'location'>('none');
  const [parkingLocation, setParkingLocation] = useState<LocationPoint | null>(null);
  const [region, setRegion] = useState(initialDubaiRegion);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [fromTime, setFromTime] = useState<Date | null>(parseTime('09:00'));
  const [toTime, setToTime] = useState<Date | null>(parseTime('17:00'));
  const [price, setPrice] = useState('');
  const [priceTouched, setPriceTouched] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const bookingProbability = useMemo(
    () => mockBookingProbability(fromTime, toTime, price, priceValid),
    [fromTime, toTime, price, priceValid]
  );

  const priceValid = price.trim() === '' || isValidPositiveNumber(price, 0);
  const showPriceError = priceTouched && !priceValid;

  const isFormValid =
    parkingLocation != null &&
    fromTime != null &&
    toTime != null &&
    priceValid;

  // Handle keyboard events
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsSearchFocused(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsSearchFocused(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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

  const enterSelectionMode = useCallback(() => {
    setSelectionMode('location');
    setSearchQuery('');
    setSuggestions([]);
    setSelectedLocation(null);
    if (parkingLocation) {
      setRegion({
        latitude: parkingLocation.lat,
        longitude: parkingLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [parkingLocation]);

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
    setParkingLocation(location);
    setSelectionMode('none');
    setSearchQuery('');
    setSuggestions([]);
    setSelectedLocation(null);
  }, [selectedLocation, region]);

  useEffect(() => {
    if (selectionMode !== 'location') return;
    if (debouncedSearch.length < 3 || !GOOGLE_MAPS_API_KEY) {
      // Show popular Dubai places when search is empty
      if (debouncedSearch.length === 0) {
        setSuggestions([
          {
            id: 'dubai-mall',
            description: 'The Dubai Mall Parking, Downtown Dubai',
          },
          {
            id: 'mall-of-emirates',
            description: 'Mall of the Emirates Parking, Al Barsha',
          },
          {
            id: 'dubai-marina-mall',
            description: 'Dubai Marina Mall Parking',
          },
          {
            id: 'ibn-battuta',
            description: 'Ibn Battuta Mall Parking, Jebel Ali',
          },
          {
            id: 'city-walk',
            description: 'City Walk Parking, Al Wasl',
          },
          {
            id: 'deira-city-centre',
            description: 'Deira City Centre Parking',
          },
        ]);
      } else {
        setSuggestions([]);
      }
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
      // Handle fake Dubai parking suggestions with hardcoded coordinates
      const fakePlaces: Record<string, { lat: number; lng: number }> = {
        'dubai-mall': { lat: 25.1975, lng: 55.2796 },
        'mall-of-emirates': { lat: 25.1185, lng: 55.2008 },
        'dubai-marina-mall': { lat: 25.0782, lng: 55.1396 },
        'ibn-battuta': { lat: 25.0443, lng: 55.1173 },
        'city-walk': { lat: 25.2125, lng: 55.2631 },
        'deira-city-centre': { lat: 25.2524, lng: 55.3308 },
      };

      if (fakePlaces[s.id]) {
        const coords = fakePlaces[s.id];
        const location: LocationPoint = {
          lat: coords.lat,
          lng: coords.lng,
          description: s.description,
        };
        setSelectedLocation(location);
        setSuggestions([]);
        setRegion({
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        // Auto-confirm for fake suggestions
        setParkingLocation(location);
        setSelectionMode('none');
        setSearchQuery('');
        setSelectedLocation(null);
      } else {
        // Handle real Google Places API suggestions
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
      }
    },
    []
  );

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    if (isNeed) {
      // Search for parking spots with 2s delay
      setIsSearching(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigation.navigate('AvailableParkingSpots', {
        location: parkingLocation!,
        fromTime: fromTime ? formatTime(fromTime) : '',
        toTime: toTime ? formatTime(toTime) : '',
      });
      
      setIsSearching(false);
    } else {
      // Offer parking spot
      const payload = {
        mode,
        location: parkingLocation,
        availableFrom: fromTime ? formatTime(fromTime) : null,
        availableTo: toTime ? formatTime(toTime) : null,
        priceAED: price.trim() === '' ? null : Number(price.trim()),
        bookingProbability,
      };
      console.log('Parking flow submit', payload);
      setSnackVisible(true);
    }
  };

  const isNeed = mode === 'need';

  if (selectionMode === 'location') {
    const currentDesc =
      selectedLocation?.description ??
      `${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)}`;

    // Calculate bottom sheet height based on content and keyboard
    const baseSheetHeight = 280;
    const suggestionsHeight = suggestions.length > 0 ? Math.min(suggestions.length * 60, 240) : 0;
    const bottomSheetHeight = baseSheetHeight + suggestionsHeight;
    const totalBottomSpace = bottomSheetHeight + keyboardHeight;

    return (
      <View style={styles.fullScreen}>
        <View style={[styles.mapContainer, { marginBottom: totalBottomSpace }]}>
          <MapView
            style={StyleSheet.absoluteFill}
            region={region}
            onRegionChangeComplete={setRegion}
          />
          <View style={styles.centerPin} pointerEvents="none">
            <Ionicons name="location" size={48} color={PRIMARY} />
          </View>
        </View>
        <View style={styles.selectionTopBar}>
          <IconButton
            icon="arrow-left"
            iconColor={TEXT}
            onPress={cancelSelection}
          />
          <Text variant="titleMedium" style={styles.selectionTitle}>
            Select parking location
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.bottomSheet, { maxHeight: SCREEN_HEIGHT * 0.7 }]}>
            <TextInput
              placeholder="Search address..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              style={styles.searchInput}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {!GOOGLE_MAPS_API_KEY && (
              <HelperText type="info" visible>
                Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY for search.
              </HelperText>
            )}
            {suggestions.length > 0 && (
              <ScrollView style={styles.suggestionsScroll} nestedScrollEnabled>
                <Card style={styles.suggestionsCard}>
                  {suggestions.slice(0, 6).map((s) => (
                    <List.Item
                      key={s.id}
                      title={s.description}
                      onPress={() => onSuggestionTap(s)}
                      titleStyle={styles.suggestionTitle}
                    />
                  ))}
                </Card>
              </ScrollView>
            )}
            <Text variant="bodySmall" style={styles.coordText}>
              {currentDesc}
            </Text>
            <Button mode="contained" onPress={confirmSelection} style={styles.confirmBtn}>
              Confirm
            </Button>
          </View>
        </KeyboardAvoidingView>
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
              {isNeed ? 'Find a parking spot' : 'Offer a parking spot'}
            </Text>

            <Pressable onPress={enterSelectionMode}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color={PRIMARY} />
                <Text variant="bodyLarge" style={styles.locationLabel}>
                  Location
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.locationValue}
                  numberOfLines={1}
                >
                  {parkingLocation?.description ?? 'Tap to set'}
                </Text>
              </View>
            </Pressable>

            <Text variant="labelMedium" style={styles.fieldLabel}>
              {isNeed
                ? 'Need spot from – to'
                : 'Spot available from – to'}
            </Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <TimePickerInput
                  label="From"
                  value={fromTime}
                  onChange={setFromTime}
                  placeholder="Select time"
                  style={styles.inputRow}
                />
              </View>
              <View style={styles.half}>
                <TimePickerInput
                  label="To"
                  value={toTime}
                  onChange={setToTime}
                  placeholder="Select time"
                  style={styles.inputRow}
                />
              </View>
            </View>

            <TextInput
              label="Add price (AED) – optional"
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              onBlur={() => setPriceTouched(true)}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
            />
            <HelperText type="error" visible={showPriceError}>
              Enter a positive number or leave empty
            </HelperText>

            <View style={styles.probRow}>
              {bookingProbability !== null ? (
                <>
                  <Text variant="bodyMedium" style={styles.probText}>
                    Expected booking probability: {bookingProbability}%
                  </Text>
                  <Text variant="bodySmall" style={styles.probHint}>
                    AI-generated insight
                  </Text>
                </>
              ) : (
                <Text variant="bodySmall" style={styles.probHint}>
                  Fill details to see booking probability
                </Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!isFormValid || isSearching}
              loading={isSearching}
              style={styles.submitBtn}
              labelStyle={isSearching ? styles.searchingText : undefined}
            >
              {isSearching ? 'Searching...' : (isNeed ? 'Search parking spots' : 'Publish parking spot')}
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
  fullScreen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  keyboardAvoid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    top: '40%',
    zIndex: 5,
  },
  bottomSheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    backgroundColor: BACKGROUND,
    marginBottom: 8,
  },
  suggestionsScroll: {
    maxHeight: 240,
    marginBottom: 8,
  },
  suggestionsCard: {
    backgroundColor: BACKGROUND,
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
    width: 72,
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
  searchingText: {
    color: '#F4F7F5',
  },
  snackbar: {
    backgroundColor: SURFACE,
  },
});
