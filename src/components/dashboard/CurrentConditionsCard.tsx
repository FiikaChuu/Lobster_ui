import React, { useId } from 'react';
import { Droplets, Thermometer, Waves, Wind, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ParameterKey, ParameterSummary, HistoricalDataPoint } from '../../types/sensor';
import { getMonotoneSplinePath, getMonotoneAreaPath } from '../../utils/splinePath';

interface CurrentConditionsCardProps {
  parameters?: Record<ParameterKey, ParameterSummary>;
  chartHistory?: Record<ParameterKey, HistoricalDataPoint[]>;
  isLoading: boolean;
  onViewDetails?: () => void;
  lastUpdatedText?: string;
}

const MiniSparkline: React.FC<{
  data?: HistoricalDataPoint[];
  color: string;
  status?: string;
}> = ({ data = [], color, status = 'normal' }) => {
  const reactId = useId();
  const gradId = `mini-spark-${reactId.replace(/:/g, '')}`;

  const validPoints = data.filter((d) => d.value !== null && !isNaN(d.value as number));
  const slice = validPoints.slice(-10);

  const strokeColor =
    status === 'critical' ? '#ef4444' :
    status === 'warning' ? '#f59e0b' :
    color;

  if (slice.length < 2) {
    return (
      <svg width="72" height="22" viewBox="0 0 72 22" className="mini-sparkline-svg" aria-hidden="true">
        <path d="M 2,11 Q 36,9 70,11" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="2,2" />
      </svg>
    );
  }

  const values = slice.map((d) => d.value as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 0.05;

  const width = 72;
  const height = 22;
  const paddingY = 2;
  const usableH = height - paddingY * 2;

  const coords = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * (width - 6) + 3;
    const y = height - paddingY - ((val - min) / range) * usableH;
    return { x, y };
  });

  const linePath = getMonotoneSplinePath(coords);
  const areaPath = getMonotoneAreaPath(coords, height);
  const lastPt = coords[coords.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mini-sparkline-svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
          <stop offset="65%" stopColor={strokeColor} stopOpacity="0.08" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt.x} cy={lastPt.y} r="2.2" fill={strokeColor} />
      <circle cx={lastPt.x} cy={lastPt.y} r="4.5" fill={strokeColor} opacity="0.22" />
    </svg>
  );
};

