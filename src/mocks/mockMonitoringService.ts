/**
 * Mock Monitoring Service Provider
 * Implements identical signatures to the real service layer.
 */

import type { MonitoringSnapshot } from '../types/monitoring';
import type { ParameterKey, HistoricalDataPoint } from '../types/sensor';
import type { EnvironmentalAlert } from '../types/alert';
import type { FuzzyClassificationResult } from '../types/classification';
import type { HistoryQueryParams } from '../types/api';
import { buildMockSnapshot, generateMockHistory } from './mockMonitoringData';
import type { DemoScenarioId } from './mockScenarios';

let currentScenario: DemoScenarioId = 'normal';

export function getActiveDemoScenario(): DemoScenarioId {
  return currentScenario;
}

export function setActiveDemoScenario(scenario: DemoScenarioId): void {
  currentScenario = scenario;
}

export async function getMockLatestMonitoringData(pondId = 'POOL-01'): Promise<MonitoringSnapshot> {
  // Simulate natural network roundtrip latency (150-300ms)
  await new Promise((resolve) => setTimeout(resolve, 200));
  return buildMockSnapshot(currentScenario, pondId);
}

export async function getMockSensorHistory(
  pondId = 'POOL-01',
  params: HistoryQueryParams = { range: '24h' }
): Promise<Record<ParameterKey, HistoricalDataPoint[]>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const pointsCount = params.range === '1h' ? 60 : params.range === '7d' ? 168 : 24;
  const intervalMinutes = params.range === '1h' ? 1 : params.range === '7d' ? 60 : 60;

  const snapshot = buildMockSnapshot(currentScenario, pondId);

  return {
    ph: generateMockHistory('ph', snapshot.parameters.ph.current ?? 8.0, 0.2, pointsCount, intervalMinutes),
    temperature: generateMockHistory('temperature', snapshot.parameters.temperature.current ?? 28.5, 0.6, pointsCount, intervalMinutes),
    salinity: generateMockHistory('salinity', snapshot.parameters.salinity.current ?? 32.0, 0.5, pointsCount, intervalMinutes),
    dissolvedOxygen: generateMockHistory('dissolvedOxygen', snapshot.parameters.dissolvedOxygen.current ?? 5.5, 0.4, pointsCount, intervalMinutes),
    tds: [],
    ec: []
  };
}

export async function getMockClassificationResult(pondId = 'POOL-01'): Promise<FuzzyClassificationResult> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const snapshot = buildMockSnapshot(currentScenario, pondId);
  return snapshot.classification;
}

export async function getMockAlerts(pondId = 'POOL-01'): Promise<EnvironmentalAlert[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const snapshot = buildMockSnapshot(currentScenario, pondId);
  return snapshot.alerts;
}

export async function mockAcknowledgeAlert(alertId: string): Promise<{ success: boolean; alertId: string; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    success: true,
    alertId,
    message: `Peringatan ${alertId} berhasil diakui (Demo simulation only)`
  };
}
