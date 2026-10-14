import React, { useState } from 'react';
import type { EnvironmentalAlert } from '../../types/alert';
import { formatDateTime } from '../../utils/dateFormatter';
import { AlertTriangle, AlertOctagon, CheckCircle2, BellOff } from 'lucide-react';
import { Button } from '../ui/Button';

interface AlertCenterProps {
  alerts: EnvironmentalAlert[];
  isLoading?: boolean;
  onAcknowledge?: (alertId: string) => void;
  feedbackMessage?: string | null;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts = [],
  isLoading = false,
  onAcknowledge,
  feedbackMessage
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning') return a.severity === 'warning';
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="alert-center-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pusat Peringatan Lingkungan</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Notifikasi kondisi abnormal parameter air budidaya
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            className={`range-pill-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Semua ({alerts.length})
          </button>
          <button
            className={`range-pill-btn ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Kritis
          </button>
          <button
            className={`range-pill-btn ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            Waspada
          </button>
        </div>
      </div>

      {/* User Feedback banner (for acknowledgment) */}
      {feedbackMessage && (
        <div
          style={{
            padding: '0.55rem 0.85rem',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-primary-light)',
            fontSize: '0.8rem'
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Memuat daftar peringatan...
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div
          style={{
            padding: '2.5rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(10, 18, 30, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-light)'
          }}
        >
          <BellOff size={28} style={{ color: 'var(--text-tertiary)' }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tidak Ada Peringatan Aktif</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Semua parameter perairan berada dalam batas operasional aman.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`alert-item ${isCritical ? 'critical' : 'warning'}`}
              >
                <div className="alert-item-icon">
                  {isCritical ? <AlertOctagon size={16} /> : <AlertTriangle size={16} />}
                </div>

                <div className="alert-content">
                  <div className="alert-header-row">
                    <span className="alert-title">{alert.title}</span>
                    <span className="alert-time">{formatDateTime(alert.timestamp)}</span>
                  </div>

                  <p className="alert-message">{alert.message}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {alert.parameter && (
                        <span>
                          Parameter: <strong style={{ color: 'var(--text-primary)' }}>{String(alert.parameter)}</strong>
                        </span>
                      )}
                      {alert.observedValue !== undefined && (
                        <span style={{ marginLeft: '0.5rem' }}>
                          Terukur: <strong style={{ color: 'var(--text-primary)' }}>{alert.observedValue} {alert.unit || ''}</strong>
                        </span>
                      )}
                    </div>

                    {alert.status === 'acknowledged' ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={13} /> Diakui
                      </span>
                    ) : (
                      onAcknowledge && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onAcknowledge(alert.id)}
                        >
                          Konfirmasi / Tanggapi
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
        Total aktif: {activeCount} peringatan. *Tindakan konfirmasi di demo mode hanya mensimulasikan respons antarmuka.
      </div>
    </div>
  );
};
