import React from 'react';
import { Sparkles, ArrowRight, Radio } from 'lucide-react';
import { DEMO_SCENARIOS, type DemoScenarioId } from '../../mocks/mockScenarios';
import { Button } from '../ui/Button';

interface DemoScenarioBannerProps {
  dataProvider: 'demo' | 'real';
  activeScenario: DemoScenarioId;
  onScenarioChange: (scenario: DemoScenarioId) => void;
  onSwitchToReal: () => void;
  onSwitchToDemo: () => void;
}

export const DemoScenarioBanner: React.FC<DemoScenarioBannerProps> = ({
  dataProvider,
  activeScenario,
  onScenarioChange,
  onSwitchToReal,
  onSwitchToDemo
}) => {
  if (dataProvider === 'real') {
    return (
      <div
        style={{
          background: 'var(--status-normal-bg)',
          border: '1px solid var(--status-normal-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.55rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <Radio size={15} style={{ color: 'var(--status-normal)' }} />
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
              Mode Produksi (Real REST API Aktif)
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
              Dashboard mengambil telemetri langsung dari backend server.
            </span>
          </div>
        </div>

        <Button size="sm" variant="secondary" onClick={onSwitchToDemo}>
          Beralih ke Demo Mode
        </Button>
      </div>
    );
  }

  const currentDef = DEMO_SCENARIOS[activeScenario] || DEMO_SCENARIOS.normal;

  return (
    <div className="demo-banner">
      <div className="demo-banner-info">
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary-bg)',
            border: '1px solid var(--accent-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}
        >
          <Sparkles size={14} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
              DEMO MODE (Simulasi Data Terkontrol)
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--accent-primary-bg)',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                border: '1px solid var(--accent-primary-border)'
              }}
            >
              {currentDef.badge}
            </span>
          </div>

          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
            {currentDef.description}
          </div>
        </div>
      </div>

      <div className="demo-banner-actions">
        {/* Scenario Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Skenario:</span>
          <select
            value={activeScenario}
            onChange={(e) => onScenarioChange(e.target.value as DemoScenarioId)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-primary)',
              padding: '0.25rem 0.7rem',
              fontSize: '0.72rem',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {Object.values(DEMO_SCENARIOS).map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Switch to real API button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onSwitchToReal}
          title="Hubungkan ke REST API nyata"
        >
          Gunakan Real API <ArrowRight size={12} />
        </Button>
      </div>
    </div>
  );
};
