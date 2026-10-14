/**
 * Fuzzy Logic Classification Types
 * Evaluation returned by the backend fuzzy inference engine.
 */

export type FuzzyClassificationLevel = 'normal' | 'warning' | 'critical' | 'pending';

export interface TriggeringFactor {
  parameter: string;
  observedValue: number | string;
  unit?: string;
  influence: 'high' | 'moderate' | 'low';
  note?: string;
}

export interface FuzzyClassificationResult {
  classification: FuzzyClassificationLevel;
  rawClassification?: string; // original string from backend (e.g. "Optimal", "Waspada", "Bahaya")
  evaluatedAt: string | null; // ISO 8601 timestamp
  confidence?: number; // 0.0 - 1.0 or membership degree if supplied
  summary: string;
  triggeringFactors: TriggeringFactor[];
  recommendation?: string;
  history?: ClassificationHistoryItem[];
}

export interface ClassificationHistoryItem {
  timestamp: string;
  classification: FuzzyClassificationLevel;
  trigger?: string;
}
