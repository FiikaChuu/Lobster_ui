/**
 * Data Validation & Normalization Utilities
 * Crucial rule: Missing / null data must NEVER be silently turned into zero.
 */

import type { SensorStatus } from '../types/sensor';

export function normalizeNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export function normalizeSensorStatus(status: unknown): SensorStatus {
  if (typeof status !== 'string') return 'unknown';
  const lower = status.toLowerCase();
  if (lower.includes('normal') || lower.includes('optimal') || lower.includes('good') || lower.includes('aman')) {
    return 'normal';
  }
  if (lower.includes('warn') || lower.includes('waspada') || lower.includes('caution') || lower.includes('perhatian')) {
    return 'warning';
  }
  if (lower.includes('crit') || lower.includes('bahaya') || lower.includes('danger') || lower.includes('kritis') || lower.includes('alert')) {
    return 'critical';
  }
  if (lower.includes('disconnect') || lower.includes('offline') || lower.includes('terputus')) {
    return 'disconnected';
  }
  if (lower.includes('error') || lower.includes('rusak')) {
    return 'error';
  }
  return 'unknown';
}

export function calculateTrend(
  current: number | null,
  previous: number | null,
  threshold = 0.05
): { trend: 'up' | 'down' | 'stable' | 'unknown'; delta?: number } {
  if (current === null || previous === null) {
    return { trend: 'unknown' };
  }
  const delta = current - previous;
  if (Math.abs(delta) < threshold) {
    return { trend: 'stable', delta: Number(delta.toFixed(2)) };
  }
  return {
    trend: delta > 0 ? 'up' : 'down',
    delta: Number(delta.toFixed(2))
  };
}

export function computeSummaryStats(values: (number | null)[]): {
  min: number | null;
  max: number | null;
  avg: number | null;
} {
  const valid = values.filter((v): v is number => v !== null && !isNaN(v));
  if (valid.length === 0) {
    return { min: null, max: null, avg: null };
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const avg = valid.reduce((sum, v) => sum + v, 0) / valid.length;

  return {
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    avg: Number(avg.toFixed(2))
  };
}
