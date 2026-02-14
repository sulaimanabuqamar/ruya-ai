/**
 * Metrics and evaluation data models
 */

import { Route } from './route';

export interface MetricWeights {
  time: number;      // 0-1, sum of all weights = 1
  distance: number;  // 0-1
  reliability: number; // 0-1
}

export interface RouteMetrics {
  timeMinutes: number;
  distanceKm: number;
  reliability: number; // 0-1 scale, higher is more reliable
  rawMetrics: {
    timeVariance: number;
    distanceVariance: number;
    measurementCount: number;
  };
}

export interface NormalizedMetrics {
  time: number;       // 0-1, normalized across all routes
  distance: number;   // 0-1
  reliability: number; // 0-1
}

export interface ScoredRoute {
  route: Route;
  metrics: RouteMetrics;
  normalizedMetrics: NormalizedMetrics;
  score: number; // 0-1, higher is better
}

export interface RouteCharacteristics {
  approximateDistance?: number;
  approximateTime?: number;
  numberOfWaypoints?: number;
  timeOfDay?: 'morning' | 'midday' | 'evening' | 'night';
}
