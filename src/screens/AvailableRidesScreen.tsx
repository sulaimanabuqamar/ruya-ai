import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Card, Text, Button, Avatar, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type AvailableRidesProps = NativeStackScreenProps<RootStackParamList, 'AvailableRides'>;

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarpoolRide {
  id: string;
  driverName: string;
  driverRating: number;
  driverPhoto?: string;
  vehicleModel: string;
  vehicleColor: string;
  licensePlate: string;
  departureTime: string;
  estimatedArrival: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  pickupDistance: number; // km from requested pickup
  dropoffDistance: number; // km from requested dropoff
  detourTime: number; // minutes added to route
  femaleOnly: boolean;
  verified: boolean;
  routeMatch: number; // 0-100 percentage match
}

// Mock data generator
function generateMockRides(): CarpoolRide[] {
  const drivers = [
    { name: 'Sarah Ahmed', photo: '👩' },
    { name: 'Mohammed Ali', photo: '👨' },
    { name: 'Fatima Hassan', photo: '👩' },
    { name: 'Omar Khalid', photo: '👨' },
    { name: 'Layla Ibrahim', photo: '👩' },
  ];

  const vehicles = [
    { model: 'Toyota Camry', color: 'White' },
    { model: 'Honda Accord', color: 'Silver' },
    { model: 'Nissan Altima', color: 'Black' },
    { model: 'Hyundai Sonata', color: 'Blue' },
    { model: 'Mazda 6', color: 'Red' },
  ];

  return drivers.map((driver, index) => ({
    id: `ride-${index}`,
    driverName: driver.name,
    driverRating: 4.5 + Math.random() * 0.5,
    driverPhoto: driver.photo,
    vehicleModel: vehicles[index].model,
    vehicleColor: vehicles[index].color,
    licensePlate: `DXB ${10000 + index * 1111}`,
    departureTime: `08:${10 + index * 5}`,
    estimatedArrival: `08:${35 + index * 5}`,
    price: 12 + index * 2,
    availableSeats: 1 + (index % 3),
    totalSeats: 4,
    pickupDistance: 0.2 + index * 0.3,
    dropoffDistance: 0.1 + index * 0.2,
    detourTime: 2 + index,
    femaleOnly: index % 3 === 0,
    verified: index % 2 === 0,
    routeMatch: 95 - index * 5,
  }));
}

