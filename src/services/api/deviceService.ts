/**
 * Device and Monitoring Control API Service
 * Clearly isolates frontend polling controls from backend acquisition controls.
 */

import { apiClient, ApiError } from './apiClient';
import type { ApiResponse } from '../../types/api';
import type { SystemPipelineStatus } from '../../types/device';
import { adaptPipelineStatus } from '../../adapters/deviceAdapter';

export async function getPipelineStatus(pondId = 'POOL-01'): Promise<SystemPipelineStatus> {
  const response = await apiClient.get<ApiResponse<any> | any>('/monitoring/pipeline', {
    params: { pondId }
  });
  const data = response && typeof response === 'object' && 'data' in response ? response.data : response;
  return adaptPipelineStatus(data?.pipeline, data?.deviceStatus, data?.timestamp);
}

export async function requestBackendStartMonitoring(pondId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<ApiResponse<any>>('/monitoring/start', { pondId });
    return {
      success: true,
      message: response?.message || 'Proses akuisisi data backend berhasil diaktifkan.'
    };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 0)) {
      throw new Error('Endpoint POST /api/monitoring/start belum diimplementasikan di backend.');
    }
    throw err;
  }
}

export async function requestBackendPauseMonitoring(pondId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<ApiResponse<any>>('/monitoring/pause', { pondId });
    return {
      success: true,
      message: response?.message || 'Proses akuisisi data backend berhasil dijeda.'
    };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 0)) {
      throw new Error('Endpoint POST /api/monitoring/pause belum diimplementasikan di backend.');
    }
    throw err;
  }
}
