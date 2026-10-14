/**
 * Unit and Parameter Display Formatting Utilities
 */

import type { ParameterKey, ParameterMetadata } from '../types/sensor';

export const PARAMETER_METADATA: Record<ParameterKey, ParameterMetadata> = {
  ph: {
    key: 'ph',
    label: 'Derajat Keasaman (pH)',
    shortLabel: 'pH',
    defaultUnit: 'pH',
    description: 'Tingkat keasaman air pemeliharaan lobster laut',
    optimalRangeDescription: 'Rentang optimal: 7.5 – 8.5',
    decimals: 2
  },
  temperature: {
    key: 'temperature',
    label: 'Suhu Air',
    shortLabel: 'Suhu',
    defaultUnit: '°C',
    description: 'Suhu perairan kolam/bak lobster (Panulirus spp.)',
    optimalRangeDescription: 'Rentang optimal: 26.0 – 29.5 °C',
    decimals: 1
  },
  salinity: {
    key: 'salinity',
    label: 'Salinitas',
    shortLabel: 'Salinitas',
    defaultUnit: 'ppt', // or PSU according to sensor integration
    description: 'Kadar garam terlarut dalam air laut (ppt / PSU)',
    optimalRangeDescription: 'Rentang optimal: 30.0 – 34.0 ppt',
    decimals: 1
  },
  dissolvedOxygen: {
    key: 'dissolvedOxygen',
    label: 'Oksigen Terlarut (DO)',
    shortLabel: 'DO',
    defaultUnit: 'mg/L',
    description: 'Kadar oksigen terlarut vital untuk respirasi lobster',
    optimalRangeDescription: 'Rentang optimal: ≥ 5.0 mg/L (Kritis < 3.5)',
    decimals: 2
  },
  tds: {
    key: 'tds',
    label: 'Total Dissolved Solids (TDS)',
    shortLabel: 'TDS',
    defaultUnit: 'ppm',
    description: 'Total zat terlarut (opsional jika sensor tersedia)',
    optimalRangeDescription: 'Tergantung kalibrasi sensor perairan',
    decimals: 0
  },
  ec: {
    key: 'ec',
    label: 'Konduktivitas Listrik (EC)',
    shortLabel: 'EC',
    defaultUnit: 'mS/cm',
    description: 'Konduktivitas listrik air sebagai indikator kadar garam terlarut',
    optimalRangeDescription: 'Rentang optimal: 45.0 – 55.0 mS/cm (air laut)',
    decimals: 1
  }
};

export function formatValue(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return value.toFixed(decimals);
}

export function formatValueWithUnit(value: number | null | undefined, unit: string, decimals = 1): string {
  const val = formatValue(value, decimals);
  if (val === '—') return '—';
  return `${val} ${unit}`;
}
