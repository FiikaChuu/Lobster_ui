import React from 'react';
import type { SensorStatus } from '../../types/sensor';

export interface BadgeProps {
  status?: SensorStatus | 'pending' | 'stale' | 'demo' | 'active' | 'acknowledged';
  label?: string;
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'normal',
  label,
  className = '',
  pulse = false
}) => {
  const getStatusLabel = () => {
    if (label) return label;
    switch (status) {
      case 'normal': return 'Normal';
      case 'warning': return 'Waspada';
      case 'critical': return 'Kritis';
      case 'pending': return 'Menunggu';
      case 'stale': return 'Data Usang';
      case 'disconnected': return 'Terputus';
      case 'demo': return 'Demo Mode';
      case 'active': return 'Aktif';
      case 'acknowledged': return 'Diakui';
      default: return 'Tidak Diketahui';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'normal': return 'var(--status-normal)';
      case 'warning':
      case 'stale': return 'var(--status-warning)';
      case 'critical': return 'var(--status-critical)';
      case 'demo': return 'var(--accent-primary)';
      default: return 'var(--status-unknown)';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'normal': return 'var(--status-normal-bg)';
      case 'warning':
      case 'stale': return 'var(--status-warning-bg)';
      case 'critical': return 'var(--status-critical-bg)';
      case 'demo': return 'var(--accent-primary-bg)';
      default: return 'var(--status-unknown-bg)';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'normal': return 'var(--status-normal-border)';
      case 'warning':
      case 'stale': return 'var(--status-warning-border)';
      case 'critical': return 'var(--status-critical-border)';
      case 'demo': return 'var(--accent-primary-border)';
      default: return 'var(--status-unknown-border)';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'normal': return 'var(--status-normal-text)';
      case 'warning':
      case 'stale': return 'var(--status-warning-text)';
      case 'critical': return 'var(--status-critical-text)';
      case 'demo': return 'var(--accent-primary)';
      default: return 'var(--status-unknown-text)';
    }
  };

  return (
    <span
      className={`status-pill ${className}`}
      style={{
        background: getBgColor(),
        border: `1px solid ${getBorderColor()}`,
        color: getTextColor()
      }}
    >
      <span
        className={`status-dot ${pulse ? 'pulse' : ''}`}
        style={{ backgroundColor: getDotColor() }}
      />
      {getStatusLabel()}
    </span>
  );
};
