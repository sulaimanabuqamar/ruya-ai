/**
 * Property-based tests for HistoricalPerformanceStore
 * 
 * Feature: agentic-route-optimizer
 * Property 12: Performance data persistence
 * 
 * **Validates: Requirements 4.1, 4.2, 4.6**
 */

import * as fc from 'fast-check';
import { HistoricalPerformanceStore } from '../HistoricalPerformanceStore';
import { RoutePerformance } from '../../types/performance';
import { resetDatabase } from '../../database/connection';

// Custom arbitraries for generating test data
const metricWeightsArbitrary = () => 
  fc.tuple(
    fc.double({ min: 0, max: 1, noNaN: true }),
    fc.double({ min: 0, max: 1, noNaN: true }),
    fc.double({ min: 0, max: 1, noNaN: true })
  ).map(([a, b, c]) => {
    const sum = a + b + c;
    if (sum === 0) {
      return { time: 1/3, distance: 1/3, reliability: 1/3 };
    }
    return {
      time: a / sum,
      distance: b / sum,
      reliability: c / sum,
    };
  });

const routeMetricsArbitrary = () =>
  fc.record({
    timeMinutes: fc.double({ min: 1, max: 180, noNaN: true }),
    distanceKm: fc.double({ min: 0.1, max: 200, noNaN: true }),
    reliability: fc.double({ min: 0, max: 1, noNaN: true }),
    rawMetrics: fc.record({
      timeVariance: fc.double({ min: 0, max: 100, noNaN: true }),
      distanceVariance: fc.double({ min: 0, max: 50, noNaN: true }),
      measurementCount: fc.integer({ min: 0, max: 1000 }),
    }),
  });

const actualMetricsArbitrary = () =>
  fc.record({
    actualTimeMinutes: fc.double({ min: 1, max: 200, noNaN: true }),
    actualDistanceKm: fc.double({ min: 0.1, max: 220, noNaN: true }),
    deviationFromPlan: fc.record({
      timeDeviationMinutes: fc.double({ min: -50, max: 50, noNaN: true }),
      distanceDeviationKm: fc.double({ min: -20, max: 20, noNaN: true }),
    }),
  });

const routePerformanceArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    routeId: fc.uuid(),
    plannedMetrics: routeMetricsArbitrary(),
    actualMetrics: actualMetricsArbitrary(),
    weights: metricWeightsArbitrary(),
    timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
    completed: fc.boolean(),
  });

