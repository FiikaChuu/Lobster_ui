import React, { useState } from 'react';
import { ServerCrash, Clock, WifiOff, X, RefreshCw } from 'lucide-react';
import type { DashboardConnectionState } from '../../types/monitoring';

export interface SystemAlertItem {
  id: string;
  type: 'error' | 'warning';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SystemAlertsContainerProps {
  error: string | null;
  isStale: boolean;
  connectionState: DashboardConnectionState;
  dataProvider: 'demo' | 'real';
  onRefresh?: () => void;
}

export const SystemAlertsContainer: React.FC<SystemAlertsContainerProps> = ({
  error,
  isStale,
  connectionState,
  dataProvider,
  onRefresh
}) => {
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [isIotDismissed, setIsIotDismissed] = useState<boolean>(false);
  const [isStaleDismissed, setIsStaleDismissed] = useState<boolean>(false);

  const alerts: SystemAlertItem[] = [];

  // 1. API Connection Failure Alert (Only for real mode or explicit simulated api_error)
  const isApiError = Boolean(error && (dataProvider === 'real' || connectionState === 'api_error'));
  if (isApiError && error && error !== dismissedError) {
    alerts.push({
      id: 'api-error',
      type: 'error',
      title: 'Koneksi REST API Gagal',
      message: `${error}. Menggunakan fallback data offline.`,
      action: onRefresh
        ? {
            label: 'Coba Lagi',
            onClick: onRefresh
          }
        : undefined
    });
  }

  // 2. Disconnected ESP32 Gateway / IoT Network Alert
  if (connectionState === 'disconnected' && !isIotDismissed) {
    alerts.push({
      id: 'iot-disconnected',
      type: 'warning',
      title: 'Gateway ESP32 Terputus',
      message: 'Node telemetri tambak tidak merespons transmisi data serial/WiFi.'
    });
  }

  // 3. Stale Data Telemetry Alert
  if (isStale && !isStaleDismissed) {
    alerts.push({
      id: 'stale-data',
      type: 'warning',
      title: 'Data Telemetri Tertunda',
      message: 'Sensor belum mengirimkan pembaruan lebih dari 60 detik.',
      action: onRefresh
        ? {
            label: 'Sinkronkan',
            onClick: onRefresh
          }
        : undefined
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    if (id === 'api-error' && error) {
      setDismissedError(error);
    } else if (id === 'iot-disconnected') {
      setIsIotDismissed(true);
    } else if (id === 'stale-data') {
      setIsStaleDismissed(true);
    }
  };

  return (
    <aside
      className="system-alerts-viewport"
      aria-live="polite"
      aria-label="Pemberitahuan Sistem"
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`system-alert-toast system-alert-${alert.type}`}
          role="alert"
        >
          <div className="system-alert-icon-box">
            {alert.type === 'error' ? (
              <ServerCrash size={16} className="system-alert-icon" />
            ) : alert.id === 'stale-data' ? (
              <Clock size={16} className="system-alert-icon" />
            ) : (
              <WifiOff size={16} className="system-alert-icon" />
            )}
          </div>

          <div className="system-alert-body">
            <h4 className="system-alert-title">{alert.title}</h4>
            <p className="system-alert-desc">{alert.message}</p>

            {alert.action && (
              <button
                type="button"
                className="system-alert-action-btn"
                onClick={alert.action.onClick}
              >
                <RefreshCw size={11} />
                <span>{alert.action.label}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className="system-alert-dismiss-btn"
            onClick={() => handleDismiss(alert.id)}
            title="Tutup Notifikasi"
            aria-label="Tutup Notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </aside>
  );
};