export function AvailableRidesScreen({ route, navigation }: AvailableRidesProps) {
  const { pickupLocation, dropoffLocation, earliestTime, latestTime } = route.params;
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);

  const rides = useMemo(() => generateMockRides(), []);

  const handleBookRide = async (ride: CarpoolRide) => {
    setBookingRideId(ride.id);
    
    // Artificial 2-second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to active ride screen
    navigation.navigate('ActiveRide', {
      ride: {
        id: ride.id,
        driverName: ride.driverName,
        driverRating: ride.driverRating,
        driverPhoto: ride.driverPhoto,
        vehicleModel: ride.vehicleModel,
        vehicleColor: ride.vehicleColor,
        licensePlate: ride.licensePlate,
        departureTime: ride.departureTime,
        estimatedArrival: ride.estimatedArrival,
        price: ride.price,
        driverLocation: {
          lat: pickupLocation.lat - 0.01,
          lng: pickupLocation.lng + 0.01,
        },
      },
      pickupLocation,
      dropoffLocation,
    });
    
    setBookingRideId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Available Rides
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {rides.length} rides match your route
        </Text>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.routeRow}>
          <Ionicons name="location" size={16} color={PRIMARY} />
          <Text variant="bodySmall" style={styles.routeText} numberOfLines={1}>
            {pickupLocation.description}
          </Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="location-outline" size={16} color={SUBTEXT} />
          <Text variant="bodySmall" style={styles.routeText} numberOfLines={1}>
            {dropoffLocation.description}
          </Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="time-outline" size={16} color={SUBTEXT} />
          <Text variant="bodySmall" style={styles.routeText}>
            {earliestTime} - {latestTime}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rides.map((ride) => (
          <Card key={ride.id} style={styles.rideCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              {/* Driver Info */}
              <View style={styles.driverSection}>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverPhoto}>{ride.driverPhoto}</Text>
                  <View style={styles.driverDetails}>
                    <View style={styles.driverNameRow}>
                      <Text variant="titleMedium" style={styles.driverName}>
                        {ride.driverName}
                      </Text>
                      {ride.verified && (
                        <Ionicons name="checkmark-circle" size={16} color={SUCCESS} />
                      )}
                    </View>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={WARNING} />
                      <Text variant="bodySmall" style={styles.rating}>
                        {ride.driverRating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Vehicle Info */}
              <View style={styles.vehicleSection}>
                <Ionicons name="car-sport" size={20} color={SUBTEXT} />
                <Text variant="bodyMedium" style={styles.vehicleText}>
                  {ride.vehicleColor} {ride.vehicleModel}
                </Text>
                <Text variant="bodySmall" style={styles.licensePlate}>
                  {ride.licensePlate}
                </Text>
              </View>

              {/* Time & Route Info */}
              <View style={styles.timeSection}>
                <View style={styles.timeRow}>
                  <Ionicons name="time" size={16} color={PRIMARY} />
                  <Text variant="bodySmall" style={styles.timeText}>
                    Departs: {ride.departureTime}
                  </Text>
                  <Text variant="bodySmall" style={styles.timeText}>
                    • Arrives: {ride.estimatedArrival}
                  </Text>
                </View>
                <View style={styles.distanceRow}>
                  <Text variant="bodySmall" style={styles.distanceText}>
                    {ride.pickupDistance.toFixed(1)}km to pickup
                  </Text>
                  <Text variant="bodySmall" style={styles.distanceText}>
                    • {ride.dropoffDistance.toFixed(1)}km to dropoff
                  </Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsSection}>
                <Chip
                  icon="account-multiple"
                  style={styles.chip}
                  textStyle={styles.chipText}
                  compact
                >
                  {ride.totalSeats - ride.availableSeats} {ride.totalSeats - ride.availableSeats === 1 ? 'Rider' : 'Riders'}
                </Chip>
                <Chip
                  icon="map-marker-path"
                  style={styles.chip}
                  textStyle={styles.chipText}
                  compact
                >
                  {ride.routeMatch}% match
                </Chip>
                {ride.femaleOnly && (
                  <Chip
                    icon="account-lock"
                    style={[styles.chip, styles.femaleChip]}
                    textStyle={styles.chipText}
                    compact
                  >
                    Female only
                  </Chip>
                )}
              </View>

              {/* Book Button */}
              <Button
                mode="contained"
                onPress={() => handleBookRide(ride)}
                style={styles.bookButton}
                disabled={bookingRideId !== null}
                loading={bookingRideId === ride.id}
                labelStyle={bookingRideId === ride.id ? styles.bookingText : undefined}
              >
                {bookingRideId === ride.id ? 'Booking...' : `Book for ${ride.price} AED`}
              </Button>
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
    paddingBottom: 16,
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
  routeInfo: {
    backgroundColor: SURFACE,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
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
  rideCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  driverSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  driverPhoto: {
    fontSize: 40,
  },
  driverDetails: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
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
  divider: {
    backgroundColor: BACKGROUND,
    marginVertical: 12,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  vehicleText: {
    color: TEXT,
    flex: 1,
  },
  licensePlate: {
    color: SUBTEXT,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeSection: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  timeText: {
    color: TEXT,
  },
  distanceRow: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 22,
  },
  distanceText: {
    color: SUBTEXT,
  },
  tagsSection: {
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
  femaleChip: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  bookButton: {
    borderRadius: 12,
  },
  bookingText: {
    color: '#F4F7F5',
  },
});
