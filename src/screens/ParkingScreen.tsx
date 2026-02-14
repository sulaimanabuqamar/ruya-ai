import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Card, Text, SegmentedButtons, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';

interface ParkingReservation {
  id: string;
  type: 'reserved' | 'offered';
  location: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  price: number;
  status: 'active' | 'upcoming' | 'completed';
  ownerOrRenterName?: string;
}

// Mock data
const mockReservations: ParkingReservation[] = [
  {
    id: '1',
    type: 'reserved',
    location: 'The Dubai Mall Parking',
    date: 'Today',
    timeFrom: '09:00',
    timeTo: '17:00',
    price: 20,
    status: 'active',
    ownerOrRenterName: 'Ahmed Hassan',
  },
  {
    id: '2',
    type: 'offered',
    location: 'Marina Plaza, Dubai Marina',
    date: 'Tomorrow',
    timeFrom: '08:00',
    timeTo: '18:00',
    price: 25,
    status: 'upcoming',
    ownerOrRenterName: 'Sara Mohammed',
  },
  {
    id: '3',
    type: 'reserved',
    location: 'Mall of the Emirates Parking',
    date: 'Yesterday',
    timeFrom: '10:00',
    timeTo: '16:00',
    price: 18,
    status: 'completed',
    ownerOrRenterName: 'Omar Ali',
  },
];

export function ParkingScreen() {
  const [selectedTab, setSelectedTab] = useState('all');

  const filteredReservations = mockReservations.filter(r => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'reserved') return r.type === 'reserved';
    if (selectedTab === 'offered') return r.type === 'offered';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return SUCCESS;
      case 'upcoming':
        return WARNING;
      case 'completed':
        return SUBTEXT;
      default:
        return SUBTEXT;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          My Parking
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Manage your parking reservations and offers
        </Text>
      </View>

      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        buttons={[
          {
            value: 'all',
            label: 'All',
          },
          {
            value: 'reserved',
            label: 'Reserved',
          },
          {
            value: 'offered',
            label: 'Offered',
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredReservations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="car-outline" size={64} color={SUBTEXT} />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No parking spots yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Book a spot or offer your parking space
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredReservations.map((reservation) => (
            <Card key={reservation.id} style={styles.reservationCard} mode="elevated">
              <Card.Content style={styles.cardContent}>
                {/* Header with type and status */}
                <View style={styles.cardHeader}>
                  <Chip
                    icon={reservation.type === 'reserved' ? 'car' : 'key'}
                    style={[
                      styles.typeChip,
                      reservation.type === 'reserved' ? styles.reservedChip : styles.offeredChip,
                    ]}
                    textStyle={styles.typeChipText}
                    compact
                  >
                    {reservation.type === 'reserved' ? 'Reserved' : 'Offered'}
                  </Chip>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: `${getStatusColor(reservation.status)}20` }]}
                    textStyle={[styles.statusChipText, { color: getStatusColor(reservation.status) }]}
                    compact
                  >
                    {getStatusLabel(reservation.status)}
                  </Chip>
                </View>

                {/* Location */}
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={20} color={PRIMARY} />
                  <Text variant="titleMedium" style={styles.locationText}>
                    {reservation.location}
                  </Text>
                </View>

                {/* Date and Time */}
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color={SUBTEXT} />
                  <Text variant="bodySmall" style={styles.infoText}>
                    {reservation.date}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color={SUBTEXT} />
                  <Text variant="bodySmall" style={styles.infoText}>
                    {reservation.timeFrom} - {reservation.timeTo}
                  </Text>
                </View>

                {/* Owner/Renter */}
                {reservation.ownerOrRenterName && (
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color={SUBTEXT} />
                    <Text variant="bodySmall" style={styles.infoText}>
                      {reservation.type === 'reserved' ? 'Owner: ' : 'Renter: '}
                      {reservation.ownerOrRenterName}
                    </Text>
                  </View>
                )}

                {/* Price */}
                <View style={styles.priceRow}>
                  <Text variant="bodyMedium" style={styles.priceLabel}>
                    Price
                  </Text>
                  <Text variant="titleMedium" style={styles.price}>
                    {reservation.price} AED
                  </Text>
                </View>

                {/* Actions */}
                {reservation.status === 'active' && (
                  <Button
                    mode="outlined"
                    onPress={() => console.log('View details:', reservation.id)}
                    style={styles.actionButton}
                  >
                    View Details
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))
        )}
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
    paddingTop: 60,
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
  reservationCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeChip: {
    backgroundColor: BACKGROUND,
  },
  reservedChip: {
    backgroundColor: `${PRIMARY}20`,
  },
  offeredChip: {
    backgroundColor: `${SUCCESS}20`,
  },
  typeChipText: {
    color: TEXT,
    fontSize: 11,
  },
  statusChip: {
    backgroundColor: BACKGROUND,
  },
  statusChipText: {
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    color: TEXT,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    color: SUBTEXT,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND,
  },
  priceLabel: {
    color: SUBTEXT,
  },
  price: {
    color: PRIMARY,
    fontWeight: 'bold',
  },
  actionButton: {
    borderRadius: 12,
    borderColor: PRIMARY,
  },
});
