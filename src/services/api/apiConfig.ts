/**
 * Centralized API and Client Configuration
 */

export interface AppRuntimeConfig {
  apiBaseUrl: string;
  dataProvider: 'demo' | 'real';
  pollingIntervalMs: number;
  staleThresholdMs: number;
  activePondId: string;
}

// Read from Vite environment variables with robust fallbacks
const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const envProvider = import.meta.env.VITE_DATA_PROVIDER as string | undefined;
const envPolling = import.meta.env.VITE_POLLING_INTERVAL_MS as string | undefined;
const envStale = import.meta.env.VITE_STALE_THRESHOLD_MS as string | undefined;

export const DEFAULT_CONFIG: AppRuntimeConfig = {
  apiBaseUrl: envBaseUrl || 'http://localhost:8000/api',
  dataProvider: (envProvider === 'real' ? 'real' : 'demo'),
  pollingIntervalMs: envPolling ? parseInt(envPolling, 10) : 5000,
  staleThresholdMs: envStale ? parseInt(envStale, 10) : 60000,
  activePondId: 'POOL-01'
};

// Local storage key for persistent user preference during development / testing
const STORAGE_KEY = 'lobster_dashboard_runtime_config';

export function getRuntimeConfig(): AppRuntimeConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // fallback if localStorage not accessible
  }
  return { ...DEFAULT_CONFIG };
}

export function saveRuntimeConfig(updated: Partial<AppRuntimeConfig>): AppRuntimeConfig {
  const current = getRuntimeConfig();
  const next = { ...current, ...updated };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
