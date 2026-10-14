import React from 'react';
import { Sliders, RefreshCw, Play, Pause } from 'lucide-react';
import type { DemoScenarioId } from '../../mocks/mockScenarios';

interface BentoControlsCardProps {
  dataProvider: 'demo' | 'real';
  activeScenario: DemoScenarioId;
  onScenarioChange: (s: DemoScenarioId) => void;
  onProviderChange: (p: 'demo' | 'real') => void;
  isPollingPaused: boolean;
  onTogglePolling: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  pollingIntervalMs: number;
  onIntervalChange: (ms: number) => void;
}

export const BentoControlsCard: React.FC<BentoControlsCardProps> = ({
  dataProvider,
  activeScenario,
  onScenarioChange,
  onProviderChange,
  isPollingPaused,
  onTogglePolling,
  onManualRefresh,
  isRefreshing,
  pollingIntervalMs,
  onIntervalChange: _onIntervalChange
}) => {
  const scenarios: Array<{ id: DemoScenarioId; label: string }> = [
    { id: 'normal', label: '1. Optimal (Normal)' },
    { id: 'warning_hypoxia', label: '2. Hypoxia (DO Rendah)' },
    { id: 'critical_acidification', label: '3. pH Asam Ekstrem' },
    { id: 'stale_data', label: '4. Telemetri Usang' },
    { id: 'disconnected', label: '5. Node Terputus' }
  ];

  return (
    <div className="bento-card bento-controls-card">
      <div className="bento-card-header">
        <div className="card-title-with-info">
          <Sliders size={13} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="bento-card-title">Kontrol & Simulasi IoT</h3>
        </div>

        <div className="controls-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${dataProvider === 'demo' ? 'active' : ''}`}
            onClick={() => onProviderChange('demo')}
            title="Mode Demo / Simulasi Internal"
          >
            Demo
          </button>
          <button
            type="button"
            className={`mode-btn ${dataProvider === 'real' ? 'active' : ''}`}
            onClick={() => onProviderChange('real')}
            title="Koneksi Gateway API Real Edge ESP32"
          >
            Real API
          </button>
        </div>
      </div>

      {/* Minimal Single-Row Scenario & Action Controls */}
      <div className="bento-controls-minimal-row">
        <select
          className="bento-select bento-select-compact"
          value={activeScenario}
          onChange={(e) => onScenarioChange(e.target.value as DemoScenarioId)}
          disabled={dataProvider === 'real'}
          title="Pilih skenario simulasi telemetri"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <button
          type="button"
          className={`bento-action-btn-mini ${isPollingPaused ? 'paused' : 'live'}`}
          onClick={onTogglePolling}
          title={isPollingPaused ? 'Lanjutkan Auto-Polling' : 'Jeda Auto-Polling'}
        >
          {isPollingPaused ? <Play size={11} /> : <Pause size={11} />}
          <span>{isPollingPaused ? 'Jeda' : `${pollingIntervalMs / 1000}s`}</span>
        </button>

        <button
          type="button"
          className="bento-action-btn-mini btn-refresh"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          title="Sinkronisasi Manual Telemetri"
        >
          <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Sync</span>
        </button>
      </div>
    </div>
  );
};

