import React from 'react';
import { Activity, Clock, CheckCircle2, AlertTriangle, AlertOctagon, Lightbulb } from 'lucide-react';
import type { FuzzyClassificationResult, TriggeringFactor } from '../../types/classification';

interface BentoStockMetricsCardProps {
  classification?: FuzzyClassificationResult;
  isLoading: boolean;
}

export const BentoStockMetricsCard: React.FC<BentoStockMetricsCardProps> = ({
  classification,
  isLoading
}) => {
  const level = classification?.classification ?? 'pending';

  // Overall label in card header
  const label = classification?.rawClassification ?? (
    level === 'normal' ? 'OPTIMAL' :
    level === 'warning' ? 'WASPADA' :
    level === 'critical' ? 'KRITIS' :
    'STANDBY'
  );

  // Confidence / Score from backend (no fake mock numbers generated)
  const confidence = classification?.confidence;
  const hasConfidence = typeof confidence === 'number' && !isNaN(confidence);
  const score = hasConfidence ? Math.round(confidence * 100) : null;

  // Stock Metric: Feed Conversion Ratio (Target: 1.2 - 1.4)
  const fcrVal = 1.3;
  const fcrTarget = '1.2 – 1.4';

  // Timestamp formatting
  const evalAt = classification?.evaluatedAt;
  const { evaluatedTimeStr, evaluatedDateStr } = React.useMemo(() => {
    if (!evalAt) {
      return { evaluatedTimeStr: null, evaluatedDateStr: null };
    }
    const d = new Date(evalAt);
    if (isNaN(d.getTime())) {
      return { evaluatedTimeStr: null, evaluatedDateStr: null };
    }
    return {
      evaluatedTimeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      evaluatedDateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  }, [evalAt]);

  // Primary status presentation
  const statusBadge = level === 'critical'
    ? { icon: <AlertOctagon size={13} className="headline-status-icon" />, text: 'Kondisi Perairan Kritis', variant: 'critical' }
    : level === 'warning'
    ? { icon: <AlertTriangle size={13} className="headline-status-icon" />, text: 'Kondisi Air Sub-Optimal', variant: 'warning' }
    : level === 'normal'
    ? { icon: <CheckCircle2 size={13} className="headline-status-icon" />, text: 'Kondisi Air Optimal', variant: 'normal' }
    : { icon: <Clock size={13} className="headline-status-icon" />, text: 'Menunggu Evaluasi Mutu Air', variant: 'pending' };

  // Summary explanation text
  const summaryText = classification?.summary || (
    level === 'normal'
      ? 'Mutu perairan optimal dan sesuai untuk standar baku mutu lobster air laut.'
      : level === 'warning'
      ? 'Parameter perairan memerlukan pemantauan untuk mencegah penurunan mutu.'
      : level === 'critical'
      ? 'Kondisi perairan kritis terdeteksi, segera lakukan tindakan penanganan darurat.'
      : 'Belum ada evaluasi inferensi perairan dari backend.'
  );

  const factors: TriggeringFactor[] = classification?.triggeringFactors ?? [];
  const recommendation = classification?.recommendation;

  // Check if all factors are normal/low influence (use compact 2x2 grid)
  const isAllLowFactors = factors.length > 0 && factors.every((f) => !f.influence || f.influence === 'low');

  // Loading state
  if (isLoading) {
    return (
      <div className="bento-card bento-stock-card">
        <div className="bento-card-header bento-stock-header">
          <h3 className="bento-card-title">Water Health & Stock Metrics</h3>
          <span className="bento-status-pill pill-pending">MEMUAT...</span>
        </div>
        <div className="bento-stock-loading">
          <Clock size={16} className="stock-loading-icon" />
          <span className="stock-loading-text">Mengevaluasi telemetri inferensi fuzzy...</span>
        </div>
      </div>
    );
  }

  // Standby / Empty state when classification is not provided
  if (!classification) {
    return (
      <div className="bento-card bento-stock-card">
        <div className="bento-card-header bento-stock-header">
          <h3 className="bento-card-title">Water Health & Stock Metrics</h3>
          <span className="bento-status-pill pill-pending">STANDBY</span>
        </div>
        <div className="bento-stock-empty">
          <Activity size={16} className="stock-empty-icon" />
          <span className="stock-empty-title">Data Inferensi Belum Tersedia</span>
          <p className="stock-empty-desc">Sistem monitoring siap menerima telemetri sensor untuk evaluasi mutu air kolam.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-card bento-stock-card">
      {/* 1. Header with Title and Dynamic Adaptive Status Badge */}
      <div className="bento-card-header bento-stock-header">
        <h3 className="bento-card-title">Water Health & Stock Metrics</h3>
        <span className={`bento-status-pill pill-${level}`}>
          {label}
        </span>
      </div>

      {/* 2. Key Metrics Bar (Compact, Space-Efficient, Unclipped) */}
      <div className="bento-stock-metrics-strip">
        {/* Metric A: Mutu Air (Fuzzy Index / Confidence) */}
        <div className="stock-metric-tile">
          <div className="stock-metric-header">
            <span className="stock-metric-name">Mutu Air (Fuzzy)</span>
            <span className={`stock-metric-indicator ind-${level}`} />
          </div>
          <div className="stock-metric-value-row">
            <span className="stock-metric-val">
              {score !== null ? `${score}%` : '--'}
            </span>
            <span className="stock-metric-sub">Biotic Capacity</span>
          </div>
          <div className="stock-metric-progress-track">
            <div
              className={`stock-metric-progress-bar bar-${level}`}
              style={{ width: `${score !== null ? Math.min(Math.max(score, 6), 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Metric B: Rasio Pakan (FCR) */}
        <div className="stock-metric-tile">
          <div className="stock-metric-header">
            <span className="stock-metric-name">Rasio Pakan (FCR)</span>
            <span className="stock-metric-target-tag">Target {fcrTarget}</span>
          </div>
          <div className="stock-metric-value-row">
            <span className="stock-metric-val">{fcrVal.toFixed(1)}</span>
            <span className="stock-metric-sub">Feed Conversion</span>
          </div>
          <div className="stock-metric-progress-track">
            <div
              className="stock-metric-progress-bar bar-fcr"
              style={{ width: `${Math.min(Math.max((fcrVal / 2.0) * 100, 10), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Status Headline & Summary Box (Unified) */}
      <div className={`stock-status-summary-box banner-${statusBadge.variant}`}>
        <div className="status-summary-top">
          <div className="status-summary-title-wrap">
            <span className="headline-icon-wrap">{statusBadge.icon}</span>
            <span className="headline-status-name">{statusBadge.text}</span>
          </div>
          {evaluatedTimeStr && (
            <span className="status-eval-time">
              <Clock size={9} />
              <span>{evaluatedTimeStr}</span>
            </span>
          )}
        </div>
        <p className="status-summary-desc">{summaryText}</p>
      </div>

      {/* 4. Contributing Factors (Compact 2x2 Grid for Normal, or List for Warning/Critical) */}
      {factors.length > 0 ? (
        <div className="stock-factors-section">
          <div className="factors-header">
            <Activity size={11} className="factors-icon" />
            <span className="factors-title">Parameter Berpengaruh</span>
            <span className="factors-count">({factors.length})</span>
          </div>

          {isAllLowFactors ? (
            /* Compact 2x2 Grid: saves massive vertical space so recommendation is never sunken */
            <div className="stock-factors-grid">
              {factors.map((f, idx) => (
                <div key={idx} className="stock-factor-grid-cell">
                  <span className="factor-grid-name" title={f.parameter}>
                    {f.parameter}
                  </span>
                  <div className="factor-grid-val-wrap">
                    <span className="factor-grid-val">
                      {f.observedValue} {f.unit ? <small className="factor-unit">{f.unit}</small> : null}
                    </span>
                    <span className="factor-grid-badge weight-low">
                      OK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Diagnostic List with Notes for Warning/Critical */
            <div className="stock-factors-list">
              {factors.map((f, idx) => {
                const influenceClass = `weight-${f.influence || 'low'}`;
                const influenceLabel =
                  f.influence === 'high' ? 'TINGGI' :
                  f.influence === 'moderate' ? 'SEDANG' :
                  'RENDAH';

                return (
                  <div key={idx} className="stock-factor-item">
                    <div className="stock-factor-top">
                      <span className="factor-name" title={f.parameter}>
                        {f.parameter}
                      </span>
                      <div className="factor-data-group">
                        <span className="factor-val">
                          {f.observedValue}
                          {f.unit ? <small className="factor-unit"> {f.unit}</small> : null}
                        </span>
                        <span className={`factor-badge ${influenceClass}`}>
                          {influenceLabel}
                        </span>
                      </div>
                    </div>
                    {f.note && (
                      <div className="factor-note">
                        {f.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : level === 'normal' ? (
        <div className="stock-factors-empty">
          <CheckCircle2 size={11} className="stock-factors-empty-icon" />
          <span>Seluruh parameter perairan berada dalam batas toleransi aman.</span>
        </div>
      ) : null}

      {/* 5. Actionable Recommendation (Prominent, Guaranteed Full Visibility) */}
      {recommendation ? (
        <div className={`stock-rec-box rec-${level}`}>
          <div className="stock-rec-header">
            <Lightbulb size={12} className="stock-rec-icon" />
            <span className="stock-rec-title">Rekomendasi Tindakan:</span>
          </div>
          <p className="stock-rec-text">{recommendation}</p>
        </div>
      ) : null}

      {/* 6. Evaluation Metadata Footer */}
      {evalAt && (
        <div className="stock-eval-footer">
          <Clock size={10} className="stock-eval-icon" />
          <span className="stock-eval-text">
            Evaluasi: {evaluatedDateStr} • {evaluatedTimeStr} WIB
          </span>
        </div>
      )}
    </div>
  );
};


