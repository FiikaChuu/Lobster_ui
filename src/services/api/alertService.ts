/**
 * Environmental Alert Service (Real Backend Integration)
 */

import { apiClient, ApiError } from './apiClient';
import type { ApiResponse, RawBackendAlert } from '../../types/api';
import type { EnvironmentalAlert } from '../../types/alert';
import { adaptAlerts } from '../../adapters/alertAdapter';

export async function getAlerts(pondId = 'POOL-01'): Promise<EnvironmentalAlert[]> {
  const response = await apiClient.get<ApiResponse<RawBackendAlert[]> | RawBackendAlert[]>(
    '/monitoring/alerts',
    { params: { pondId } }
  );

  const raw =
    response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)
      ? (response as ApiResponse<RawBackendAlert[]>).data
      : (response as RawBackendAlert[]);

  return adaptAlerts(raw);
}

export async function acknowledgeAlert(alertId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<ApiResponse<any>>(`/monitoring/alerts/${alertId}/acknowledge`);
    return {
      success: true,
      message: response?.message || 'Peringatan berhasil dikonfirmasi ke backend.'
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new Error('Fitur pengakuan peringatan belum didukung oleh backend REST API.');
    }
    throw err;
  }
}
