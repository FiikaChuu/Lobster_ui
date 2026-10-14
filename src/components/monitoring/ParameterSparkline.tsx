import React from 'react';
import type { HistoricalDataPoint, SensorStatus, ParameterKey } from '../../types/sensor';
import { getMonotoneSplinePath, getMonotoneAreaPath, PARAMETER_CHART_THEMES } from '../../utils/splinePath';

interface ParameterSparklineProps {
  data: HistoricalDataPoint[];
  status?: SensorStatus;
  paramKey?: ParameterKey;
  height?: number;
}

export const ParameterSparkline: React.FC<ParameterSparklineProps> = ({
  data,
  status = 'normal',
  paramKey,
  height = 44
}) => {
  const reactId = React.useId();
  const validPoints = data.filter((d) => d.value !== null && !isNaN(d.value as number));

  if (validPoints.length < 2) {
    return (
      <div className="sparkline-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Data riwayat tidak cukup</span>
      </div>
    );
  }

  const values = validPoints.map((d) => d.value as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 220;
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;

  // Generate coordinates
  const coords = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  const linePath = getMonotoneSplinePath(coords);
  const areaPath = getMonotoneAreaPath(coords, height);

  // Color stroke based on status or parameter theme
  const themeStroke = paramKey && PARAMETER_CHART_THEMES[paramKey]?.stroke;
  const strokeColor =
    status === 'critical' ? 'var(--status-critical)' :
    status === 'warning' ? 'var(--status-warning)' :
    (themeStroke || 'var(--accent-primary)');

  const gradientId = `spark-grad-${status}-${reactId.replace(/:/g, '')}`;

  return (
    <div className="sparkline-wrapper">
      <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Area */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line Curve */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest End point dot */}
        {coords.length > 0 && (
          <circle
            cx={coords[coords.length - 1].x}
            cy={coords[coords.length - 1].y}
            r="3"
            fill={strokeColor}
            stroke="var(--bg-canvas)"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
};
