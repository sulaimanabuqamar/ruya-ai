/**
 * Route-related data models
 */

import { Location } from './core';

export interface RouteRequest {
  pickupLocations: Location[];
  dropoffLocations: Location[];
  departureTime: Date;
  constraints?: RouteConstraints;
}

export interface RouteConstraints {
  maxDetourMinutes?: number;
  maxTotalTimeMinutes?: number;
  timeWindows?: TimeWindow[];
}

export interface TimeWindow {
  locationIndex: number;
  earliestTime: Date;
  latestTime: Date;
}

export interface Route {
  id: string;
  waypoints: Waypoint[];
  segments: RouteSegment[];
  metadata: RouteMetadata;
}

export interface Waypoint {
  location: Location;
  type: 'pickup' | 'dropoff';
  sequenceNumber: number;
  estimatedArrivalTime: Date;
}

export interface RouteSegment {
  startLocation: Location;
  endLocation: Location;
  roadSegmentIds: string[];
  distanceMeters: number;
  estimatedDurationSeconds: number;
}

export interface RouteMetadata {
  generatedAt: Date;
  trafficDataTimestamp: Date;
  algorithmVersion: string;
}
