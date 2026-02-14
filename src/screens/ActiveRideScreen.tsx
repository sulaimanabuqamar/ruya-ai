import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchDirectionsRoute } from '../api/maps';

type ActiveRideProps = NativeStackScreenProps<RootStackParamList, 'ActiveRide'>;

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ActiveRideScreen({ route, navigation }: ActiveRideProps) {
  const { ride, pickupLocation, dropoffLocation } = route.params;
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [region, setRegion] = useState({
    latitude: pickupLocation.lat,
    longitude: pickupLocation.lng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Fetch route from Google Directions API
  useEffect(() => {
    const fetchRoute = async () => {
      const points = await fetchDirectionsRoute(
        { lat: ride.driverLocation.lat, lng: ride.driverLocation.lng },
        { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        [{ lat: pickupLocation.lat, lng: pickupLocation.lng }]
      );

      if (points.length > 0) {
        setRouteCoordinates(points);
      } else {
        // Fallback to straight lines if API fails
        console.warn('Using fallback straight line route');
        setRouteCoordinates([
          { latitude: ride.driverLocation.lat, longitude: ride.driverLocation.lng },
          { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
          { latitude: dropoffLocation.lat, longitude: dropoffLocation.lng },
        ]);
      }
    };

    fetchRoute();
  }, [ride.driverLocation, pickupLocation, dropoffLocation]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && !cancelled) {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fit map to show the entire route
  useEffect(() => {
    if (mapRef.current && routeCoordinates.length > 0) {
      // Small delay to ensure map is ready
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(routeCoordinates, {
          edgePadding: {
            top: 100,
            right: 50,
            bottom: 400, // Extra padding for the bottom card
            left: 50,
          },
          animated: true,
        });
      }, 500);
    }
  }, [routeCoordinates]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {/* Route Polyline - follows roads */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2563EB"
            strokeWidth={6}
            zIndex={1}
          />
        )}

        {/* Driver Location */}
        <Marker
          coordinate={{
            latitude: ride.driverLocation.lat,
            longitude: ride.driverLocation.lng,
          }}
          title="Driver"
          description={`${ride.driverName} - ${ride.vehicleModel}`}
        >
          <View style={styles.driverMarker}>
            <Ionicons name="car" size={24} color={PRIMARY} />
          </View>
        </Marker>

        {/* User Location */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            title="You"
            description="Your current location"
          >
            <View style={styles.userMarker}>
              <Ionicons name="person" size={20} color={TEXT} />
            </View>
          </Marker>
        )}

        {/* Pickup Location */}
        <Marker
          coordinate={{
            latitude: pickupLocation.lat,
            longitude: pickupLocation.lng,
          }}
          title="Pickup"
          description={pickupLocation.description}
          pinColor={SUCCESS}
        />

        {/* Dropoff Location */}
        <Marker
          coordinate={{
            latitude: dropoffLocation.lat,
            longitude: dropoffLocation.lng,
          }}
          title="Dropoff"
          description={dropoffLocation.description}
          pinColor={WARNING}
        />
      </MapView>

      <View style={styles.detailsCard}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <View style={styles.statusSection}>
              <View style={styles.statusIndicator}>
                <View style={styles.pulsingDot} />
              </View>
              <View style={styles.statusText}>
                <Text variant="titleMedium" style={styles.statusTitle}>
                  Driver is on the way
                </Text>
                <Text variant="bodySmall" style={styles.statusSubtitle}>
                  Arriving at pickup in ~5 minutes
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.driverSection}>
              <Text style={styles.driverPhoto}>{ride.driverPhoto}</Text>
              <View style={styles.driverInfo}>
                <Text variant="titleMedium" style={styles.driverName}>
                  {ride.driverName}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={WARNING} />
                  <Text variant="bodySmall" style={styles.rating}>
                    {ride.driverRating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.vehicleSection}>
              <Ionicons name="car-sport" size={20} color={SUBTEXT} />
              <Text variant="bodyMedium" style={styles.vehicleText}>
                {ride.vehicleColor} {ride.vehicleModel}
              </Text>
              <Text variant="bodySmall" style={styles.licensePlate}>
                {ride.licensePlate}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.timeSection}>
              <View style={styles.timeRow}>
                <Ionicons name="time" size={16} color={PRIMARY} />
                <Text variant="bodySmall" style={styles.timeText}>
                  Departure: {ride.departureTime}
                </Text>
              </View>
              <View style={styles.timeRow}>
                <Ionicons name="flag" size={16} color={SUCCESS} />
                <Text variant="bodySmall" style={styles.timeText}>
                  Estimated arrival: {ride.estimatedArrival}
                </Text>
              </View>
            </View>

            <View style={styles.priceSection}>
              <Text variant="bodyMedium" style={styles.priceLabel}>
                Total fare
              </Text>
              <Text variant="headlineSmall" style={styles.price}>
                {ride.price} AED
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  // TODO: Implement call driver
                  console.log('Call driver');
                }}
                style={styles.callButton}
                icon="phone"
              >
                Call
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  // TODO: Implement cancel ride
                  navigation.goBack();
                }}
                style={styles.cancelButton}
                buttonColor="#EF4444"
              >
                Cancel Ride
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    backgroundColor: TEXT,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: PRIMARY,
  },
  userMarker: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: TEXT,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardContent: {
    padding: 20,
    paddingBottom: 32,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    color: TEXT,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    color: SUBTEXT,
    marginTop: 2,
  },
  divider: {
    backgroundColor: BACKGROUND,
    marginVertical: 16,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  driverPhoto: {
    fontSize: 40,
  },
  driverInfo: {
    flex: 1,
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
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
    gap: 8,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: TEXT,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  priceLabel: {
    color: SUBTEXT,
  },
  price: {
    color: PRIMARY,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    borderColor: PRIMARY,
  },
  cancelButton: {
    flex: 1,
  },
});
