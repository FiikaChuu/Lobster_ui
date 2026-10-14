import React, { useState } from 'react';
import { Play, Pause, RefreshCw, Clock, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { requestBackendStartMonitoring, requestBackendPauseMonitoring } from '../../services/api/deviceService';

interface MonitoringControlsProps {
  isPollingPaused: boolean;
  onTogglePolling: () => void;
  onManualRefresh: () => Promise<void>;
  isRefreshing: boolean;
  pollingIntervalMs: number;
  onIntervalChange: (ms: number) => void;
  activePondId: string;
  dataProvider: 'demo' | 'real';
}

export const MonitoringControls: React.FC<MonitoringControlsProps> = ({
  isPollingPaused,
  onTogglePolling,
  onManualRefresh,
  isRefreshing,
  pollingIntervalMs,
  onIntervalChange,
  activePondId,
  dataProvider
}) => {
  const [backendActionLoading, setBackendActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleBackendStart = async () => {
    setBackendActionLoading(true);
    setFeedback(null);
    try {
      if (dataProvider === 'demo') {
        // Clear demo response
        setFeedback({
          type: 'success',
          message: 'Backend Start Monitoring disimulasikan (Demo Mode). Pada produksi, endpoint POST /api/monitoring/start akan dipanggil.'
        });
      } else {
        const res = await requestBackendStartMonitoring(activePondId);
        setFeedback({ type: 'success', message: res.message });
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menghubungi backend start monitoring.'
      });
    } finally {
      setBackendActionLoading(false);
    }
  };

  const handleBackendPause = async () => {
    setBackendActionLoading(true);
    setFeedback(null);
    try {
      if (dataProvider === 'demo') {
        setFeedback({
          type: 'success',
          message: 'Backend Pause Monitoring disimulasikan (Demo Mode). Pada produksi, endpoint POST /api/monitoring/pause akan dipanggil.'
        });
      } else {
        const res = await requestBackendPauseMonitoring(activePondId);
        setFeedback({ type: 'success', message: res.message });
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menghubungi backend pause monitoring.'
      });
    } finally {
      setBackendActionLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Kontrol Pemantauan & Telemetri</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Manajemen refresh frontend browser dan sinyal akuisisi backend
          </p>
        </div>

        {/* Polling interval selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Interval Polling Frontend:</span>
          <select
            value={pollingIntervalMs}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            style={{
              background: 'rgba(18, 30, 48, 0.8)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-primary)',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={3000}>3 Detik (Cepat)</option>
            <option value={5000}>5 Detik (Default)</option>
            <option value={10000}>10 Detik</option>
            <option value={30000}>30 Detik</option>
            <option value={60000}>60 Detik (Hemat)</option>
          </select>
        </div>
      </div>

      {/* Control Buttons Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Frontend Polling Toggle */}
        <Button
          variant={isPollingPaused ? 'primary' : 'secondary'}
          size="sm"
          icon={isPollingPaused ? <Play size={14} /> : <Pause size={14} />}
          onClick={onTogglePolling}
        >
          {isPollingPaused ? 'Lanjutkan Auto-Refresh' : 'Jeda Auto-Refresh (Frontend)'}
        </Button>

        {/* Manual Refresh */}
        <Button
          variant="secondary"
          size="sm"
          isLoading={isRefreshing}
          icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
          onClick={onManualRefresh}
        >
          Perbarui Manual
        </Button>

        {/* Backend Acquisition Controls (Proposal endpoints) */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sliders size={13} /> Sinyal Backend:
          </span>
          <Button
            size="sm"
            variant="secondary"
            isLoading={backendActionLoading}
            onClick={handleBackendStart}
            title="Kirim sinyal start monitoring ke REST API"
          >
            Start Backend
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isLoading={backendActionLoading}
            onClick={handleBackendPause}
            title="Kirim sinyal pause monitoring ke REST API"
          >
            Pause Backend
          </Button>
        </div>
      </div>

      {/* Operation Feedback */}
      {feedback && (
        <div
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--status-normal-border)' : 'var(--status-critical-border)'}`,
            color: feedback.type === 'success' ? 'var(--status-normal)' : 'var(--status-critical)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
