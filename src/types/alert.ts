/**
 * Environmental Alert Types
 */

import type { ParameterKey } from './sensor';

export type AlertSeverity = 'warning' | 'critical' | 'info';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface EnvironmentalAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  parameter?: ParameterKey | string;
  observedValue?: number | string;
  unit?: string;
  thresholdContext?: string;
  timestamp: string; // ISO 8601
  status: AlertStatus;
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
  canAcknowledge?: boolean; // whether backend supports acknowledgment endpoint
}
