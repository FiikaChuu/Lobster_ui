import React, { useState } from 'react';
import type { MonitoringSnapshot } from '../types/monitoring';
import type { ParameterKey, HistoricalDataPoint } from '../types/sensor';
import { PARAMETER_METADATA } from '../utils/unitFormatter';
import { ParameterGrid } from '../components/monitoring/ParameterGrid';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';

interface WaterQualityPageProps {
  data: MonitoringSnapshot | null;
  history: Record<ParameterKey, HistoricalDataPoint[]>;
  timeRange: '1h' | '24h' | '7d';
  onTimeRangeChange: (range: '1h' | '24h' | '7d') => void;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  isStale: boolean;
}

export const WaterQualityPage: React.FC<WaterQualityPageProps> = ({
  data,
  history,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  isLoading,
  isStale
}) => {
  const [selectedKey, setSelectedKey] = useState<ParameterKey>('temperature');

  const scientificGuide: Record<ParameterKey, {
    optimal: string;
    criticalLow: string;
    criticalHigh: string;
    impact: string;
    monitoringFrequency: string;
  }> = {
    ph: {
      optimal: '7.5 – 8.5 pH',
      criticalLow: '< 7.0 (Asidifikasi akut)',
      criticalHigh: '> 8.8 (Stres alkalinitas)',
      impact: 'pH rendah melunakkan karapas lobster dan mengganggu proses molting (ganti kulit). pH tinggi memicu pelepasan amonia toksik.',
      monitoringFrequency: 'Kontinu (Setiap 5 detik)'
    },
    temperature: {
      optimal: '26.0 – 29.5 °C',
      criticalLow: '< 24.0 °C (Metabolisme lambat)',
      criticalHigh: '> 31.0 °C (Hipertermia & mortalitas)',
      impact: 'Suhu mengontrol laju metabolisme, konsumsi oksigen, dan nafsu makan lobster laut Panulirus.',
      monitoringFrequency: 'Kontinu (Probe DS18B20)'
    },
    salinity: {
      optimal: '30.0 – 34.0 ppt',
      criticalLow: '< 25.0 ppt (Stres osmoregulasi)',
      criticalHigh: '> 36.0 ppt (Dehidrasi selular)',
      impact: 'Salinitas menjaga keseimbangan osmotik cairan tubuh lobster dengan perairan laut sekitarnya.',
      monitoringFrequency: 'Kontinu (Sensor Konduktivitas EC)'
    },
    dissolvedOxygen: {
      optimal: '≥ 5.0 mg/L',
      criticalLow: '< 3.5 mg/L (Hipoksia akut)',
      criticalHigh: '> 9.0 mg/L (Kejenuhan gas)',
      impact: 'Oksigen terlarut adalah faktor pembatas utama kehidupan lobster. Hipoksia dapat menyebabkan kematian massal dalam waktu singkat.',
      monitoringFrequency: 'Kontinu (Probe DO Optik/Galvanik)'
    },
    tds: {
      optimal: 'Tergantung kalibrasi',
      criticalLow: 'N/A',
      criticalHigh: 'N/A',
      impact: 'Parameter pendukung zat padat terlarut.',
      monitoringFrequency: 'Opsional jika sensor terpasang'
    },
    ec: {
      optimal: '45.0 – 55.0 mS/cm',
      criticalLow: '< 40.0 mS/cm (Salinitas rendah)',
      criticalHigh: '> 60.0 mS/cm (Salinitas berlebih)',
      impact: 'Konduktivitas listrik berkorelasi langsung dengan salinitas dan kadar mineral terlarut. EC rendah mengindikasikan pengenceran air laut.',
      monitoringFrequency: 'Opsional (berkorelasi dengan salinitas)'
    }
  };

  const selectedGuide = scientificGuide[selectedKey];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Analisis Parameter Kualitas Air</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Metrik mendalam, ambang batas ilmiah, dan dampak biologi terhadap lobster laut
        </p>
      </div>

      {/* Parameter Cards */}
      <ParameterGrid
        parameters={data?.parameters}
        isLoading={isLoading}
        isStale={isStale}
      />

      {/* Chart */}
      <TimeSeriesChart
        history={history}
        isLoading={isLoading}
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
        onRefresh={onRefresh}
      />

      {/* Scientific Reference Standards Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Baku Mutu Standar Lingkungan Lobster Laut</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Referensi biologis budidaya genus Panulirus (Kepmen Kelautan dan Perikanan)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['temperature', 'ph', 'salinity', 'dissolvedOxygen'] as ParameterKey[]).map((k) => (
              <button
                key={k}
                className={`param-tab-btn ${selectedKey === k ? 'active' : ''}`}
                onClick={() => setSelectedKey(k)}
              >
                {PARAMETER_METADATA[k].label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Spec Panel for Selected Parameter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'var(--bg-inset)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Rentang Optimal Target</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--status-normal)', marginTop: '0.2rem' }}>
              {selectedGuide.optimal}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Ambang Kritis Bawah</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--status-critical)', marginTop: '0.2rem' }}>
              {selectedGuide.criticalLow}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Ambang Kritis Atas</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--status-warning)', marginTop: '0.2rem' }}>
              {selectedGuide.criticalHigh}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Frekuensi Pengukuran</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {selectedGuide.monitoringFrequency}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-inset)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Dampak Fisiologis pada Lobster: </strong>
          {selectedGuide.impact}
        </div>
      </div>
    </div>
  );
};
