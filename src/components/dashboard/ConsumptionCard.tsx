import React, { useRef, useState, useEffect } from 'react';
import { Zap, Activity } from 'lucide-react';

interface ConsumptionCardProps {
  powerKw?: number;
  gridVoltage?: number;
  loadLevelPercent?: number;
  currentAmps?: number;
  frequencyHz?: number;
  energyTodayKwh?: number;
  onAction?: (action: string) => void;
}

export const ConsumptionCard: React.FC<ConsumptionCardProps> = ({
  powerKw = 56.46,
  gridVoltage = 380,
  loadLevelPercent = 56,
  currentAmps = 85.8,
  frequencyHz = 50.0,
  energyTodayKwh = 428.5,
  onAction: _onAction
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // When card height is >= 110px, activate extended telemetry view
        setIsExpanded(entry.contentRect.height >= 110);
      }
    });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bento-card consumption-card ${isExpanded ? 'consumption-card-expanded' : 'consumption-card-compact'}`}
    >
      <div className="consumption-compact-header">
        <div className="card-title-with-info">
          <Zap size={13} style={{ color: '#0284c7' }} />
          <h3 className="bento-card-title">Consumption</h3>
        </div>
        <div className="consumption-compact-metric">
          <span className="consumption-main-val">{powerKw.toFixed(2)}</span>
          <span className="consumption-unit">kW</span>
          <span className="consumption-pln-badge">PLN 100%</span>
        </div>
      </div>

      {/* Modern Compact Level Bar */}
      <div className="consumption-compact-track-row">
        <div className="consumption-track">
          <div
            className="consumption-fill"
            style={{ width: `${Math.min(Math.max(loadLevelPercent, 0), 100)}%` }}
          />
        </div>
        <span className="consumption-sublabel-tiny">{loadLevelPercent}% Beban Jaringan</span>
      </div>

      {/* Dynamic Telemetry Details (appears automatically when top card is compact) */}
      {isExpanded && (
        <div className="consumption-extended-telemetry">
          <div className="consumption-telemetry-grid">
            <div className="consumption-telemetry-item">
              <span className="telemetry-label">Tegangan (3Ø)</span>
              <span className="telemetry-val">{gridVoltage} <small className="telemetry-unit">V</small></span>
            </div>
            <div className="consumption-telemetry-item">
              <span className="telemetry-label">Arus Beban</span>
              <span className="telemetry-val">{currentAmps.toFixed(1)} <small className="telemetry-unit">A</small></span>
            </div>
            <div className="consumption-telemetry-item">
              <span className="telemetry-label">Frekuensi Grid</span>
              <span className="telemetry-val">{frequencyHz.toFixed(1)} <small className="telemetry-unit">Hz</small></span>
            </div>
            <div className="consumption-telemetry-item">
              <span className="telemetry-label">Total Hari Ini</span>
              <span className="telemetry-val">{energyTodayKwh.toFixed(1)} <small className="telemetry-unit">kWh</small></span>
            </div>
          </div>
          <div className="consumption-status-footnote">
            <Activity size={10} className="footnote-icon" />
            <span>Koneksi gardu trafo stabil • Efisiensi daya 98.4%</span>
          </div>
        </div>
      )}
    </div>
  );
};

