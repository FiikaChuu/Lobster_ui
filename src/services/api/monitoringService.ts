/**
 * Monitoring API Service (Real Backend Integration)
 */

import { apiClient } from './apiClient';
import type { ApiResponse, RawBackendLatestReading, HistoryQueryParams } from '../../types/api';
import type { ParameterKey, HistoricalDataPoint } from '../../types/sensor';
import type { MonitoringSnapshot } from '../../types/monitoring';
import { adaptLatestMonitoring } from '../../adapters/monitoringAdapter';

export interface HistoryResponse {
  pondId: string;
  parameter: ParameterKey;
  unit: string;
  points: HistoricalDataPoint[];
}

export async function getLatestMonitoringData(pondId = 'POOL-01'): Promise<MonitoringSnapshot> {
  const response = await apiClient.get<ApiResponse<RawBackendLatestReading> | RawBackendLatestReading>(
    '/monitoring/latest',
    { params: { pondId } }
  );
  return adaptLatestMonitoring(response);
}

export async function getSensorHistory(
  pondId = 'POOL-01',
  params: HistoryQueryParams = { range: '24h' }
): Promise<Record<ParameterKey, HistoricalDataPoint[]>> {
  const response = await apiClient.get<ApiResponse<Record<ParameterKey, HistoricalDataPoint[]>> | Record<ParameterKey, HistoricalDataPoint[]>>(
    '/monitoring/history',
    {
      params: {
        pondId,
        parameter: params.parameter,
        range: params.range,
        startDate: params.startDate,
        endDate: params.endDate,
        limit: params.limit
      }
    }
  );

  // Normalize envelope if present
  if (response && typeof response === 'object' && 'data' in response && (response as any).data) {
    return (response as any).data;
  }
  return (response as Record<ParameterKey, HistoricalDataPoint[]>) || {
    ph: [],
    temperature: [],
    salinity: [],
    dissolvedOxygen: [],
    tds: []
  };
}

export async function getMonitoringStatus(pondId = 'POOL-01'): Promise<{
  active: boolean;
  pondId: string;
  deviceId: string;
  lastReadingTimestamp: string | null;
  serverTime: string;
}> {
  const response = await apiClient.get<ApiResponse<any> | any>('/monitoring/status', {
    params: { pondId }
  });
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}
