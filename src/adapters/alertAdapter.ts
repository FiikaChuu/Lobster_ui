/**
 * Alert Data Adapter
 * Normalizes backend alerts into standard EnvironmentalAlert models.
 */

import type { EnvironmentalAlert, AlertSeverity, AlertStatus } from '../types/alert';
import type { RawBackendAlert } from '../types/api';

export function adaptAlerts(rawAlerts: RawBackendAlert[] | null | undefined): EnvironmentalAlert[] {
  if (!Array.isArray(rawAlerts)) {
    return [];
  }

  return rawAlerts.map((raw) => {
    const rawSev = (raw.severity || 'warning').toLowerCase();
    let severity: AlertSeverity = 'warning';
    if (rawSev.includes('crit') || rawSev.includes('danger') || rawSev.includes('bahaya')) {
      severity = 'critical';
    } else if (rawSev.includes('info')) {
      severity = 'info';
    }

    const status: AlertStatus = raw.acknowledged ? 'acknowledged' : 'active';

    return {
      id: String(raw.id),
      severity,
      title: raw.title || 'Peringatan Parameter Lingkungan',
      message: raw.message || raw.description || 'Nilai parameter berada di luar batas aman.',
      parameter: raw.parameter,
      observedValue: raw.value ?? raw.measured_value,
      unit: raw.unit,
      timestamp: raw.timestamp || new Date().toISOString(),
      status,
      acknowledgedAt: raw.acknowledged_at,
      canAcknowledge: (raw as any).can_acknowledge ?? false // Backend capability flag
    };
  });
}
