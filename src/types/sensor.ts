/**
 * Sensor and Water Quality Parameter Types
 * Lobster Aquaculture Monitoring (Panulirus spp.)
 */

export type ParameterKey = 'ph' | 'temperature' | 'salinity' | 'dissolvedOxygen' | 'tds' | 'ec';

export type SensorStatus = 'normal' | 'warning' | 'critical' | 'unknown' | 'error' | 'disconnected';

export interface ParameterMetadata {
  key: ParameterKey;
  label: string;
  shortLabel: string;
  defaultUnit: string;
  description: string;
  optimalRangeDescription: string;
  decimals: number;
}

export interface SensorReading {
  parameter: ParameterKey;
  value: number | null; // null represents missing / unread data (never silently converted to 0)
  unit: string;
  status: SensorStatus;
  timestamp: string; // ISO 8601
  rawStatus?: string; // status string as delivered by the backend
  isStale?: boolean;
}

export interface ParameterSummary {
  current: number | null;
  unit: string;
  status: SensorStatus;
  timestamp: string | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  trend: 'up' | 'down' | 'stable' | 'unknown';
  trendDelta?: number; // e.g. +0.2
  history: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  timestamp: string; // ISO 8601
  value: number | null;
  status?: SensorStatus;
}
