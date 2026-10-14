/**
 * useMonitoring Custom Hook
 * Central hook for live water quality telemetry.
 * Transparently manages Demo Mode vs Real API Mode, auto-polling, visibility-change,
 * staleness detection, and error recovery.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MonitoringSnapshot, DashboardConnectionState } from '../types/monitoring';
import { getRuntimeConfig, saveRuntimeConfig, type AppRuntimeConfig } from '../services/api/apiConfig';
import { getLatestMonitoringData } from '../services/api/monitoringService';
import { getMockLatestMonitoringData, getActiveDemoScenario, setActiveDemoScenario } from '../mocks/mockMonitoringService';
import type { DemoScenarioId } from '../mocks/mockScenarios';
import { isTimestampStale } from '../utils/dateFormatter';

export interface UseMonitoringReturn {
  data: MonitoringSnapshot | null;
  state: DashboardConnectionState;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  lastUpdated: string | null;
  config: AppRuntimeConfig;
  isPollingPaused: boolean;
  activeScenario: DemoScenarioId;
  refresh: () => Promise<void>;
  togglePolling: () => void;
  setPollingInterval: (ms: number) => void;
  setDataProvider: (provider: 'demo' | 'real') => void;
  changeScenario: (scenario: DemoScenarioId) => void;
  setActivePond: (pondId: string) => void;
}

export function useMonitoring(): UseMonitoringReturn {
  const [config, setConfig] = useState<AppRuntimeConfig>(getRuntimeConfig);
  const [data, setData] = useState<MonitoringSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPollingPaused, setIsPollingPaused] = useState<boolean>(false);
  const [activeScenario, setActiveScenarioState] = useState<DemoScenarioId>(getActiveDemoScenario());

  const isFetchingRef = useRef<boolean>(false);
  const pollTimerRef = useRef<number | null>(null);

  // Fetch logic
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else if (!data) {
      setIsLoading(true);
    }

    try {
      let snapshot: MonitoringSnapshot;

      if (config.dataProvider === 'real') {
        snapshot = await getLatestMonitoringData(config.activePondId);
      } else {
        snapshot = await getMockLatestMonitoringData(config.activePondId);
      }

      setData(snapshot);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.';
      setError(msg);
      // In real mode, never replace failed data with fake readings
      if (config.dataProvider === 'real') {
        // preserve existing data or keep null
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [config.dataProvider, config.activePondId, data]);

  // Setup periodic polling
  useEffect(() => {
    // Initial fetch
    fetchData();

    const startTimer = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (!isPollingPaused && config.pollingIntervalMs > 0) {
        pollTimerRef.current = window.setInterval(() => {
          // Avoid background polling if browser tab is hidden
          if (document.visibilityState === 'visible') {
            fetchData();
          }
        }, config.pollingIntervalMs);
      }
    };

    startTimer();

    // Listen for tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, config.pollingIntervalMs, isPollingPaused]);

  // Determine aggregate connection state
  let state: DashboardConnectionState = 'loading';
  if (isLoading && !data) {
    state = 'loading';
  } else if (error) {
    state = 'api_error';
  } else if (config.dataProvider === 'demo') {
    state = 'demo_mode';
  } else if (!data || !data.timestamp) {
    state = 'waiting_first_reading';
  } else if (data.isStale || isTimestampStale(data.timestamp, config.staleThresholdMs)) {
    state = 'stale_data';
  } else if (data.pipeline.nodes.esp32.status === 'disconnected') {
    state = 'disconnected';
  } else {
    state = 'connected';
  }

  const isStale = data ? isTimestampStale(data.timestamp, config.staleThresholdMs) : false;

  // Actions
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const togglePolling = useCallback(() => {
    setIsPollingPaused((prev) => !prev);
  }, []);

  const setPollingInterval = useCallback((ms: number) => {
    const updated = saveRuntimeConfig({ pollingIntervalMs: ms });
    setConfig(updated);
  }, []);

  const setDataProvider = useCallback((provider: 'demo' | 'real') => {
    const updated = saveRuntimeConfig({ dataProvider: provider });
    setConfig(updated);
    setData(null);
    setIsLoading(true);
  }, []);

  const changeScenario = useCallback((scenario: DemoScenarioId) => {
    setActiveDemoScenario(scenario);
    setActiveScenarioState(scenario);
    fetchData(true);
  }, [fetchData]);

  const setActivePond = useCallback((pondId: string) => {
    const updated = saveRuntimeConfig({ activePondId: pondId });
    setConfig(updated);
  }, []);

  return {
    data,
    state,
    error,
    isLoading,
    isRefreshing,
    isStale,
    lastUpdated: data?.timestamp || null,
    config,
    isPollingPaused,
    activeScenario,
    refresh,
    togglePolling,
    setPollingInterval,
    setDataProvider,
    changeScenario,
    setActivePond
  };
}
