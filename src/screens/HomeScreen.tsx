import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, TabParamList } from '../navigation/types';

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: HomeNavProp;
};

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';

export function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Merge
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Offer or find rides and parking, powered by AI.
        </Text>
        <View style={styles.pill}>
          <Text variant="labelSmall" style={styles.pillText}>
            Dubai · Live
          </Text>
        </View>
      </View>

      <Card style={styles.sectionCard} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <Text variant="titleLarge" style={styles.sectionLabel}>
            Book
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDesc}>
            Book a ride or parking spot.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('RideFlow', { mode: 'need' })}
            style={styles.primaryBtn}
          >
            Book Ride
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ParkingFlow', { mode: 'need' })}
            style={styles.outlinedBtn}
          >
            Book Parking Spot
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <Text variant="titleLarge" style={styles.sectionLabel}>
            Offer
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDesc}>
            Share your ride or rent out your parking space.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('RideFlow', { mode: 'offer' })}
            style={styles.primaryBtn}
          >
            Offer Ride
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ParkingFlow', { mode: 'offer' })}
            style={styles.outlinedBtn}
          >
            Offer Parking Space
          </Button>
        </Card.Content>
      </Card>

      <Pressable
        style={styles.aiLink}
        onPress={() => navigation.navigate('AIInternals')}
      >
        <Text variant="bodySmall" style={styles.aiLinkText}>
          See AI internals & performance →
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: TEXT,
    marginBottom: 4,
  },
  subtitle: {
    color: SUBTEXT,
    marginBottom: 12,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: SURFACE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: SUBTEXT,
  },
  sectionCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    marginBottom: 20,
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    color: TEXT,
    marginBottom: 8,
  },
  sectionDesc: {
    color: SUBTEXT,
    marginBottom: 20,
  },
  primaryBtn: {
    marginBottom: 12,
    borderRadius: 16,
  },
  outlinedBtn: {
    borderRadius: 16,
  },
  aiLink: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  aiLinkText: {
    color: PRIMARY,
    textDecorationLine: 'underline',
  },
});
