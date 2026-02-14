/**
 * Core data models for the Agentic Route Optimizer
 */

// Geographic primitives
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface GeographicArea {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Time primitives
export interface TimeRange {
  start: Date;
  end: Date;
}

// Route constraints
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

// Incidents
export interface Incident {
  type: 'accident' | 'construction' | 'closure' | 'other';
  severity: 'minor' | 'moderate' | 'major';
  description: string;
}
