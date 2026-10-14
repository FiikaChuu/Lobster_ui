import React, { useState, useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, MoreHorizontal, X, CheckCircle2 } from 'lucide-react';
import type { EnvironmentalAlert, AlertSeverity } from '../../types/alert';

export type AlertCategoryFilter = 'all' | 'critical' | 'warning' | 'info';

export interface UnifiedAlertItem {
  id: string;
  category: 'Kualitas Air' | 'Sensor Offline' | 'Koneksi API' | 'Data Tidak Tersedia' | 'Sistem';
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  canAcknowledge?: boolean;
}

interface BentoAlertsListProps {
  alerts: EnvironmentalAlert[];
  systemError?: string | null;
  isStale?: boolean;
  connectionState?: string;
  dataProvider?: 'demo' | 'real';
  onNavigateToAlerts?: () => void;
  onAcknowledge?: (alertId: string) => void;
  feedbackMessage?: string | null;
}

const DEFAULT_REFERENCE_ALERTS: UnifiedAlertItem[] = [
  {
    id: 'REF-01',
    category: 'Sensor Offline',
    severity: 'critical',
    title: 'Sensor Offline',
    message: 'Sensor pH tidak merespons',
    timestamp: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'REF-02',
    category: 'Kualitas Air',
    severity: 'warning',
    title: 'Kualitas Air',
    message: 'Nilai DO mulai menurun',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'REF-03',
    category: 'Koneksi API',
    severity: 'info',
    title: 'Koneksi API',
    message: 'Terjadi penundaan data dari server',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'REF-04',
    category: 'Sensor Offline',
    severity: 'warning',
    title: 'Sensor Offline',
    message: 'Sensor suhu tidak merespons',
    timestamp: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    status: 'active'
  }
];

