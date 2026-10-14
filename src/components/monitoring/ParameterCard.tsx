import React from 'react';
import {
  Thermometer,
  Droplet,
  Waves,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle
} from 'lucide-react';
import type { ParameterKey, ParameterSummary } from '../../types/sensor';
import { PARAMETER_METADATA, formatValue } from '../../utils/unitFormatter';
import { formatTimeOnly } from '../../utils/dateFormatter';
import { Badge } from '../ui/Badge';
import { ParameterSparkline } from './ParameterSparkline';
import { Skeleton } from '../ui/Skeleton';

interface ParameterCardProps {
  paramKey: ParameterKey;
  data?: ParameterSummary;
  isLoading?: boolean;
  isStale?: boolean;
}

export const ParameterCard: React.FC<ParameterCardProps> = ({
  paramKey,
  data,
  isLoading = false,
  isStale = false
}) => {
  const meta = PARAMETER_METADATA[paramKey] || {
    key: paramKey,
    label: paramKey,
    shortLabel: paramKey,
    defaultUnit: '',
    description: '',
    optimalRangeDescription: '',
    decimals: 1
  };

  const getParamIcon = () => {
    switch (paramKey) {
      case 'temperature':
        return <Thermometer size={18} />;
      case 'ph':
        return <Droplet size={18} />;
      case 'salinity':
        return <Waves size={18} />;
      case 'dissolvedOxygen':
        return <Activity size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  if (isLoading) {
    return (
      <div className="parameter-card">
        <div className="card-header">
          <Skeleton width="120px" height="24px" />
          <Skeleton width="60px" height="20px" borderRadius="var(--radius-pill)" />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <Skeleton width="90px" height="42px" />
        </div>
        <Skeleton width="100%" height="48px" />
        <div style={{ marginTop: '0.75rem' }}>
          <Skeleton width="100%" height="16px" />
        </div>
      </div>
    );
  }

  const currentVal = data?.current ?? null;
  const unit = data?.unit || meta.defaultUnit;
  const status = data?.status || 'unknown';
  const displayStatus = isStale ? 'stale' : status;
  const timestamp = data?.timestamp;

  const renderTrend = () => {
    if (!data || data.trend === 'unknown') {
      return (
        <span className="trend-indicator stable">
          <Minus size={14} /> Stabil
        </span>
      );
    }

    if (data.trend === 'up') {
      return (
        <span className="trend-indicator up">
          <ArrowUpRight size={14} /> +{data.trendDelta ?? ''}
        </span>
      );
    }

    if (data.trend === 'down') {
      return (
        <span className="trend-indicator down">
          <ArrowDownRight size={14} /> {data.trendDelta ?? ''}
        </span>
      );
    }

    return (
      <span className="trend-indicator stable">
        <Minus size={14} /> Stabil
      </span>
    );
  };

  return (
    <div className={`parameter-card status-${status}`}>
      {/* Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge">{getParamIcon()}</div>
          <div>
            <div className="card-param-name">{meta.label}</div>
            <div className="card-target-range">{meta.optimalRangeDescription}</div>
          </div>
        </div>

        <Badge status={displayStatus} pulse={status === 'critical' || status === 'warning'} />
      </div>

      {/* Value & Unit */}
      <div className="card-value-section">
        <div className="card-value-display">
          <span className="card-value-number">
            {formatValue(currentVal, meta.decimals)}
          </span>
          <span className="card-value-unit">{unit}</span>
        </div>

        {currentVal === null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
            <AlertCircle size={14} />
            <span>Tidak ada data</span>
          </div>
        )}
      </div>

      {/* Mini Trend Sparkline */}
      <ParameterSparkline
        data={data?.history || []}
        status={status}
        paramKey={paramKey}
      />

      {/* Footer Summary Stats */}
      <div className="card-footer-stats">
        <div>{renderTrend()}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {data && data.min !== null && data.max !== null && (
            <span>
              Rentang: {data.min} – {data.max} {unit}
            </span>
          )}
          {timestamp && <span>Update: {formatTimeOnly(timestamp)}</span>}
        </div>
      </div>
    </div>
  );
};
