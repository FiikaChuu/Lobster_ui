import React, { useState, useRef, useMemo } from 'react';
import type { ParameterKey, HistoricalDataPoint } from '../../types/sensor';
import { PARAMETER_METADATA, formatValue } from '../../utils/unitFormatter';
import { formatChartTick, formatDateTime } from '../../utils/dateFormatter';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  getMonotoneSplinePath,
  getMonotoneAreaPath,
  PARAMETER_CHART_THEMES,
  DEFAULT_CHART_THEME
} from '../../utils/splinePath';

interface TimeSeriesChartProps {
  history: Record<ParameterKey, HistoricalDataPoint[]>;
  isLoading?: boolean;
  timeRange: '1h' | '24h' | '7d';
  onTimeRangeChange: (range: '1h' | '24h' | '7d') => void;
  onRefresh?: () => void;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  history,
  isLoading = false,
  timeRange,
  onTimeRangeChange,
  onRefresh
}) => {
  const [selectedParam, setSelectedParam] = useState<ParameterKey>('temperature');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const meta = PARAMETER_METADATA[selectedParam];
  const theme = PARAMETER_CHART_THEMES[selectedParam] || DEFAULT_CHART_THEME;
  const rawPoints = history[selectedParam];

  // Filter valid numeric data
  const validPoints = useMemo(() => {
    if (!rawPoints) return [];
    return rawPoints.filter((p) => p.value !== null && !isNaN(p.value as number));
  }, [rawPoints]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (validPoints.length === 0) return { min: null, max: null, avg: null };
    const vals = validPoints.map((p) => p.value as number);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return {
      min: Number(min.toFixed(meta.decimals)),
      max: Number(max.toFixed(meta.decimals)),
      avg: Number(avg.toFixed(meta.decimals))
    };
  }, [validPoints, meta.decimals]);

  // Dimensions & Coordinate Mapping
  const chartWidth = 720;
  const chartHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const minVal = stats.min !== null ? stats.min * 0.98 : 0;
  const maxVal = stats.max !== null ? stats.max * 1.02 : 100;
  const valRange = maxVal - minVal || 1;

  const coords = useMemo(() => {
    if (validPoints.length < 2) return [];
    return validPoints.map((pt, i) => {
      const x = paddingLeft + (i / (validPoints.length - 1)) * usableWidth;
      const y = paddingTop + usableHeight - (((pt.value as number) - minVal) / valRange) * usableHeight;
      return { x, y, pt };
    });
  }, [validPoints, paddingLeft, usableWidth, paddingTop, usableHeight, minVal, valRange]);

  const linePath = useMemo(() => {
    if (coords.length < 2) return '';
    return getMonotoneSplinePath(coords);
  }, [coords]);

  const areaPath = useMemo(() => {
    if (!linePath || coords.length < 2) return '';
    return getMonotoneAreaPath(coords, paddingTop + usableHeight);
  }, [linePath, coords, paddingTop, usableHeight]);

  // Mouse hover tracking for crosshair & tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (coords.length === 0 || !containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * chartWidth;

    // Find nearest point
    let closestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((c, idx) => {
      const diff = Math.abs(c.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (validPoints.length === 0) return;
    const rows = [
      ['Timestamp', meta.label, 'Unit'],
      ...validPoints.map((p) => [p.timestamp, p.value, meta.defaultUnit])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lobster_telemetry_${selectedParam}_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Y-axis grid ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = minVal + ratio * valRange;
    const y = paddingTop + usableHeight - ratio * usableHeight;
    return { val: Number(val.toFixed(meta.decimals)), y };
  });

  // X-axis time ticks
  const xTicks = useMemo(() => {
    if (coords.length === 0) return [];
    const step = Math.max(1, Math.floor(coords.length / 5));
    return coords.filter((_, idx) => idx % step === 0 || idx === coords.length - 1);
  }, [coords]);

  const activeCoord = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  return (
    <div className="chart-card" ref={containerRef}>
      {/* Header */}
      <div className="chart-header">
        <div className="chart-title-group">
          <h2>Grafik Riwayat Kualitas Air</h2>
          <p>Visualisasi tren pengukuran sensor perairan telemetri</p>
        </div>

        <div className="chart-controls-row">
          {/* Time range pills */}
          <div className="time-range-pills">
            <button
              className={`range-pill-btn ${timeRange === '1h' ? 'active' : ''}`}
              onClick={() => onTimeRangeChange('1h')}
            >
              1 Jam
            </button>
            <button
              className={`range-pill-btn ${timeRange === '24h' ? 'active' : ''}`}
              onClick={() => onTimeRangeChange('24h')}
            >
              24 Jam
            </button>
            <button
              className={`range-pill-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => onTimeRangeChange('7d')}
            >
              7 Hari
            </button>
          </div>

          {/* Export CSV button */}
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={13} />}
            onClick={handleExportCSV}
            title="Ekspor CSV Telemetri"
          >
            Ekspor
          </Button>

          {onRefresh && (
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />}
              onClick={onRefresh}
              title="Perbarui Data Grafik"
            />
          )}
        </div>
      </div>

      {/* Parameter selector tabs */}
      <div className="param-tabs-row">
        {(['temperature', 'ph', 'salinity', 'dissolvedOxygen'] as ParameterKey[]).map((key) => {
          const itemMeta = PARAMETER_METADATA[key];
          return (
            <button
              key={key}
              className={`param-tab-btn ${selectedParam === key ? 'active' : ''}`}
              onClick={() => {
                setSelectedParam(key);
                setHoverIndex(null);
              }}
            >
              {itemMeta.label} ({itemMeta.defaultUnit})
            </button>
          );
        })}
      </div>

      {/* Chart Canvas */}
      <div className="interactive-chart-container">
        {isLoading && validPoints.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Memuat data time-series...</span>
          </div>
        ) : validPoints.length < 2 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Tidak ada data riwayat untuk rentang ini.</span>
          </div>
        ) : (
          <>
            <svg
              className="chart-svg"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id={`chartAreaGrad-${selectedParam}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.gradientTop} stopOpacity="0.26" />
                  <stop offset="50%" stopColor={theme.gradientTop} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={theme.gradientTop} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y Axis Labels */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={tick.y}
                    x2={chartWidth - paddingRight}
                    y2={tick.y}
                    stroke="var(--bg-inset)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={tick.y + 4}
                    fill="var(--text-tertiary)"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {tick.val}
                  </text>
                </g>
              ))}

              {/* X Axis Time Labels */}
              {xTicks.map((tick, i) => (
                <text
                  key={i}
                  x={tick.x}
                  y={chartHeight - 10}
                  fill="var(--text-tertiary)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {formatChartTick(tick.pt.timestamp, timeRange)}
                </text>
              ))}

              {/* Area fill with smooth organic gradient */}
              <path d={areaPath} fill={`url(#chartAreaGrad-${selectedParam})`} />

              {/* Main smooth spline curve */}
              <path
                d={linePath}
                fill="none"
                stroke={theme.stroke}
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 2px 6px ${theme.glow})` }}
              />

              {/* Hover Crosshair & Point */}
              {activeCoord && (
                <g>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={activeCoord.x}
                    y1={paddingTop}
                    x2={activeCoord.x}
                    y2={paddingTop + usableHeight}
                    stroke={theme.stroke}
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Outer glow ring */}
                  <circle
                    cx={activeCoord.x}
                    cy={activeCoord.y}
                    r="8"
                    fill={theme.glow}
                  />
                  {/* Center Dot */}
                  <circle
                    cx={activeCoord.x}
                    cy={activeCoord.y}
                    r="4"
                    fill={theme.stroke}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* Floating Glass Tooltip */}
            {activeCoord && (
              <div
                className="chart-tooltip-floating"
                style={{
                  left: `${(activeCoord.x / chartWidth) * 100}%`,
                  top: `${(activeCoord.y / chartHeight) * 100}%`
                }}
              >
                <div className="tooltip-header-pill">
                  <span className="tooltip-indicator-dot" style={{ background: theme.stroke }} />
                  <span className="tooltip-param-name">{meta.label}</span>
                </div>
                <div className="tooltip-value-row">
                  <span className="tooltip-val">{formatValue(activeCoord.pt.value, meta.decimals)}</span>
                  <span className="tooltip-unit">{meta.defaultUnit}</span>
                </div>
                <div className="tooltip-time">{formatDateTime(activeCoord.pt.timestamp)}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Statistics Footer */}
      <div className="chart-stats-footer">
        <div className="chart-stat-item">
          <span className="stat-label">Rata-Rata ({timeRange})</span>
          <span className="stat-value">
            {stats.avg !== null ? `${stats.avg} ${meta.defaultUnit}` : '—'}
          </span>
        </div>
        <div className="chart-stat-item">
          <span className="stat-label">Titik Tertinggi (Puncak)</span>
          <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>
            {stats.max !== null ? `${stats.max} ${meta.defaultUnit}` : '—'}
          </span>
        </div>
        <div className="chart-stat-item">
          <span className="stat-label">Titik Terendah</span>
          <span className="stat-value" style={{ color: 'var(--status-warning)' }}>
            {stats.min !== null ? `${stats.min} ${meta.defaultUnit}` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
