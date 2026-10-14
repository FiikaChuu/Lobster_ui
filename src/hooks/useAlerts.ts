/**
 * useAlerts Hook
 * Manages active and acknowledged environmental alerts.
 */

import { useState, useEffect, useCallback } from 'react';
import type { EnvironmentalAlert } from '../types/alert';
import { getRuntimeConfig } from '../services/api/apiConfig';
import { getAlerts, acknowledgeAlert as apiAcknowledgeAlert } from '../services/api/alertService';
import { getMockAlerts, mockAcknowledgeAlert } from '../mocks/mockMonitoringService';

export function useAlerts(pondId = 'POOL-01') {
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const config = getRuntimeConfig();

    try {
      let result: EnvironmentalAlert[];
      if (config.dataProvider === 'real') {
        result = await getAlerts(pondId);
      } else {
        result = await getMockAlerts(pondId);
      }
      setAlerts(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat daftar peringatan.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pondId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const acknowledge = async (alertId: string) => {
    const config = getRuntimeConfig();
    try {
      if (config.dataProvider === 'real') {
        const res = await apiAcknowledgeAlert(alertId);
        setActionFeedback(res.message);
      } else {
        const res = await mockAcknowledgeAlert(alertId);
        setActionFeedback(res.message);
      }

      // Locally mark as acknowledged
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged', acknowledgedAt: new Date().toISOString() } : a))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Aksi gagal dieksekusi.';
      setActionFeedback(msg);
    }
  };

  const clearFeedback = () => setActionFeedback(null);

  return {
    alerts,
    isLoading,
    error,
    actionFeedback,
    acknowledge,
    clearFeedback,
    refetch: fetchAlerts
  };
}
