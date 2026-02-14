import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Card, Text, Button, Chip, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type RideOfferManagementProps = NativeStackScreenProps<RootStackParamList, 'RideOfferManagement'>;

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';
const SUCCESS = '#10B981';
const DANGER = '#EF4444';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RideRequest {
  id: string;
  riderName: string;
  riderPhoto: string;
  riderRating: number;
  pickupLocation: { lat: number; lng: number; description: string };
  dropoffLocation: { lat: number; lng: number; description: string };
  requestedTime: string;
  price: number;
  detourDistance: number; // km
  detourTime: number; // minutes
  status: 'pending' | 'accepted' | 'rejected';
}

// Mock data generator
function generateMockRequests(routeStart: any, routeEnd: any): RideRequest[] {
  const riders = [
    { name: 'Aisha Mohammed', photo: '👩' },
    { name: 'Zainab Ali', photo: '👩' },
    { name: 'Mariam Hassan', photo: '👩' },
  ];

  return riders.map((rider, index) => ({
    id: `request-${index}`,
    riderName: rider.name,
    riderPhoto: rider.photo,
    riderRating: 4.6 + Math.random() * 0.4,
    pickupLocation: {
      lat: routeStart.lat + (Math.random() - 0.5) * 0.02,
      lng: routeStart.lng + (Math.random() - 0.5) * 0.02,
      description: `Near ${routeStart.description.split(',')[0]}`,
    },
    dropoffLocation: {
      lat: routeEnd.lat + (Math.random() - 0.5) * 0.02,
      lng: routeEnd.lng + (Math.random() - 0.5) * 0.02,
      description: `Near ${routeEnd.description.split(',')[0]}`,
    },
    requestedTime: `08:${15 + index * 5}`,
    price: 10 + index * 3,
    detourDistance: 0.5 + index * 0.3,
    detourTime: 3 + index * 2,
    status: 'pending',
  }));
}

