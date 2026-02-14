/**
 * Integration test for HistoricalPerformanceStore
 * 
 * Verifies that the store correctly implements requirements:
 * - 4.1: Record actual time, distance, and completion status
 * - 4.2: Associate with route characteristics and timestamp
 * - 4.3: Retrieve historical performance data
 * - 4.4: Return results within 1 second
 * - 4.6: Include metric weights used for the route
 */

import { HistoricalPerformanceStore } from '../HistoricalPerformanceStore';
import { RoutePerformance } from '../../types/performance';
import { resetDatabase } from '../../database/connection';

describe('HistoricalPerformanceStore Integration', () => {
  let store: HistoricalPerformanceStore;

  beforeAll(async () => {
    await resetDatabase();
    store = new HistoricalPerformanceStore();
  });

  it('should complete full lifecycle: record, query, and get stats', async () => {
    // Record performance (Requirement 4.1, 4.2, 4.6)
    const performance: RoutePerformance = {
      id: 'integration-test-1',
      routeId: 'route-integration-1',
      plannedMetrics: {
        timeMinutes: 35,
        distanceKm: 18,
        reliability: 0.85,
        rawMetrics: {
          timeVariance: 3.2,
          distanceVariance: 0.8,
          measurementCount: 25,
        },
      },
      actualMetrics: {
        actualTimeMinutes: 37,
        actualDistanceKm: 18.5,
        deviationFromPlan: {
          timeDeviationMinutes: 2,
          distanceDeviationKm: 0.5,
        },
      },
      weights: {
        time: 0.5,
        distance: 0.3,
        reliability: 0.2,
      },
      timestamp: new Date('2024-01-20T14:30:00Z'),
      completed: true,
    };

    await store.recordPerformance(performance);

    // Query performance (Requirement 4.3)
    const startTime = Date.now();
    const results = await store.queryPerformance({
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-12-31T23:59:59Z'),
    });
    const queryTime = Date.now() - startTime;

    // Verify query time (Requirement 4.4: within 1 second)
    expect(queryTime).toBeLessThan(1000);

    // Verify data integrity
    expect(results).toHaveLength(1);
    const retrieved = results[0];

    // Verify all required fields are present
    expect(retrieved.id).toBe('integration-test-1');
    expect(retrieved.routeId).toBe('route-integration-1');
    
    // Verify planned metrics
    expect(retrieved.plannedMetrics.timeMinutes).toBe(35);
    expect(retrieved.plannedMetrics.distanceKm).toBe(18);
    expect(retrieved.plannedMetrics.reliability).toBe(0.85);

    // Verify actual metrics (Requirement 4.1)
    expect(retrieved.actualMetrics.actualTimeMinutes).toBe(37);
    expect(retrieved.actualMetrics.actualDistanceKm).toBe(18.5);
    expect(retrieved.actualMetrics.deviationFromPlan.timeDeviationMinutes).toBe(2);
    expect(retrieved.actualMetrics.deviationFromPlan.distanceDeviationKm).toBe(0.5);

    // Verify weights (Requirement 4.6)
    expect(retrieved.weights.time).toBe(0.5);
    expect(retrieved.weights.distance).toBe(0.3);
    expect(retrieved.weights.reliability).toBe(0.2);

    // Verify timestamp (Requirement 4.2)
    expect(retrieved.timestamp.toISOString()).toBe('2024-01-20T14:30:00.000Z');

    // Verify completion status (Requirement 4.1)
    expect(retrieved.completed).toBe(true);

    // Get stats
    const stats = await store.getPerformanceStats();
    expect(stats.totalRoutes).toBe(1);
    expect(stats.completedRoutes).toBe(1);
    expect(stats.averageTimeDeviation).toBe(2);
    expect(stats.averageDistanceDeviation).toBe(0.5);
  });

  it('should handle multiple routes with different characteristics', async () => {
    await resetDatabase();
    store = new HistoricalPerformanceStore();

    // Record multiple performances
    const performances: RoutePerformance[] = [
      {
        id: 'multi-1',
        routeId: 'route-morning',
        plannedMetrics: {
          timeMinutes: 25,
          distanceKm: 12,
          reliability: 0.7,
          rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
        },
        actualMetrics: {
          actualTimeMinutes: 27,
          actualDistanceKm: 12.3,
          deviationFromPlan: { timeDeviationMinutes: 2, distanceDeviationKm: 0.3 },
        },
        weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
        timestamp: new Date('2024-01-15T08:00:00Z'),
        completed: true,
      },
      {
        id: 'multi-2',
        routeId: 'route-evening',
        plannedMetrics: {
          timeMinutes: 30,
          distanceKm: 15,
          reliability: 0.6,
          rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
        },
        actualMetrics: {
          actualTimeMinutes: 35,
          actualDistanceKm: 15.8,
          deviationFromPlan: { timeDeviationMinutes: 5, distanceDeviationKm: 0.8 },
        },
        weights: { time: 0.5, distance: 0.25, reliability: 0.25 },
        timestamp: new Date('2024-01-15T18:00:00Z'),
        completed: true,
      },
      {
        id: 'multi-3',
        routeId: 'route-incomplete',
        plannedMetrics: {
          timeMinutes: 20,
          distanceKm: 10,
          reliability: 0.8,
          rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
        },
        actualMetrics: {
          actualTimeMinutes: 0,
          actualDistanceKm: 0,
          deviationFromPlan: { timeDeviationMinutes: 0, distanceDeviationKm: 0 },
        },
        weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
        timestamp: new Date('2024-01-16T12:00:00Z'),
        completed: false,
      },
    ];

    for (const perf of performances) {
      await store.recordPerformance(perf);
    }

    // Query all
    const allResults = await store.queryPerformance({});
    expect(allResults).toHaveLength(3);

    // Query only completed
    const completedResults = await store.queryPerformance({
      minCompletedRoutes: 1,
    });
    expect(completedResults).toHaveLength(2);
    expect(completedResults.every(r => r.completed)).toBe(true);

    // Verify stats
    const stats = await store.getPerformanceStats();
    expect(stats.totalRoutes).toBe(3);
    expect(stats.completedRoutes).toBe(2);
    expect(stats.averageTimeDeviation).toBeCloseTo(3.5, 1); // (2 + 5) / 2
    expect(stats.averageDistanceDeviation).toBeCloseTo(0.55, 2); // (0.3 + 0.8) / 2
  });
});
