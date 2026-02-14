/**
 * SQLite database schema for route optimizer
 * 
 * This file defines the database schema for storing:
 * - Route performance history
 * - Weight adjustment history
 */

export const CREATE_TABLES_SQL = `
-- Route performance history
CREATE TABLE IF NOT EXISTS route_performances (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL,
  planned_time_minutes REAL NOT NULL,
  planned_distance_km REAL NOT NULL,
  planned_reliability REAL NOT NULL,
  actual_time_minutes REAL,
  actual_distance_km REAL,
  time_deviation_minutes REAL,
  distance_deviation_km REAL,
  weight_time REAL NOT NULL,
  weight_distance REAL NOT NULL,
  weight_reliability REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  completed INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timestamp ON route_performances(timestamp);
CREATE INDEX IF NOT EXISTS idx_completed ON route_performances(completed);

-- Weight adjustment history
CREATE TABLE IF NOT EXISTS weight_adjustments (
  id TEXT PRIMARY KEY,
  previous_time REAL NOT NULL,
  previous_distance REAL NOT NULL,
  previous_reliability REAL NOT NULL,
  new_time REAL NOT NULL,
  new_distance REAL NOT NULL,
  new_reliability REAL NOT NULL,
  justification TEXT NOT NULL,
  confidence REAL NOT NULL,
  routes_analyzed INTEGER NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adjustment_timestamp ON weight_adjustments(timestamp);
`;

export const DROP_TABLES_SQL = `
DROP TABLE IF EXISTS route_performances;
DROP TABLE IF EXISTS weight_adjustments;
`;
