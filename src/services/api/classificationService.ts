/**
 * Classification API Service (Real Backend Integration)
 */

import { apiClient } from './apiClient';
import type { ApiResponse, RawBackendClassification } from '../../types/api';
import type { FuzzyClassificationResult } from '../../types/classification';
import { adaptClassification } from '../../adapters/classificationAdapter';

export async function getClassificationResult(pondId = 'POOL-01'): Promise<FuzzyClassificationResult> {
  const response = await apiClient.get<ApiResponse<RawBackendClassification> | RawBackendClassification>(
    '/monitoring/classification',
    { params: { pondId } }
  );

  const raw =
    response && typeof response === 'object' && 'data' in response && (response as any).data
      ? (response as ApiResponse<RawBackendClassification>).data
      : (response as RawBackendClassification);

  return adaptClassification(raw);
}
