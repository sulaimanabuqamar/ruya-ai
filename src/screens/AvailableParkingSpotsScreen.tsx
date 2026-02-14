import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type AvailableParkingSpotsProps = NativeStackScreenProps<RootStackParamList, 'AvailableParkingSpots'>;

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';
const SUCCESS = '#10B981';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ParkingSpot {
  id: string;
  ownerName: string;
  ownerPhoto: string;
  ownerRating: number;
  location: { lat: number; lng: number; description: string };
  availableFrom: string;
  availableTo: string;
  price: number;
  distance: number; // km from search location
  features: string[];
  verified: boolean;
}

// Mock data generator
function generateMockSpots(searchLocation: any): ParkingSpot[] {
  const owners = [
    { name: 'Ahmed Hassan', photo: '👨' },
    { name: 'Sara Mohammed', photo: '👩' },
    { name: 'Omar Ali', photo: '👨' },
    { name: 'Fatima Ibrahim', photo: '👩' },
  ];

  const featureOptions = [
    ['Covered', 'Security'],
    ['Open', 'CCTV'],
    ['Covered', 'EV Charging'],
    ['Underground', 'Security', '24/7'],
  ];

  return owners.map((owner, index) => ({
    id: `spot-${index}`,
    ownerName: owner.name,
    ownerPhoto: owner.photo,
    ownerRating: 4.5 + Math.random() * 0.5,
    location: {
      lat: searchLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: searchLocation.lng + (Math.random() - 0.5) * 0.01,
      description: `Parking near ${searchLocation.description.split(',')[0]}`,
    },
    availableFrom: `09:${index * 15}`,
    availableTo: `17:${index * 10}`,
    price: 15 + index * 5,
    distance: 0.1 + index * 0.2,
    features: featureOptions[index],
    verified: index % 2 === 0,
  }));
}

export function AvailableParkingSpotsScreen({ route, navigation }: AvailableParkingSpotsProps) {
  const { location, fromTime, toTime } = route.params;
  const [bookingSpotId, setBookingSpotId] = useState<string | null>(null);

  const spots = useMemo(() => generateMockSpots(location), [location]);

  const handleBookSpot = async (spotId: string) => {
    setBookingSpotId(spotId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // TODO: Navigate to booking confirmation or active parking screen
    console.log('Booked spot:', spotId);
    setBookingSpotId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Available Parking Spots
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {spots.length} spots near your location
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {/* Search location marker */}
          <Marker
            coordinate={{
              latitude: location.lat,
              longitude: location.lng,
            }}
            title="Your Search Location"
            description={location.description}
            pinColor={PRIMARY}
          />

          {/* Parking spot markers */}
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.location.lat,
                longitude: spot.location.lng,
              }}
              title={`${spot.price} AED`}
              description={spot.location.description}
              pinColor={SUCCESS}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.searchInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={SUBTEXT} />
          <Text variant="bodySmall" style={styles.infoText}>
            {fromTime} - {toTime}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={SUBTEXT} />
          <Text variant="bodySmall" style={styles.infoText} numberOfLines={1}>
            {location.description}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {spots.map((spot) => (
          <Card key={spot.id} style={styles.spotCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              {/* Owner Info */}
              <View style={styles.ownerSection}>
                <Text style={styles.ownerPhoto}>{spot.ownerPhoto}</Text>
                <View style={styles.ownerInfo}>
                  <View style={styles.ownerNameRow}>
                    <Text variant="titleMedium" style={styles.ownerName}>
                      {spot.ownerName}
                    </Text>
                    {spot.verified && (
                      <Ionicons name="checkmark-circle" size={16} color={SUCCESS} />
                    )}
                  </View>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text variant="bodySmall" style={styles.rating}>
                      {spot.ownerRating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Location */}
              <View style={styles.locationSection}>
                <Ionicons name="location" size={16} color={PRIMARY} />
                <Text variant="bodySmall" style={styles.locationText} numberOfLines={1}>
                  {spot.location.description}
                </Text>
                <Text variant="bodySmall" style={styles.distanceText}>
                  {spot.distance.toFixed(1)} km
                </Text>
              </View>

              {/* Time Window */}
              <View style={styles.timeSection}>
                <Ionicons name="time" size={16} color={SUBTEXT} />
                <Text variant="bodySmall" style={styles.timeText}>
                  Available: {spot.availableFrom} - {spot.availableTo}
                </Text>
              </View>

              {/* Features */}
              <View style={styles.featuresSection}>
                {spot.features.map((feature, index) => (
                  <Chip
                    key={index}
                    style={styles.chip}
                    textStyle={styles.chipText}
                    compact
                  >
                    {feature}
                  </Chip>
                ))}
              </View>

              {/* Price and Book Button */}
              <View style={styles.bottomSection}>
                <View style={styles.priceBox}>
                  <Text variant="headlineSmall" style={styles.price}>
                    {spot.price}
                  </Text>
                  <Text variant="bodySmall" style={styles.currency}>
                    AED
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleBookSpot(spot.id)}
                  style={styles.bookButton}
                  disabled={bookingSpotId !== null}
                  loading={bookingSpotId === spot.id}
                  labelStyle={bookingSpotId === spot.id ? styles.bookingText : undefined}
                >
                  {bookingSpotId === spot.id ? 'Booking...' : 'Book'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: SURFACE,
  },
  headerTitle: {
    color: TEXT,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: SUBTEXT,
    marginTop: 4,
  },
  mapContainer: {
    height: 200,
  },
  map: {
    flex: 1,
  },
  searchInfo: {
    backgroundColor: SURFACE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: SUBTEXT,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  spotCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerPhoto: {
    fontSize: 40,
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerName: {
    color: TEXT,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    color: SUBTEXT,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    color: TEXT,
    flex: 1,
  },
  distanceText: {
    color: SUBTEXT,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeText: {
    color: TEXT,
  },
  featuresSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: BACKGROUND,
  },
  chipText: {
    color: TEXT,
    fontSize: 11,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBox: {
    alignItems: 'flex-start',
  },
  price: {
    color: PRIMARY,
    fontWeight: 'bold',
  },
  currency: {
    color: SUBTEXT,
  },
  bookButton: {
    borderRadius: 12,
  },
  bookingText: {
    color: '#F4F7F5',
  },
});
