import React from 'react';
import type { DashboardConnectionState } from '../../types/monitoring';
import type { SystemPipelineStatus } from '../../types/device';
import { formatDateTime, formatRelativeTime } from '../../utils/dateFormatter';
import { AlertTriangle, Clock, RefreshCw, Cpu, Server } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SystemStatusBarProps {
  state: DashboardConnectionState;
  pondId: string;
  deviceId: string;
  lastUpdated: string | null;
  pipeline?: SystemPipelineStatus;
  isStale: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  state: _state,
  pondId,
  deviceId,
  lastUpdated,
  pipeline,
  isStale,
  isRefreshing,
  onRefresh
}) => {
  const esp32Status = pipeline?.nodes.esp32.status || 'not_reported';
  const apiStatus = pipeline?.nodes.api.status || 'not_reported';

  return (
    <div className="system-status-bar">
      {/* Left: Device & Tank Identifiers */}
      <div className="status-group">
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Tangki Aktif:</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{pondId}</span>
      </div>

      <div className="divider" />

      <div className="status-group">
        <Cpu size={13} style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Node ESP32:</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{deviceId}</span>
        <Badge
          status={
            esp32Status === 'connected' ? 'normal' :
            esp32Status === 'disconnected' ? 'critical' :
            esp32Status === 'degraded' ? 'warning' : 'pending'
          }
          label={esp32Status === 'connected' ? 'ESP32 Online' : esp32Status === 'disconnected' ? 'ESP32 Terputus' : 'Belum Dilaporkan'}
        />
      </div>

      <div className="divider" />

      <div className="status-group">
        <Server size={13} style={{ color: 'var(--accent-teal)' }} />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>API Gateway:</span>
        <Badge
          status={apiStatus === 'connected' ? 'normal' : 'critical'}
          label={apiStatus === 'connected' ? 'API Aktif' : 'API Error'}
        />
      </div>

      {/* Right: Freshness indicator & Manual refresh */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isStale && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--status-warning)', fontSize: '0.72rem', fontWeight: 600 }}>
            <AlertTriangle size={13} />
            <span>Telemetri Usang</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <Clock size={13} style={{ color: 'var(--text-tertiary)' }} />
          <span>Terakhir: </span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {lastUpdated ? formatRelativeTime(lastUpdated) : 'Belum ada data'}
          </span>
          {lastUpdated && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
              ({formatDateTime(lastUpdated)})
            </span>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Perbarui Pembacaan Sensor"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};
