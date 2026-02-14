import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/types';

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const BACKGROUND = '#0B1020';

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Smart Carpool Agent
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Multi-agent system that learns to reduce cars, commute time, and emissions.
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Preferences')}
            style={styles.button}
          >
            Set my preferences
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Trip')}
            style={styles.button}
          >
            Request a carpool
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Simulation')}
            style={styles.button}
          >
            View simulation dashboard
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  title: {
    color: '#F0F2F5',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B0B4BC',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#151A30',
    borderRadius: 16,
    marginBottom: 16,
  },
  cardContent: {
    paddingVertical: 8,
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
});
