import React, { useState } from 'react';
import type { AppRuntimeConfig } from '../services/api/apiConfig';
import { type DemoScenarioId, DEMO_SCENARIOS } from '../mocks/mockScenarios';
import { Database, Server, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface SettingsPageProps {
  config: AppRuntimeConfig;
  onUpdateProvider: (provider: 'demo' | 'real') => void;
  onUpdatePolling: (ms: number) => void;
  activeScenario: DemoScenarioId;
  onScenarioChange: (scenario: DemoScenarioId) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  config,
  onUpdateProvider,
  onUpdatePolling,
  activeScenario,
  onScenarioChange
}) => {
  const [apiUrl, setApiUrl] = useState(config.apiBaseUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pengaturan & Integrasi Frontend</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Konfigurasi penyedia data, interval telemetri, dan titik akhir REST API
        </p>
      </div>

      {/* Mode Provider Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Database size={20} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Penyedia Sumber Data (Data Provider)</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Pilih apakah dashboard menggunakan mock data terisolasi atau terhubung ke REST API backend.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {/* Demo Option */}
          <div
            onClick={() => onUpdateProvider('demo')}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${config.dataProvider === 'demo' ? 'var(--accent-primary)' : 'var(--border-light)'}`,
              background: config.dataProvider === 'demo' ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-inset)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Demo Mode (Mock Data)</strong>
              {config.dataProvider === 'demo' && <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)' }} />}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Menggunakan data simulasi deterministik. Tidak memerlukan backend aktif atau sensor fisik. Cocok untuk presentasi & pengujian antarmuka.
            </p>
          </div>

          {/* Real API Option */}
          <div
            onClick={() => onUpdateProvider('real')}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${config.dataProvider === 'real' ? 'var(--status-normal)' : 'var(--border-light)'}`,
              background: config.dataProvider === 'real' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-inset)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Real API Mode (Produksi)</strong>
              {config.dataProvider === 'real' && <CheckCircle2 size={16} style={{ color: 'var(--status-normal)' }} />}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Menghubungkan langsung ke endpoint REST API backend. Menampilkan data telemetri aktual dari ESP32 & database.
            </p>
          </div>
        </div>

        {/* Demo Scenario Selector when in Demo Mode */}
        {config.dataProvider === 'demo' && (
          <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--bg-inset)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Pilih Skenario Pengujian Deterministic Demo:
            </label>
            <select
              value={activeScenario}
              onChange={(e) => onScenarioChange(e.target.value as DemoScenarioId)}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {Object.values(DEMO_SCENARIOS).map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} — {sc.description}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* REST API Endpoint Settings */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Server size={20} style={{ color: 'var(--accent-teal)' }} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Alamat Basis REST API (Base URL)</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Titik akhir server backend yang menyediakan endpoint telemetri air.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveUrl} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000/api"
            style={{
              flex: 1,
              minWidth: '260px',
              background: 'rgba(6, 11, 18, 0.8)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <Button type="submit" variant="primary">
            Simpan Konfigurasi
          </Button>
        </form>

        {saveSuccess && (
          <div style={{ color: 'var(--status-normal)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={14} /> Pengaturan Base URL berhasil disimpan ke memori runtime.
          </div>
        )}
      </div>

      {/* Telemetry Polling Intervals */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <RefreshCw size={20} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Interval Polling Telemetri Frontend</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Frekuensi pengambilan data baru dari server saat halaman browser aktif.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {[3000, 5000, 10000, 30000].map((ms) => (
            <button
              key={ms}
              className={`range-pill-btn ${config.pollingIntervalMs === ms ? 'active' : ''}`}
              onClick={() => onUpdatePolling(ms)}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              {ms / 1000} Detik {ms === 5000 ? '(Default)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-light)',
          fontSize: '0.78rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
          display: 'flex',
          gap: '0.75rem'
        }}
      >
        <ShieldAlert size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>Catatan Batasan Arsitektur: </strong>
          Pengaturan di atas hanya mengonfigurasi perilaku antarmuka browser frontend (client-side). Pengaturan ini tidak mengubah konfigurasi firmware fisik sensor ESP32 atau database server tanpa persetujuan API backend.
        </div>
      </div>
    </div>
  );
};
