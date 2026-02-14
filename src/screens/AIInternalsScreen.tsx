import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 220;

const iterations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const totalCars = [100, 95, 90, 85, 80, 76, 72, 69, 66, 63];
const avgCommute = [42, 40, 38, 37, 35, 34, 33, 32, 31.5, 31];
const emissions = totalCars.map((c) => c * 4.5);
const matchSuccessRate = [0.6, 0.64, 0.68, 0.72, 0.75, 0.78, 0.8, 0.82, 0.83, 0.85];

const chartConfig = {
  backgroundColor: SURFACE,
  backgroundGradientFrom: SURFACE,
  backgroundGradientTo: SURFACE,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: () => SUBTEXT,
  style: { borderRadius: 16, paddingRight: 16 },
  propsForLabels: { fontSize: 10 },
};

const chartConfigSecondary = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(244, 247, 245, ${opacity})`,
};

const BULLETS = [
  'Rider Agents with preferences & flexibility.',
  'Matching Agent grouping by route/time.',
  'Traffic Simulation Agent penalizing more cars.',
  'Critic Agent evaluating KPIs.',
  'Strategy Optimizer adjusting heuristics.',
];

export function AIInternalsScreen() {
  const totalCarsData = {
    labels: iterations.map(String),
    datasets: [{ data: totalCars }],
  };
  const avgCommuteData = {
    labels: iterations.map(String),
    datasets: [{ data: avgCommute }],
  };
  const emissionsData = {
    labels: iterations.map(String),
    datasets: [{ data: emissions }],
  };
  const matchRateData = {
    labels: iterations.map(String),
    datasets: [{ data: matchSuccessRate.map((x) => x * 100) }],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Multi-agent system
        </Text>
        <Card style={styles.bulletCard} mode="elevated">
          <Card.Content style={styles.bulletContent}>
            {BULLETS.map((line, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text variant="bodyMedium" style={styles.bulletText}>
                  {line}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={styles.metricsRow}>
          <Card style={styles.metricCard} mode="elevated">
            <Card.Content>
              <Text variant="labelMedium" style={styles.metricLabel}>
                Cars ↓
              </Text>
              <Text variant="headlineSmall" style={styles.metricValue}>
                100 → 63
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.metricCard} mode="elevated">
            <Card.Content>
              <Text variant="labelMedium" style={styles.metricLabel}>
                Commute ↓
              </Text>
              <Text variant="headlineSmall" style={styles.metricValue}>
                42 → 31 min
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.chartCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Total cars per day
            </Text>
            <LineChart
              data={totalCarsData}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Average commute time (min)
            </Text>
            <LineChart
              data={avgCommuteData}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              chartConfig={chartConfigSecondary}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              CO₂ emissions estimate (kg)
            </Text>
            <LineChart
              data={emissionsData}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Match success rate (%)
            </Text>
            <LineChart
              data={matchRateData}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              chartConfig={chartConfigSecondary}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: TEXT,
    marginBottom: 12,
  },
  bulletCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    marginBottom: 24,
  },
  bulletContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    color: PRIMARY,
    marginRight: 8,
    fontSize: 16,
  },
  bulletText: {
    color: TEXT,
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 16,
  },
  metricLabel: {
    color: SUBTEXT,
  },
  metricValue: {
    color: TEXT,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  chartTitle: {
    color: TEXT,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    marginLeft: -16,
  },
});
