/**
 * Unit tests for HistoricalPerformanceStore
 * 
 * Tests edge cases and error handling:
 * - Empty database queries
 * - Data retention (90-day limit)
 * - Database error handling
 */

import { HistoricalPerformanceStore } from '../HistoricalPerformanceStore';
import { RoutePerformance } from '../../types/performance';
import { resetDatabase } from '../../database/connection';

describe('HistoricalPerformanceStore', () => {
  let store: HistoricalPerformanceStore;

  beforeEach(async () => {
    // Reset database before each test
    await resetDatabase();
    store = new HistoricalPerformanceStore();
  });

  describe('recordPerformance', () => {
    it('should persist route performance data', async () => {
      const performance: RoutePerformance = {
        id: 'test-perf-1',
        routeId: 'route-1',
        plannedMetrics: {
          timeMinutes: 30,
          distanceKm: 15,
          reliability: 0.8,
          rawMetrics: {
            timeVariance: 2.5,
            distanceVariance: 0.5,
            measurementCount: 20,
          },
        },
        actualMetrics: {
          actualTimeMinutes: 32,
          actualDistanceKm: 15.2,
          deviationFromPlan: {
            timeDeviationMinutes: 2,
            distanceDeviationKm: 0.2,
          },
        },
        weights: {
          time: 0.4,
          distance: 0.3,
          reliability: 0.3,
        },
        timestamp: new Date('2024-01-15T10:00:00Z'),
        completed: true,
      };

      await store.recordPerformance(performance);

      // Verify by querying
      const results = await store.queryPerformance({});
      expect(results).toHaveLength(1);
      expect(results[0].routeId).toBe('route-1');
      expect(results[0].completed).toBe(true);
    });

    it('should generate ID if not provided', async () => {
      const performance: RoutePerformance = {
        id: '',
        routeId: 'route-2',
        plannedMetrics: {
          timeMinutes: 25,
          distanceKm: 12,
          reliability: 0.7,
          rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
        },
        actualMetrics: {
          actualTimeMinutes: 26,
          actualDistanceKm: 12.1,
          deviationFromPlan: {
            timeDeviationMinutes: 1,
            distanceDeviationKm: 0.1,
          },
        },
        weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
        timestamp: new Date(),
        completed: true,
      };

      await store.recordPerformance(performance);

      const results = await store.queryPerformance({});
      expect(results).toHaveLength(1);
      expect(results[0].id).toBeTruthy();
    });
  });

  describe('queryPerformance', () => {
    beforeEach(async () => {
      // Insert test data
      const performances: RoutePerformance[] = [
        {
          id: 'perf-1',
          routeId: 'route-1',
          plannedMetrics: {
            timeMinutes: 30,
            distanceKm: 15,
            reliability: 0.8,
            rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
          },
          actualMetrics: {
            actualTimeMinutes: 32,
            actualDistanceKm: 15.2,
            deviationFromPlan: { timeDeviationMinutes: 2, distanceDeviationKm: 0.2 },
          },
          weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
          timestamp: new Date('2024-01-10T10:00:00Z'),
          completed: true,
        },
        {
          id: 'perf-2',
          routeId: 'route-2',
          plannedMetrics: {
            timeMinutes: 20,
            distanceKm: 10,
            reliability: 0.7,
            rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
          },
          actualMetrics: {
            actualTimeMinutes: 22,
            actualDistanceKm: 10.5,
            deviationFromPlan: { timeDeviationMinutes: 2, distanceDeviationKm: 0.5 },
          },
          weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
          timestamp: new Date('2024-01-15T10:00:00Z'),
          completed: true,
        },
        {
          id: 'perf-3',
          routeId: 'route-3',
          plannedMetrics: {
            timeMinutes: 40,
            distanceKm: 20,
            reliability: 0.6,
            rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
          },
          actualMetrics: {
            actualTimeMinutes: 0,
            actualDistanceKm: 0,
            deviationFromPlan: { timeDeviationMinutes: 0, distanceDeviationKm: 0 },
          },
          weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
          timestamp: new Date('2024-01-20T10:00:00Z'),
          completed: false,
        },
      ];

      for (const perf of performances) {
        await store.recordPerformance(perf);
      }
    });

    it('should return empty array for empty database', async () => {
      await resetDatabase();
      store = new HistoricalPerformanceStore();
      
      const results = await store.queryPerformance({});
      expect(results).toEqual([]);
    });

    it('should filter by date range', async () => {
      const results = await store.queryPerformance({
        startDate: new Date('2024-01-12T00:00:00Z'),
        endDate: new Date('2024-01-18T00:00:00Z'),
      });

      expect(results).toHaveLength(1);
      expect(results[0].routeId).toBe('route-2');
    });

    it('should filter by completed status', async () => {
      const results = await store.queryPerformance({
        minCompletedRoutes: 1,
      });

      expect(results).toHaveLength(2);
      expect(results.every(r => r.completed)).toBe(true);
    });

    it('should return results in descending timestamp order', async () => {
      const results = await store.queryPerformance({});

      expect(results).toHaveLength(3);
      expect(results[0].routeId).toBe('route-3'); // Most recent
      expect(results[2].routeId).toBe('route-1'); // Oldest
    });
  });

  describe('getPerformanceStats', () => {
    it('should return zero stats for empty database', async () => {
      const stats = await store.getPerformanceStats();

      expect(stats).toEqual({
        totalRoutes: 0,
        completedRoutes: 0,
        averageTimeDeviation: 0,
        averageDistanceDeviation: 0,
      });
    });

    it('should calculate aggregate statistics', async () => {
      // Insert test data
      const performances: RoutePerformance[] = [
        {
          id: 'perf-1',
          routeId: 'route-1',
          plannedMetrics: {
            timeMinutes: 30,
            distanceKm: 15,
            reliability: 0.8,
            rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
          },
          actualMetrics: {
            actualTimeMinutes: 32,
            actualDistanceKm: 15.2,
            deviationFromPlan: { timeDeviationMinutes: 2, distanceDeviationKm: 0.2 },
          },
          weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
          timestamp: new Date(),
          completed: true,
        },
        {
          id: 'perf-2',
          routeId: 'route-2',
          plannedMetrics: {
            timeMinutes: 20,
            distanceKm: 10,
            reliability: 0.7,
            rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
          },
          actualMetrics: {
            actualTimeMinutes: 24,
            actualDistanceKm: 10.6,
            deviationFromPlan: { timeDeviationMinutes: 4, distanceDeviationKm: 0.6 },
          },
          weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
          timestamp: new Date(),
          completed: true,
        },
        {
          id: 'perf-3',
          routeId: 'route-3',
          plannedMetrics: {
            timeMinutes: 40,
            distanceKm: 20,
            reliability: 0.6,
            rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
          },
          actualMetrics: {
            actualTimeMinutes: 0,
            actualDistanceKm: 0,
            deviationFromPlan: { timeDeviationMinutes: 0, distanceDeviationKm: 0 },
          },
          weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
          timestamp: new Date(),
          completed: false,
        },
      ];

      for (const perf of performances) {
        await store.recordPerformance(perf);
      }

      const stats = await store.getPerformanceStats();

      expect(stats.totalRoutes).toBe(3);
      expect(stats.completedRoutes).toBe(2);
      expect(stats.averageTimeDeviation).toBe(3); // (2 + 4) / 2
      expect(stats.averageDistanceDeviation).toBe(0.4); // (0.2 + 0.6) / 2
    });
  });

  describe('cleanupOldData', () => {
    it('should delete data older than 90 days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100); // 100 days ago

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30); // 30 days ago

      // Insert old and recent data
      await store.recordPerformance({
        id: 'old-perf',
        routeId: 'old-route',
        plannedMetrics: {
          timeMinutes: 30,
          distanceKm: 15,
          reliability: 0.8,
          rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
        },
        actualMetrics: {
          actualTimeMinutes: 32,
          actualDistanceKm: 15.2,
          deviationFromPlan: { timeDeviationMinutes: 2, distanceDeviationKm: 0.2 },
        },
        weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
        timestamp: oldDate,
        completed: true,
      });

      await store.recordPerformance({
        id: 'recent-perf',
        routeId: 'recent-route',
        plannedMetrics: {
          timeMinutes: 30,
          distanceKm: 15,
          reliability: 0.8,
          rawMetrics: { timeVariance: 0, distanceVariance: 0, measurementCount: 0 },
        },
        actualMetrics: {
          actualTimeMinutes: 32,
          actualDistanceKm: 15.2,
          deviationFromPlan: { timeDeviationMinutes: 2, distanceDeviationKm: 0.2 },
        },
        weights: { time: 0.4, distance: 0.3, reliability: 0.3 },
        timestamp: recentDate,
        completed: true,
      });

      const deletedCount = await store.cleanupOldData();

      expect(deletedCount).toBe(1);

      const remaining = await store.queryPerformance({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].routeId).toBe('recent-route');
    });

    it('should return 0 when no old data exists', async () => {
      const deletedCount = await store.cleanupOldData();
      expect(deletedCount).toBe(0);
    });
  });
});
