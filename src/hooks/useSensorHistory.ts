/**
 * useSensorHistory Hook
 * Loads historical data for single or multi-parameter charting.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ParameterKey, HistoricalDataPoint } from '../types/sensor';
import { getRuntimeConfig } from '../services/api/apiConfig';
import { getSensorHistory } from '../services/api/monitoringService';
import { getMockSensorHistory } from '../mocks/mockMonitoringService';

export interface UseSensorHistoryReturn {
  history: Record<ParameterKey, HistoricalDataPoint[]>;
  isLoading: boolean;
  error: string | null;
  timeRange: '1h' | '24h' | '7d';
  setTimeRange: (range: '1h' | '24h' | '7d') => void;
  refetch: () => Promise<void>;
}

export function useSensorHistory(pondId = 'POOL-01'): UseSensorHistoryReturn {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [history, setHistory] = useState<Record<ParameterKey, HistoricalDataPoint[]>>({
    ph: [],
    temperature: [],
    salinity: [],
    dissolvedOxygen: [],
    tds: [],
    ec: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const config = getRuntimeConfig();

    try {
      let records: Record<ParameterKey, HistoricalDataPoint[]>;
      if (config.dataProvider === 'real') {
        records = await getSensorHistory(pondId, { range: timeRange });
      } else {
        records = await getMockSensorHistory(pondId, { range: timeRange });
      }
      setHistory(records);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat riwayat sensor.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pondId, timeRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    refetch: fetchHistory
  };
}
