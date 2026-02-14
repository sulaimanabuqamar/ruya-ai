/**
 * Traffic data models
 */

import { Coordinate, Incident } from './core';

export interface TrafficData {
  roadSegments: RoadSegment[];
  timestamp: Date;
  source: string;
}

export interface RoadSegment {
  id: string;
  coordinates: Coordinate[];
  speedKmh: number;
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  incidents: Incident[];
}

export interface HistoricalTrafficData {
  roadSegmentId: string;
  measurements: TrafficMeasurement[];
}

export interface TrafficMeasurement {
  timestamp: Date;
  speedKmh: number;
  travelTimeSeconds: number;
}