export const BentoAlertsList: React.FC<BentoAlertsListProps> = ({
  alerts = [],
  systemError,
  isStale,
  connectionState,
  dataProvider = 'demo',
  onNavigateToAlerts,
  onAcknowledge,
  feedbackMessage
}) => {
  const [categoryFilter, setCategoryFilter] = useState<AlertCategoryFilter>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  // 1. Gather all active environmental and system alerts
  const combinedAlerts = useMemo(() => {
    const sysItems: UnifiedAlertItem[] = [];
    if (systemError && (dataProvider === 'real' || connectionState === 'api_error')) {
      sysItems.push({
        id: 'sys-api-error',
        category: 'Koneksi API',
        severity: 'critical',
        title: 'Koneksi REST API Gagal',
        message: `${systemError}. Menggunakan cache lokal.`,
        timestamp: null,
        status: 'active'
      });
    }
    if (connectionState === 'disconnected') {
      sysItems.push({
        id: 'sys-iot-disconnected',
        category: 'Sensor Offline',
        severity: 'warning',
        title: 'Gateway ESP32 Terputus',
        message: 'Node telemetri tambak tidak merespons transmisi serial/WiFi.',
        timestamp: null,
        status: 'active'
      });
    }
    if (isStale) {
      sysItems.push({
        id: 'sys-stale-data',
        category: 'Data Tidak Tersedia',
        severity: 'warning',
        title: 'Data Telemetri Tertunda',
        message: 'Belum ada telemetri baru dalam 30 menit terakhir.',
        timestamp: null,
        status: 'active'
      });
    }

    const envItems: UnifiedAlertItem[] = alerts
      .filter((a) => a.status === 'active')
      .map((a) => {
        let cat: UnifiedAlertItem['category'] = 'Kualitas Air';
        if (a.parameter === 'disconnected' || a.title.toLowerCase().includes('offline')) cat = 'Sensor Offline';
        else if (a.title.toLowerCase().includes('api') || a.title.toLowerCase().includes('koneksi')) cat = 'Koneksi API';
        else if (a.title.toLowerCase().includes('tertunda') || a.title.toLowerCase().includes('stale')) cat = 'Data Tidak Tersedia';
        return {
          id: a.id,
          category: cat,
          severity: a.severity,
          title: a.title,
          message: a.message,
          timestamp: a.timestamp || null,
          status: a.status,
          canAcknowledge: a.canAcknowledge
        };
      });

    const list = [...sysItems, ...envItems];
    return list.length > 0 ? list : DEFAULT_REFERENCE_ALERTS;
  }, [alerts, systemError, isStale, connectionState, dataProvider]);

  // 2. Sort newest first based on valid timestamps
  const sortedAlerts = useMemo(() => {
    return [...combinedAlerts].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [combinedAlerts]);

  // 3. Filter by category and exclude dismissed
  const filteredAlerts = useMemo(() => {
    return sortedAlerts.filter((a) => {
      if (dismissedIds.has(a.id)) return false;
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'critical') return a.severity === 'critical';
      if (categoryFilter === 'warning') return a.severity === 'warning';
      if (categoryFilter === 'info') return a.severity === 'info';
      return true;
    });
  }, [sortedAlerts, categoryFilter, dismissedIds]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleClearDismissed = () => {
    setDismissedIds(new Set());
    setMenuOpen(false);
  };

  const formatTime = (ts: string | null) => {
    if (!ts) return 'Waktu tidak diketahui';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return 'Waktu tidak diketahui';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Waktu tidak diketahui';
    }
  };

  return (
    <div className="bento-card bento-alerts-card">
      {/* Header with Title and More/Ellipsis Menu Button */}
      <div className="bento-card-header">
        <h3 className="bento-card-title">Alerts ({filteredAlerts.length})</h3>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="card-dot-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Menu Notifikasi"
            aria-label="Menu Notifikasi"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="card-dropdown-menu">
              <button
                type="button"
                className="card-dropdown-item"
                onClick={() => {
                  onNavigateToAlerts?.();
                  setMenuOpen(false);
                }}
              >
                Pusat Peringatan Lengkap
              </button>
              {dismissedIds.size > 0 && (
                <button type="button" className="card-dropdown-item" onClick={handleClearDismissed}>
                  Reset Peringatan Ditutup
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <div className="bento-feedback-badge">
          <CheckCircle2 size={12} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Category Filter Pills (Semua, Error, Warning, Info) */}
      <div className="alerts-category-filters">
        <button
          type="button"
          className={`filter-pill-btn ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          Semua
        </button>
        <button
          type="button"
          className={`filter-pill-btn ${categoryFilter === 'critical' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('critical')}
        >
          Error
        </button>
        <button
          type="button"
          className={`filter-pill-btn ${categoryFilter === 'warning' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('warning')}
        >
          Warning
        </button>
        <button
          type="button"
          className={`filter-pill-btn ${categoryFilter === 'info' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('info')}
        >
          Info
        </button>
      </div>

      {/* Alert Items List with internal scrolling */}
      <div className="bento-alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="bento-no-alerts">
            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
            <span>Tidak ada alarm aktif untuk kategori ini.</span>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const pillColorClass =
              alert.severity === 'critical'
                ? 'pill-red'
                : index % 2 === 1
                ? 'pill-amber'
                : 'pill-orange';

            const sevTextClass =
              alert.severity === 'critical'
                ? 'sev-urgent'
                : index % 2 === 1
                ? 'sev-amber'
                : 'sev-orange';

            return (
              <div
                key={alert.id}
                className="bento-alert-row"
                onClick={onNavigateToAlerts}
                role="button"
                tabIndex={0}
                title="Klik untuk membuka detail peringatan"
              >
                {/* Left Alert Icon based on severity */}
                <div className="bento-alert-left-icon">
                  {alert.severity === 'critical' ? (
                    <AlertCircle size={15} style={{ color: '#dc2626' }} />
                  ) : alert.severity === 'info' ? (
                    <Info size={15} style={{ color: '#0284c7' }} />
                  ) : (
                    <AlertTriangle size={15} className="alert-triangle-icon" />
                  )}
                </div>

                {/* Text Hierarchy: Category, Title, Message, Time & Action */}
                <div className="bento-alert-text-stack">
                  <div className="alert-row-meta-top">
                    <span className="alert-category-tag">{alert.category}</span>
                    <span className="alert-row-time">{formatTime(alert.timestamp)}</span>
                  </div>
                  <div className="alert-row-title">{alert.title}</div>
                  <div className="alert-row-desc">{alert.message}</div>
                  <div className="alert-row-meta-bottom">
                    <span className={`alert-row-severity ${sevTextClass}`}>
                      {alert.severity === 'critical' ? 'Urgent' : alert.severity === 'info' ? 'Info' : 'Warning'}
                    </span>
                    {onAcknowledge && alert.canAcknowledge !== false && (
                      <button
                        type="button"
                        className="alert-ack-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge(alert.id);
                        }}
                        title="Konfirmasi peringatan ini"
                      >
                        Konfirmasi
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Dismiss button and solid vertical indicator pill */}
                <div className="bento-alert-right-group">
                  <button
                    type="button"
                    className="alert-dismiss-btn"
                    onClick={(e) => handleDismiss(alert.id, e)}
                    title="Tutup dari daftar"
                    aria-label="Tutup notifikasi"
                  >
                    <X size={11} />
                  </button>
                  <div className={`alert-vertical-pill ${pillColorClass}`} aria-hidden="true" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
