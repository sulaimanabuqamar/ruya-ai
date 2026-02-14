/**
 * Historical performance data models
 */

import { RouteMetrics, MetricWeights, RouteCharacteristics } from './metrics';

export interface RoutePerformance {
  id: string;
  routeId: string;
  plannedMetrics: RouteMetrics;
  actualMetrics: ActualMetrics;
  weights: MetricWeights;
  timestamp: Date;
  completed: boolean;
}

export interface ActualMetrics {
  actualTimeMinutes: number;
  actualDistanceKm: number;
  deviationFromPlan: {
    timeDeviationMinutes: number;
    distanceDeviationKm: number;
  };
}

export interface PerformanceQuery {
  startDate?: Date;
  endDate?: Date;
  minCompletedRoutes?: number;
  routeCharacteristics?: RouteCharacteristics;
}

export interface PerformanceStats {
  totalRoutes: number;
  completedRoutes: number;
  averageTimeDeviation: number;
  averageDistanceDeviation: number;
}

export interface WeightAdjustmentResult {
  previousWeights: MetricWeights;
  proposedWeights: MetricWeights;
  appliedWeights: MetricWeights;
  justification: string;
  confidence: number; // 0-1
}

export interface PerformanceAnalysis {
  performances: RoutePerformance[];
  correlations: {
    timeWeightVsDeviation: number;
    distanceWeightVsDeviation: number;
    reliabilityWeightVsDeviation: number;
  };
  trends: {
    improvingMetrics: string[];
    decliningMetrics: string[];
  };
}