export const CurrentConditionsCard: React.FC<CurrentConditionsCardProps> = ({
  parameters,
  chartHistory,
  onViewDetails
}) => {
  const getParam = (key: ParameterKey, fallbackVal: number, fallbackUnit: string) => {
    const p = parameters?.[key];
    const val = p?.current !== null && p?.current !== undefined ? p.current : fallbackVal;
    const unit = p?.unit || fallbackUnit;
    const status = p?.status || 'normal';
    const trend = p?.trend || 'stable';
    const history = chartHistory?.[key] || p?.history || [];
    return { val, unit, status, trend, history };
  };

  const temp = getParam('temperature', 28.2, '°C');
  const sal = getParam('salinity', 7.8, 'ppt');
  const doParam = getParam('dissolvedOxygen', 6.4, 'mg/L');
  const ph = getParam('ph', 7.2, 'pH');

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable' | 'unknown') => {
    if (trend === 'up') return <TrendingUp size={11} className="trend-icon trend-up" />;
    if (trend === 'down') return <TrendingDown size={11} className="trend-icon trend-down" />;
    return <Minus size={11} className="trend-icon trend-stable" />;
  };

  const getStatusLabel = (s: string) => {
    if (s === 'critical') return 'Kritis';
    if (s === 'warning') return 'Warning';
    return 'Normal';
  };

  return (
    <div className="bento-card current-conditions-card">
      {/* Header without dot button per explicit design instruction */}
      <div className="bento-card-header">
        <div className="card-title-with-info">
          <Droplets size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
          <h3 className="bento-card-title">Current Condition</h3>
        </div>
      </div>

      {/* 2x2 Grid of Parameters with Clean Industrial Layout */}
      <div className="current-conditions-grid">
        {/* Card 1: Suhu Air */}
        <div className="condition-item condition-temp">
          <div className="condition-item-content">
            <div className="condition-item-top">
              <span className="condition-label">
                <Thermometer size={13} className="condition-icon icon-temp" />
                Suhu Air
              </span>
              <div className="condition-meta-right">
                <span className="condition-trend-wrap" title={`Tren: ${temp.trend}`}>
                  {renderTrendIcon(temp.trend)}
                </span>
                <span className={`condition-status-dot dot-${temp.status}`} title={`Status: ${temp.status}`} />
              </div>
            </div>
            <div className="condition-val-group">
              <span className="condition-val">{temp.val.toFixed(1)}</span>
              <span className="condition-unit">{temp.unit}</span>
            </div>
            <div className="condition-bottom-row">
              <span className={`condition-status-pill status-${temp.status}`}>
                {getStatusLabel(temp.status)}
              </span>
              <div className="condition-sparkline-wrap">
                <MiniSparkline data={temp.history} color="#0284c7" status={temp.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Salinitas */}
        <div className="condition-item condition-salinity">
          <div className="condition-item-content">
            <div className="condition-item-top">
              <span className="condition-label">
                <Waves size={13} className="condition-icon icon-salinity" />
                Salinitas
              </span>
              <div className="condition-meta-right">
                <span className="condition-trend-wrap" title={`Tren: ${sal.trend}`}>
                  {renderTrendIcon(sal.trend)}
                </span>
                <span className={`condition-status-dot dot-${sal.status}`} title={`Status: ${sal.status}`} />
              </div>
            </div>
            <div className="condition-val-group">
              <span className="condition-val">{sal.val.toFixed(1)}</span>
              <span className="condition-unit">{sal.unit}</span>
            </div>
            <div className="condition-bottom-row">
              <span className={`condition-status-pill status-${sal.status}`}>
                {getStatusLabel(sal.status)}
              </span>
              <div className="condition-sparkline-wrap">
                <MiniSparkline data={sal.history} color="#06b6d4" status={sal.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Oksigen (DO) */}
        <div className="condition-item condition-oxygen">
          <div className="condition-item-content">
            <div className="condition-item-top">
              <span className="condition-label">
                <Wind size={13} className="condition-icon icon-oxygen" />
                Oksigen (DO)
              </span>
              <div className="condition-meta-right">
                <span className="condition-trend-wrap" title={`Tren: ${doParam.trend}`}>
                  {renderTrendIcon(doParam.trend)}
                </span>
                <span className={`condition-status-dot dot-${doParam.status}`} title={`Status: ${doParam.status}`} />
              </div>
            </div>
            <div className="condition-val-group">
              <span className="condition-val">{doParam.val.toFixed(1)}</span>
              <span className="condition-unit">{doParam.unit}</span>
            </div>
            <div className="condition-bottom-row">
              <span className={`condition-status-pill status-${doParam.status}`}>
                {getStatusLabel(doParam.status)}
              </span>
              <div className="condition-sparkline-wrap">
                <MiniSparkline data={doParam.history} color="#8b5cf6" status={doParam.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Keasaman (pH) */}
        <div className="condition-item condition-ph">
          <div className="condition-item-content">
            <div className="condition-item-top">
              <span className="condition-label">
                <Droplets size={13} className="condition-icon icon-ph" />
                Keasaman (pH)
              </span>
              <div className="condition-meta-right">
                <span className="condition-trend-wrap" title={`Tren: ${ph.trend}`}>
                  {renderTrendIcon(ph.trend)}
                </span>
                <span className={`condition-status-dot dot-${ph.status}`} title={`Status: ${ph.status}`} />
              </div>
            </div>
            <div className="condition-val-group">
              <span className="condition-val">{ph.val.toFixed(1)}</span>
              <span className="condition-unit">{ph.unit}</span>
            </div>
            <div className="condition-bottom-row">
              <span className={`condition-status-pill status-${ph.status}`}>
                {getStatusLabel(ph.status)}
              </span>
              <div className="condition-sparkline-wrap">
                <MiniSparkline data={ph.history} color="#f59e0b" status={ph.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action button matching reference style with modern micro-interaction */}
      <button type="button" className="btn-bento-dark" onClick={onViewDetails}>
        <span>View Detailed Report</span>
        <ArrowUpRight size={13} className="btn-bento-arrow" />
      </button>
    </div>
  );
};
