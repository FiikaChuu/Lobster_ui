/**
 * Fuzzy Logic Classification Adapter
 * Maps backend fuzzy evaluation responses.
 * Never invents frontend thresholds or classifications.
 */

import type { FuzzyClassificationResult, FuzzyClassificationLevel, TriggeringFactor } from '../types/classification';
import type { RawBackendClassification } from '../types/api';

export function adaptClassification(raw: RawBackendClassification | null | undefined): FuzzyClassificationResult {
  if (!raw) {
    return {
      classification: 'pending',
      evaluatedAt: null,
      summary: 'Menunggu hasil klasifikasi dari backend fuzzy logic',
      triggeringFactors: [],
      recommendation: 'Model fuzzy backend belum mengirimkan evaluasi terbaru.'
    };
  }

  const rawClass = (raw.classification || '').toLowerCase();
  let classification: FuzzyClassificationLevel = 'pending';

  if (rawClass.includes('normal') || rawClass.includes('optimal') || rawClass.includes('aman') || rawClass.includes('baik')) {
    classification = 'normal';
  } else if (rawClass.includes('warn') || rawClass.includes('waspada') || rawClass.includes('sedang')) {
    classification = 'warning';
  } else if (rawClass.includes('crit') || rawClass.includes('kritis') || rawClass.includes('bahaya') || rawClass.includes('buruk')) {
    classification = 'critical';
  }

  // Map factors from raw backend
  const rawFactors = raw.factors || raw.triggering_factors || [];
  const triggeringFactors: TriggeringFactor[] = rawFactors.map((f: any) => ({
    parameter: f.parameter || 'Parameter',
    observedValue: f.observed_value ?? f.value ?? '—',
    unit: f.unit,
    influence: f.influence || 'moderate',
    note: f.note
  }));

  return {
    classification,
    rawClassification: raw.classification,
    evaluatedAt: raw.evaluatedAt || raw.evaluated_at || null,
    confidence: typeof raw.confidence === 'number' ? raw.confidence : (typeof raw.score === 'number' ? raw.score : undefined),
    summary: raw.summary || (classification === 'pending' 
      ? 'Menunggu hasil klasifikasi' 
      : `Kondisi air diklasifikasikan sebagai ${raw.classification || classification}`),
    triggeringFactors,
    recommendation: (raw as any).recommendation,
    history: (raw as any).history || []
  };
}