describe('HistoricalPerformanceStore - Property Tests', () => {
  let store: HistoricalPerformanceStore;

  beforeEach(async () => {
    await resetDatabase();
    store = new HistoricalPerformanceStore();
  });

  /**
   * Property 12: Performance data persistence
   * 
   * For any executed route, when performance is recorded, the stored data should include:
   * - actual time
   * - actual distance
   * - completion status
   * - route characteristics (via routeId)
   * - timestamp
   * - metric weights used
   * 
   * **Validates: Requirements 4.1, 4.2, 4.6**
   */
  it('should persist all required performance data fields for any route', async () => {
    await fc.assert(
      fc.asyncProperty(
        routePerformanceArbitrary(),
        async (performance: RoutePerformance) => {
          // Record the performance
          await store.recordPerformance(performance);

          // Query back the data
          const results = await store.queryPerformance({});

          // Should have exactly one result
          expect(results.length).toBeGreaterThan(0);

          // Find the matching record
          const stored = results.find(r => r.routeId === performance.routeId);
          expect(stored).toBeDefined();

          if (!stored) return;

          // Requirement 4.1: Verify actual time and distance are stored
          expect(stored.actualMetrics.actualTimeMinutes).toBeCloseTo(
            performance.actualMetrics.actualTimeMinutes,
            5
          );
          expect(stored.actualMetrics.actualDistanceKm).toBeCloseTo(
            performance.actualMetrics.actualDistanceKm,
            5
          );

          // Requirement 4.1: Verify completion status is stored
          expect(stored.completed).toBe(performance.completed);

          // Requirement 4.2: Verify route characteristics (routeId) and timestamp are stored
          expect(stored.routeId).toBe(performance.routeId);
          expect(stored.timestamp.getTime()).toBe(performance.timestamp.getTime());

          // Requirement 4.6: Verify metric weights are stored
          expect(stored.weights.time).toBeCloseTo(performance.weights.time, 5);
          expect(stored.weights.distance).toBeCloseTo(performance.weights.distance, 5);
          expect(stored.weights.reliability).toBeCloseTo(performance.weights.reliability, 5);

          // Verify planned metrics are also stored
          expect(stored.plannedMetrics.timeMinutes).toBeCloseTo(
            performance.plannedMetrics.timeMinutes,
            5
          );
          expect(stored.plannedMetrics.distanceKm).toBeCloseTo(
            performance.plannedMetrics.distanceKm,
            5
          );
          expect(stored.plannedMetrics.reliability).toBeCloseTo(
            performance.plannedMetrics.reliability,
            5
          );

          // Verify deviation metrics are stored
          expect(stored.actualMetrics.deviationFromPlan.timeDeviationMinutes).toBeCloseTo(
            performance.actualMetrics.deviationFromPlan.timeDeviationMinutes,
            5
          );
          expect(stored.actualMetrics.deviationFromPlan.distanceDeviationKm).toBeCloseTo(
            performance.actualMetrics.deviationFromPlan.distanceDeviationKm,
            5
          );
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for property test

  /**
   * Additional property: Multiple performances can be stored and retrieved
   */
  it('should persist multiple performance records independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(routePerformanceArbitrary(), { minLength: 2, maxLength: 10 }),
        async (performances: RoutePerformance[]) => {
          // Ensure unique IDs and routeIds to avoid constraint violations
          const uniquePerformances = performances.map((perf, index) => ({
            ...perf,
            id: `${perf.id}-${index}`,
            routeId: `${perf.routeId}-${index}`,
          }));

          // Record all performances
          for (const perf of uniquePerformances) {
            await store.recordPerformance(perf);
          }

          // Query all data
          const results = await store.queryPerformance({});

          // Should have at least as many results as we inserted
          expect(results.length).toBeGreaterThanOrEqual(uniquePerformances.length);

          // Verify each performance was stored correctly
          for (const original of uniquePerformances) {
            const stored = results.find(r => r.routeId === original.routeId);
            expect(stored).toBeDefined();

            if (!stored) continue;

            // Verify key fields
            expect(stored.completed).toBe(original.completed);
            expect(stored.routeId).toBe(original.routeId);
            expect(stored.weights.time).toBeCloseTo(original.weights.time, 5);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Additional property: ID generation when not provided
   */
  it('should generate ID when not provided in performance data', async () => {
    await fc.assert(
      fc.asyncProperty(
        routePerformanceArbitrary(),
        async (performance: RoutePerformance) => {
          // Remove the ID
          const perfWithoutId = { ...performance, id: '' };

          // Record the performance
          await store.recordPerformance(perfWithoutId);

          // Query back the data
          const results = await store.queryPerformance({});

          // Find the matching record
          const stored = results.find(r => r.routeId === performance.routeId);
          expect(stored).toBeDefined();

          if (!stored) return;

          // Should have a generated ID
          expect(stored.id).toBeTruthy();
          expect(stored.id.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property 13: Historical data retrieval
   * 
   * For any route characteristics query, the Historical_Performance_Store should return
   * all performance records matching those characteristics.
   * 
   * **Validates: Requirements 4.3**
   */
  it('should retrieve all performance records matching query characteristics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(routePerformanceArbitrary(), { minLength: 5, maxLength: 20 }),
        fc.date({ min: new Date('2023-01-01'), max: new Date('2024-01-01') }),
        fc.date({ min: new Date('2024-01-02'), max: new Date('2024-12-31') }),
        async (performances: RoutePerformance[], startDate: Date, endDate: Date) => {
          const testId = Date.now();
          
          // Ensure unique IDs and routeIds
          const uniquePerformances = performances.map((perf, index) => ({
            ...perf,
            id: `test-${testId}-${index}`,
            routeId: `route-${testId}-${index}`,
          }));

          // Split performances into two groups: before and after the date range
          const beforeStart = uniquePerformances.slice(0, Math.floor(uniquePerformances.length / 3));
          const inRange = uniquePerformances.slice(
            Math.floor(uniquePerformances.length / 3),
            Math.floor(2 * uniquePerformances.length / 3)
          );
          const afterEnd = uniquePerformances.slice(Math.floor(2 * uniquePerformances.length / 3));

          // Set timestamps for each group
          beforeStart.forEach(perf => {
            perf.timestamp = new Date(startDate.getTime() - 1000 * 60 * 60 * 24); // 1 day before
          });
          inRange.forEach(perf => {
            perf.timestamp = new Date(
              startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
            );
          });
          afterEnd.forEach(perf => {
            perf.timestamp = new Date(endDate.getTime() + 1000 * 60 * 60 * 24); // 1 day after
          });

          // Record all performances
          for (const perf of uniquePerformances) {
            await store.recordPerformance(perf);
          }

          // Query with date range
          const results = await store.queryPerformance({
            startDate,
            endDate,
          });

          // All results should be within the date range
          for (const result of results) {
            expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
            expect(result.timestamp.getTime()).toBeLessThanOrEqual(endDate.getTime());
          }

          // All performances in the range should be in the results
          for (const perf of inRange) {
            const found = results.find(r => r.routeId === perf.routeId);
            expect(found).toBeDefined();
          }

          // Performances outside the range should not be in the results
          for (const perf of beforeStart) {
            const found = results.find(r => r.routeId === perf.routeId);
            expect(found).toBeUndefined();
          }
          for (const perf of afterEnd) {
            const found = results.find(r => r.routeId === perf.routeId);
            expect(found).toBeUndefined();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property 13 (continued): Query by completion status
   */
  it('should retrieve only completed routes when minCompletedRoutes is specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(routePerformanceArbitrary(), { minLength: 5, maxLength: 15 }),
        async (performances: RoutePerformance[]) => {
          const testId = Date.now();
          
          // Ensure unique IDs and routeIds, and valid timestamps
          const uniquePerformances = performances.map((perf, index) => ({
            ...perf,
            id: `test-completed-${testId}-${index}`,
            routeId: `route-completed-${testId}-${index}`,
            timestamp: new Date(Date.now() + index * 1000), // Ensure valid timestamps
          }));

          // Set some as completed and some as not completed
          uniquePerformances.forEach((perf, index) => {
            perf.completed = index % 2 === 0; // Every other one is completed
          });

          // Record all performances
          for (const perf of uniquePerformances) {
            await store.recordPerformance(perf);
          }

          // Query for completed routes only
          const results = await store.queryPerformance({
            minCompletedRoutes: 1,
          });

          // All results should be completed
          for (const result of results) {
            expect(result.completed).toBe(true);
          }

          // All completed performances should be in the results
          const completedPerfs = uniquePerformances.filter(p => p.completed);
          for (const perf of completedPerfs) {
            const found = results.find(r => r.routeId === perf.routeId);
            expect(found).toBeDefined();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property 13 (continued): Empty query returns all records
   */
  it('should return all records when query is empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(routePerformanceArbitrary(), { minLength: 3, maxLength: 10 }),
        async (performances: RoutePerformance[]) => {
          const testId = Date.now();
          
          // Ensure unique IDs and routeIds, and valid timestamps
          const uniquePerformances = performances.map((perf, index) => ({
            ...perf,
            id: `test-all-${testId}-${index}`,
            routeId: `route-all-${testId}-${index}`,
            timestamp: new Date(Date.now() + index * 1000), // Ensure valid timestamps
          }));

          // Record all performances
          for (const perf of uniquePerformances) {
            await store.recordPerformance(perf);
          }

          // Query with empty parameters
          const results = await store.queryPerformance({});

          // Should have at least as many results as we inserted
          expect(results.length).toBeGreaterThanOrEqual(uniquePerformances.length);

          // All our performances should be in the results
          for (const perf of uniquePerformances) {
            const found = results.find(r => r.routeId === perf.routeId);
            expect(found).toBeDefined();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});
