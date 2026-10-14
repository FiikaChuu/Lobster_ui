/**
 * Monitoring Data Adapter
 * Translates backend payload variations into standardized domain models.
 * Preserves missing/null values, never converting null to 0.
 */

import type { RawBackendLatestReading, ApiResponse } from '../types/api';
import type { ParameterKey, ParameterSummary, HistoricalDataPoint } from '../types/sensor';
import type { MonitoringSnapshot } from '../types/monitoring';
import { PARAMETER_METADATA } from '../utils/unitFormatter';
import { normalizeNumber, normalizeSensorStatus, calculateTrend, computeSummaryStats } from '../utils/dataValidation';
import { isTimestampStale } from '../utils/dateFormatter';
import { adaptClassification } from './classificationAdapter';
import { adaptAlerts } from './alertAdapter';
import { adaptPipelineStatus } from './deviceAdapter';

export function adaptLatestMonitoring(
  rawInput: RawBackendLatestReading | ApiResponse<RawBackendLatestReading> | null | undefined,
  historicalRecords: Record<ParameterKey, HistoricalDataPoint[]> = {
    ph: [],
    temperature: [],
    salinity: [],
    dissolvedOxygen: [],
    tds: [],
    ec: []
  }
): MonitoringSnapshot {
  // Handle envelope wrapper if present
  const raw: RawBackendLatestReading = 
    rawInput && typeof rawInput === 'object' && 'data' in rawInput && rawInput.data && typeof (rawInput as any).success === 'boolean'
      ? (rawInput as ApiResponse<RawBackendLatestReading>).data
      : (rawInput as RawBackendLatestReading) || {};

  const pondId = raw.pondId || raw.pond_id || 'POOL-01';
  const deviceId = raw.deviceId || raw.device_id || 'ESP32-LOBSTER-01';
  const timestamp = raw.timestamp || raw.created_at || new Date().toISOString();
  const isStale = isTimestampStale(timestamp);

  const rawData = raw.data || {};
  const rawUnits = raw.units || {};
  const rawStatus = raw.status || {};

  // Extract raw parameter values safely
  const rawValues: Record<ParameterKey, number | null> = {
    temperature: normalizeNumber(rawData.temperature ?? rawData.temp_c),
    ph: normalizeNumber(rawData.ph),
    salinity: normalizeNumber(rawData.salinity),
    dissolvedOxygen: normalizeNumber(rawData.dissolvedOxygen ?? rawData.dissolved_oxygen ?? rawData.do),
    tds: normalizeNumber(rawData.tds),
    ec: normalizeNumber(rawData.ec ?? rawData.conductivity)
  };

  const parameters: Record<ParameterKey, ParameterSummary> = {} as Record<ParameterKey, ParameterSummary>;

  (Object.keys(PARAMETER_METADATA) as ParameterKey[]).forEach((key) => {
    const currentVal = rawValues[key];
    const unit = rawUnits[key as keyof typeof rawUnits] || PARAMETER_METADATA[key].defaultUnit;
    const history = historicalRecords[key] || [];
    
    // Status can come directly from backend or fallback to normalized
    const statusStr = rawStatus[key as keyof typeof rawStatus];
    const status = statusStr ? normalizeSensorStatus(statusStr) : (currentVal === null ? 'unknown' : 'normal');

    // Trend calculation based on previous history point
    const prevVal = history.length > 1 ? history[history.length - 2].value : null;
    const { trend, delta } = calculateTrend(currentVal, prevVal);

    // Summary statistics over historical series
    const allValues = [...history.map(h => h.value), currentVal];
    const stats = computeSummaryStats(allValues);

    parameters[key] = {
      current: currentVal,
      unit,
      status: isStale && status !== 'unknown' ? 'warning' : status,
      timestamp: currentVal !== null ? timestamp : null,
      min: stats.min,
      max: stats.max,
      avg: stats.avg,
      trend,
      trendDelta: delta,
      history
    };
  });

  return {
    pondId,
    deviceId,
    timestamp,
    isStale,
    parameters,
    classification: adaptClassification((raw as any).classification),
    alerts: adaptAlerts((raw as any).alerts),
    pipeline: adaptPipelineStatus((raw as any).pipeline, raw.deviceStatus, timestamp)
  };
}