export function RideOfferManagementScreen({ route, navigation }: RideOfferManagementProps) {
  const { routeStart, routeEnd, earliestTime, latestTime, commission } = route.params;
  const [selectedTab, setSelectedTab] = useState('requests');
  const [requests, setRequests] = useState<RideRequest[]>(() => generateMockRequests(routeStart, routeEnd));

  const acceptedRequests = useMemo(() => requests.filter(r => r.status === 'accepted'), [requests]);
  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);

  const handleAccept = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
  };

  const totalEarnings = useMemo(() => {
    return acceptedRequests.reduce((sum, r) => sum + r.price, 0);
  }, [acceptedRequests, commission]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Manage Your Ride Offer
        </Text>
        <View style={styles.earningsBox}>
          <Text variant="bodySmall" style={styles.earningsLabel}>
            Estimated earnings
          </Text>
          <Text variant="titleLarge" style={styles.earningsValue}>
            {totalEarnings} AED
          </Text>
        </View>
      </View>

      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        buttons={[
          {
            value: 'requests',
            label: `Requests (${pendingRequests.length})`,
            icon: 'account-clock',
          },
          {
            value: 'overview',
            label: 'Overview',
            icon: 'map-marker-multiple',
          },
        ]}
        style={styles.tabs}
        theme={{
          colors: {
            secondaryContainer: PRIMARY,
            onSecondaryContainer: TEXT,
          },
        }}
      />

      {selectedTab === 'requests' ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {pendingRequests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="checkmark-circle" size={64} color={SUCCESS} />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  All caught up!
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No pending ride requests at the moment
                </Text>
              </Card.Content>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} style={styles.requestCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  {/* Rider Info */}
                  <View style={styles.riderSection}>
                    <Text style={styles.riderPhoto}>{request.riderPhoto}</Text>
                    <View style={styles.riderInfo}>
                      <Text variant="titleMedium" style={styles.riderName}>
                        {request.riderName}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text variant="bodySmall" style={styles.rating}>
                          {request.riderRating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.priceBox}>
                      <Text variant="titleMedium" style={styles.price}>
                        +{request.price}
                      </Text>
                      <Text variant="bodySmall" style={styles.currency}>
                        AED
                      </Text>
                    </View>
                  </View>

                  {/* Mini Map */}
                  <View style={styles.miniMapContainer}>
                    <MapView
                      style={styles.miniMap}
                      initialRegion={{
                        latitude: (request.pickupLocation.lat + request.dropoffLocation.lat) / 2,
                        longitude: (request.pickupLocation.lng + request.dropoffLocation.lng) / 2,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                    >
                      <Marker
                        coordinate={{
                          latitude: request.pickupLocation.lat,
                          longitude: request.pickupLocation.lng,
                        }}
                        pinColor={SUCCESS}
                      />
                      <Marker
                        coordinate={{
                          latitude: request.dropoffLocation.lat,
                          longitude: request.dropoffLocation.lng,
                        }}
                        pinColor={DANGER}
                      />
                    </MapView>
                  </View>

                  {/* Locations */}
                  <View style={styles.locationsSection}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={16} color={SUCCESS} />
                      <Text variant="bodySmall" style={styles.locationText} numberOfLines={1}>
                        {request.pickupLocation.description}
                      </Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={16} color={DANGER} />
                      <Text variant="bodySmall" style={styles.locationText} numberOfLines={1}>
                        {request.dropoffLocation.description}
                      </Text>
                    </View>
                  </View>

                  {/* Detour Info */}
                  <View style={styles.detourSection}>
                    <Chip
                      icon="clock-outline"
                      style={styles.chip}
                      textStyle={styles.chipText}
                      compact
                    >
                      +{request.detourTime} min
                    </Chip>
                    <Chip
                      icon="map-marker-distance"
                      style={styles.chip}
                      textStyle={styles.chipText}
                      compact
                    >
                      +{request.detourDistance.toFixed(1)} km
                    </Chip>
                    <Chip
                      icon="clock"
                      style={styles.chip}
                      textStyle={styles.chipText}
                      compact
                    >
                      {request.requestedTime}
                    </Chip>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      onPress={() => handleReject(request.id)}
                      style={styles.rejectButton}
                      textColor={DANGER}
                    >
                      Reject
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleAccept(request.id)}
                      style={styles.acceptButton}
                    >
                      Accept
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.overviewContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.bigMap}
            initialRegion={{
              latitude: (routeStart.lat + routeEnd.lat) / 2,
              longitude: (routeStart.lng + routeEnd.lng) / 2,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {/* Route markers */}
            <Marker
              coordinate={{ latitude: routeStart.lat, longitude: routeStart.lng }}
              title="Start"
              description={routeStart.description}
              pinColor={PRIMARY}
            />
            <Marker
              coordinate={{ latitude: routeEnd.lat, longitude: routeEnd.lng }}
              title="End"
              description={routeEnd.description}
              pinColor={PRIMARY}
            />

            {/* Accepted ride markers */}
            {acceptedRequests.map((request) => (
              <React.Fragment key={request.id}>
                <Marker
                  coordinate={{
                    latitude: request.pickupLocation.lat,
                    longitude: request.pickupLocation.lng,
                  }}
                  title={`Pickup: ${request.riderName}`}
                  description={request.pickupLocation.description}
                  pinColor={SUCCESS}
                />
                <Marker
                  coordinate={{
                    latitude: request.dropoffLocation.lat,
                    longitude: request.dropoffLocation.lng,
                  }}
                  title={`Dropoff: ${request.riderName}`}
                  description={request.dropoffLocation.description}
                  pinColor={DANGER}
                />
              </React.Fragment>
            ))}
          </MapView>

          <View style={styles.overviewCard}>
            <Card style={styles.card} mode="elevated">
              <Card.Content style={styles.cardContent}>
                <Text variant="titleMedium" style={styles.overviewTitle}>
                  Ride Summary
                </Text>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Accepted riders
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {acceptedRequests.length}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Departure window
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {earliestTime} - {latestTime}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Total earnings
                  </Text>
                  <Text variant="titleMedium" style={styles.summaryValueHighlight}>
                    {totalEarnings} AED
                  </Text>
                </View>

                {acceptedRequests.length > 0 && (
                  <Button
                    mode="contained"
                    onPress={() => {
                      // TODO: Start ride
                      console.log('Start ride');
                    }}
                    style={styles.startButton}
                  >
                    Start Ride
                  </Button>
                )}
              </Card.Content>
            </Card>
          </View>
        </View>
      )}
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
    marginBottom: 12,
  },
  earningsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    padding: 12,
    borderRadius: 12,
  },
  earningsLabel: {
    color: SUBTEXT,
  },
  earningsValue: {
    color: SUCCESS,
    fontWeight: 'bold',
  },
  tabs: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  emptyCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: SUBTEXT,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  riderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  riderPhoto: {
    fontSize: 40,
    marginRight: 12,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
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
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    color: SUCCESS,
    fontWeight: 'bold',
  },
  currency: {
    color: SUBTEXT,
  },
  miniMapContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  miniMap: {
    flex: 1,
  },
  locationsSection: {
    gap: 8,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    color: TEXT,
    flex: 1,
  },
  detourSection: {
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    borderColor: DANGER,
  },
  acceptButton: {
    flex: 1,
  },
  overviewContainer: {
    flex: 1,
  },
  bigMap: {
    flex: 1,
  },
  overviewCard: {
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
  overviewTitle: {
    color: TEXT,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: SUBTEXT,
  },
  summaryValue: {
    color: TEXT,
  },
  summaryValueHighlight: {
    color: SUCCESS,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});
