/**
 * Historical Performance Store
 * 
 * Manages persistence and retrieval of route performance data using SQLite.
 * Implements requirements 4.1, 4.2, 4.3, 4.6
 */

import { SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection';
import { 
  RoutePerformance, 
  PerformanceQuery, 
  PerformanceStats 
} from '../types/performance';
import { DATA_RETENTION } from '../config/constants';

export class HistoricalPerformanceStore {
  private db: SQLiteDatabase | null = null;

  /**
   * Initialize the store and get database connection
   */
  private async getDb(): Promise<SQLiteDatabase> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  /**
   * Record route performance data
   * Requirement 4.1: Record actual time, distance, and completion status
   * Requirement 4.2: Associate with route characteristics and timestamp
   * Requirement 4.6: Include metric weights used for the route
   */
  async recordPerformance(performance: RoutePerformance): Promise<void> {
    try {
      const db = await this.getDb();
      
      const id = performance.id || uuidv4();
      const timestamp = performance.timestamp.getTime();
      const createdAt = Date.now();

      await db.runAsync(
        `INSERT INTO route_performances (
          id, route_id, 
          planned_time_minutes, planned_distance_km, planned_reliability,
          actual_time_minutes, actual_distance_km,
          time_deviation_minutes, distance_deviation_km,
          weight_time, weight_distance, weight_reliability,
          timestamp, completed, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          performance.routeId,
          performance.plannedMetrics.timeMinutes,
          performance.plannedMetrics.distanceKm,
          performance.plannedMetrics.reliability,
          performance.actualMetrics.actualTimeMinutes,
          performance.actualMetrics.actualDistanceKm,
          performance.actualMetrics.deviationFromPlan.timeDeviationMinutes,
          performance.actualMetrics.deviationFromPlan.distanceDeviationKm,
          performance.weights.time,
          performance.weights.distance,
          performance.weights.reliability,
          timestamp,
          performance.completed ? 1 : 0,
          createdAt,
        ]
      );

      console.log(`Recorded performance for route ${performance.routeId}`);
    } catch (error) {
      console.error('Failed to record performance:', error);
      throw new Error(`DatabaseWriteError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query historical performance data
   * Requirement 4.3: Retrieve historical performance data for routes with similar characteristics
   * Requirement 4.4: Return results within 1 second
   */
  async queryPerformance(query: PerformanceQuery): Promise<RoutePerformance[]> {
    try {
      const db = await this.getDb();
      
      // Build WHERE clause based on query parameters
      const conditions: string[] = [];
      const params: any[] = [];

      if (query.startDate) {
        conditions.push('timestamp >= ?');
        params.push(query.startDate.getTime());
      }

      if (query.endDate) {
        conditions.push('timestamp <= ?');
        params.push(query.endDate.getTime());
      }

      if (query.minCompletedRoutes !== undefined) {
        conditions.push('completed = 1');
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      const sql = `
        SELECT * FROM route_performances 
        ${whereClause}
        ORDER BY timestamp DESC
      `;

      const rows = await db.getAllAsync(sql, params);
      
      return rows.map(this.mapRowToPerformance);
    } catch (error) {
      console.error('Failed to query performance:', error);
      throw new Error(`DatabaseReadError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get aggregate performance statistics
   * Requirement 4.1: Provide statistics for analysis
   */
  async getPerformanceStats(): Promise<PerformanceStats> {
    try {
      const db = await this.getDb();
      
      const result = await db.getFirstAsync<{
        total_routes: number;
        completed_routes: number;
        avg_time_deviation: number | null;
        avg_distance_deviation: number | null;
      }>(`
        SELECT 
          COUNT(*) as total_routes,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_routes,
          AVG(CASE WHEN completed = 1 THEN ABS(time_deviation_minutes) ELSE NULL END) as avg_time_deviation,
          AVG(CASE WHEN completed = 1 THEN ABS(distance_deviation_km) ELSE NULL END) as avg_distance_deviation
        FROM route_performances
      `);

      if (!result) {
        return {
          totalRoutes: 0,
          completedRoutes: 0,
          averageTimeDeviation: 0,
          averageDistanceDeviation: 0,
        };
      }

      return {
        totalRoutes: result.total_routes || 0,
        completedRoutes: result.completed_routes || 0,
        averageTimeDeviation: result.avg_time_deviation || 0,
        averageDistanceDeviation: result.avg_distance_deviation || 0,
      };
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      throw new Error(`DatabaseReadError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up old performance data
   * Requirement 4.5: Retain performance data for at least 90 days
   */
  async cleanupOldData(): Promise<number> {
    try {
      const db = await this.getDb();
      
      const cutoffDate = Date.now() - (DATA_RETENTION.performanceDataDays * 24 * 60 * 60 * 1000);
      
      const result = await db.runAsync(
        'DELETE FROM route_performances WHERE created_at < ?',
        [cutoffDate]
      );

      const deletedCount = result.changes || 0;
      
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old performance records`);
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      throw new Error(`DatabaseWriteError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map database row to RoutePerformance object
   */
  private mapRowToPerformance(row: any): RoutePerformance {
    return {
      id: row.id,
      routeId: row.route_id,
      plannedMetrics: {
        timeMinutes: row.planned_time_minutes,
        distanceKm: row.planned_distance_km,
        reliability: row.planned_reliability,
        rawMetrics: {
          timeVariance: 0, // Not stored in DB
          distanceVariance: 0, // Not stored in DB
          measurementCount: 0, // Not stored in DB
        },
      },
      actualMetrics: {
        actualTimeMinutes: row.actual_time_minutes,
        actualDistanceKm: row.actual_distance_km,
        deviationFromPlan: {
          timeDeviationMinutes: row.time_deviation_minutes,
          distanceDeviationKm: row.distance_deviation_km,
        },
      },
      weights: {
        time: row.weight_time,
        distance: row.weight_distance,
        reliability: row.weight_reliability,
      },
      timestamp: new Date(row.timestamp),
      completed: row.completed === 1,
    };
  }
}
