/**
 * Top-Level Monitoring Domain Models
 */

import type { ParameterKey, ParameterSummary } from './sensor';
import type { FuzzyClassificationResult } from './classification';
import type { EnvironmentalAlert } from './alert';
import type { SystemPipelineStatus } from './device';

export type DashboardConnectionState =
  | 'connected'
  | 'disconnected'
  | 'waiting_first_reading'
  | 'data_unavailable'
  | 'stale_data'
  | 'loading'
  | 'api_error'
  | 'demo_mode';

export interface PondMetadata {
  id: string;
  name: string;
  species: string; // e.g., Panulirus ornatus (Mutiara) / Panulirus homarus (Pasir)
  tankType: string; // e.g. "Holding Tank A-01" / "Nursery Pond #2"
  capacityLiters: number;
  location: string;
}

export interface MonitoringSnapshot {
  pondId: string;
  deviceId: string;
  timestamp: string; // ISO 8601
  isStale: boolean;
  parameters: Record<ParameterKey, ParameterSummary>;
  classification: FuzzyClassificationResult;
  alerts: EnvironmentalAlert[];
  pipeline: SystemPipelineStatus;
}
