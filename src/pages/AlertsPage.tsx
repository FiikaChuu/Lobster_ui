import React from 'react';
import type { EnvironmentalAlert } from '../types/alert';
import { AlertCenter } from '../components/alerts/AlertCenter';
import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface AlertsPageProps {
  alerts: EnvironmentalAlert[];
  isLoading: boolean;
  onAcknowledge: (alertId: string) => void;
  feedbackMessage: string | null;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  isLoading,
  onAcknowledge,
  feedbackMessage
}) => {
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && a.status === 'active').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'acknowledged').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pusat Peringatan & Mitigasi Risiko</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Deteksi otomatis anomali kualitas air dan instruksi penanganan darurat
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-critical)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Peringatan Kritis Aktif
            </span>
            <AlertOctagon size={18} style={{ color: 'var(--status-critical)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Memerlukan intervensi fisik segera
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Peringatan Waspada Aktif
            </span>
            <AlertTriangle size={18} style={{ color: 'var(--status-warning)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {warningCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Parameter mendekati ambang toleransi
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-normal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Peringatan Diakui
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--status-normal)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {acknowledgedCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Telah ditindaklanjuti oleh teknisi
          </div>
        </div>
      </div>

      {/* Main Alert Center List */}
      <AlertCenter
        alerts={alerts}
        isLoading={isLoading}
        onAcknowledge={onAcknowledge}
        feedbackMessage={feedbackMessage}
      />

      {/* Standard Operating Procedure (SOP) Reference */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Protokol Tanggap Darurat Budidaya Lobster (SOP)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ background: 'var(--bg-inset)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--status-critical)', display: 'block', marginBottom: '0.35rem' }}>
              1. Penurunan Oksigen Terlarut (DO &lt; 3.5 mg/L)
            </strong>
            Nyalakan blower aerator cadangan, buka katup aerasi venturi, kurangi pemberian pakan pelet berlebih, dan periksa sirkulasi pompa filter air.
          </div>

          <div style={{ background: 'var(--bg-inset)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--status-critical)', display: 'block', marginBottom: '0.35rem' }}>
              2. Asidifikasi Perairan (pH &lt; 7.0)
            </strong>
            Lakukan pergantian air bertahap 15-20% dengan air laut segar bersalinitas seimbang, dan tambahkan larutan buffer kalsium karbonat secara terkontrol.
          </div>

          <div style={{ background: 'var(--bg-inset)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--status-warning)', display: 'block', marginBottom: '0.35rem' }}>
              3. Kenaikan Suhu Ekstrem (&gt; 30.5 °C)
            </strong>
            Tutup paranet pelindung matahari bak pemeliharaan, aktifkan sistem chiller atau sirkulasi air laut dalam untuk menstabilkan suhu ke 27-29 °C.
          </div>
        </div>
      </div>
    </div>
  );
};
