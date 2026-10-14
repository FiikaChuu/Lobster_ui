import React from 'react';
import type { FuzzyClassificationResult } from '../../types/classification';
import { formatDateTime } from '../../utils/dateFormatter';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ClassificationCardProps {
  classification?: FuzzyClassificationResult;
  isLoading?: boolean;
}

export const ClassificationCard: React.FC<ClassificationCardProps> = ({
  classification,
  isLoading = false
}) => {
  if (isLoading || !classification) {
    return (
      <div className="fuzzy-panel">
        <div className="fuzzy-header">
          <div className="fuzzy-title-group">
            <h2>Klasifikasi Mutu Air (Fuzzy Logic)</h2>
            <p>Memuat hasil evaluasi backend...</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    classification: level,
    rawClassification,
    evaluatedAt,
    confidence,
    summary,
    triggeringFactors = [],
    recommendation
  } = classification;

  // Visual treatments
  const getIcon = () => {
    switch (level) {
      case 'normal':
        return <ShieldCheck size={20} style={{ color: 'var(--status-normal)' }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ color: 'var(--status-warning)' }} />;
      case 'critical':
        return <AlertOctagon size={20} style={{ color: 'var(--status-critical)' }} />;
      default:
        return <HelpCircle size={20} style={{ color: 'var(--status-unknown)' }} />;
    }
  };

  const getStatusLabel = () => {
    if (rawClassification) return rawClassification.toUpperCase();
    switch (level) {
      case 'normal': return 'OPTIMAL (NORMAL)';
      case 'warning': return 'WASPADA (WARNING)';
      case 'critical': return 'KRITIS (CRITICAL)';
      default: return 'MENUNGGU HASIL KLASIFIKASI';
    }
  };

  const ringColor =
    level === 'normal' ? 'var(--status-normal)' :
    level === 'warning' ? 'var(--status-warning)' :
    level === 'critical' ? 'var(--status-critical)' :
    'var(--status-unknown)';

  // Calculate circular stroke percentage (inspired by Image 3 match ring)
  const percent = confidence !== undefined ? Math.round(confidence * 100) : (level === 'normal' ? 95 : level === 'warning' ? 65 : level === 'critical' ? 25 : 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="fuzzy-panel">
      {/* Header */}
      <div className="fuzzy-header">
        <div className="fuzzy-title-group">
          <h2>Klasifikasi Mutu Air (Fuzzy Logic)</h2>
          <p>Inferensi server-side kondisi budidaya lobster</p>
        </div>

        <Badge status={level} pulse={level === 'critical' || level === 'warning'} />
      </div>

      {/* Circular Gauge & Status Headline (Inspired by Reference Image 3) */}
      <div className="fuzzy-gauge-wrapper">
        <div className="circular-gauge">
          <svg viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="7"
            />
            {/* Luminous Colored Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={ringColor}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: `drop-shadow(0 0 6px ${ringColor})`
              }}
            />
          </svg>

          <div className="gauge-center-content">
            <span className="gauge-percentage">{percent}%</span>
            <span className="gauge-label">Indeks</span>
          </div>
        </div>

        <div className="fuzzy-summary-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getIcon()}
            <span className={`fuzzy-status-text ${level}`}>{getStatusLabel()}</span>
          </div>

          <p className="fuzzy-explanation">{summary}</p>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Dievaluasi: {evaluatedAt ? formatDateTime(evaluatedAt) : 'Menunggu kalkulasi backend'}
          </div>
        </div>
      </div>

      {/* Triggering Factors Table (Backend-Supplied) */}
      {triggeringFactors.length > 0 && (
        <div className="fuzzy-factors-list">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Faktor Pemicu (Dilaporkan oleh Backend):
          </div>
          {triggeringFactors.map((f, i) => (
            <div key={i} className="factor-item">
              <span className="factor-name">{f.parameter}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="factor-value">
                  {f.observedValue} {f.unit || ''}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-pill)',
                    background: f.influence === 'high' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: f.influence === 'high' ? 'var(--status-critical)' : 'var(--text-secondary)'
                  }}
                >
                  Pengaruh: {f.influence}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation if provided */}
      {recommendation && (
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.8rem',
            color: '#e0f2fe',
            lineHeight: 1.4
          }}
        >
          <strong style={{ color: 'var(--accent-primary)' }}>Rekomendasi Tindakan: </strong>
          {recommendation}
        </div>
      )}

      {/* Backend Disclaimer Note */}
      <div className="fuzzy-disclaimer-note">
        <Info size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
        Klasifikasi air diproses sepenuhnya oleh mesin inferensi fuzzy logic pada backend server. Frontend tidak melakukan klasifikasi tiruan atau memanipulasi ambang batas ilmiah.
      </div>
    </div>
  );
};
