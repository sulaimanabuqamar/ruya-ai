/**
 * Configuration constants and default values for the route optimizer
 */

import { MetricWeights } from '../types';

// Default metric weights
export const DEFAULT_WEIGHTS: MetricWeights = {
  time: 0.4,
  distance: 0.3,
  reliability: 0.3,
};

// Weight adjustment configuration
export const WEIGHT_ADJUSTMENT_CONFIG = {
  minRoutesThreshold: 50, // Minimum completed routes before weight adjustment
  adjustmentIntervalHours: 24, // How often to run weight adjustment
  maxWeightChange: 0.15, // Maximum change per adjustment
  incrementalBlendFactor: 0.3, // Blend factor for incremental adjustment (0.7 old + 0.3 new)
  weightSumTolerance: 0.001, // Tolerance for weight sum validation
};

// Traffic data configuration
export const TRAFFIC_CONFIG = {
  cacheTTLMinutes: 5, // Cache time-to-live
  staleDataThresholdMinutes: 15, // When to warn about stale data
  apiRetryDelays: [1000, 2000, 4000, 8000], // Exponential backoff delays in ms
  maxRetries: 4,
};

// Route generation configuration
export const ROUTE_CONFIG = {
  minRoutesToGenerate: 3, // Target minimum number of routes
  algorithmVersion: '1.0.0',
};

// Reliability calculation configuration
export const RELIABILITY_CONFIG = {
  minMeasurementsForReliability: 10, // Minimum measurements for reliable score
  defaultReliability: 0.3, // Default score when insufficient data
  recentMeasurementDecayFactor: 0.9, // Exponential decay for time weighting
};

// Historical data retention
export const DATA_RETENTION = {
  performanceDataDays: 90, // How long to retain performance data
};

// Amazon Bedrock configuration
export const BEDROCK_CONFIG = {
  defaultModelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
  temperature: 0.3, // Lower temperature for consistent analytical outputs
  topP: 0.9,
  maxTokens: 2000,
  timeoutMs: 30000, // 30 second timeout
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  CURRENT_WEIGHTS: 'route_optimizer.weights.current',
  LAST_ADJUSTMENT: 'route_optimizer.weights.last_adjustment',
  ADJUSTMENT_INTERVAL: 'route_optimizer.config.adjustment_interval',
  MIN_ROUTES_THRESHOLD: 'route_optimizer.config.min_routes_threshold',
};

// Database configuration
export const DATABASE_CONFIG = {
  name: 'route_optimizer.db',
  version: 1,
};
