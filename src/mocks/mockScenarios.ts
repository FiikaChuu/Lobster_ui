/**
 * Deterministic Mock Scenarios for Demo and Testing
 * Specifically tuned for tropical lobster aquaculture (Panulirus spp.)
 */

export type DemoScenarioId =
  | 'normal'
  | 'warning_hypoxia'
  | 'critical_acidification'
  | 'stale_data'
  | 'disconnected'
  | 'empty_record'
  | 'api_error';

export interface DemoScenarioDefinition {
  id: DemoScenarioId;
  name: string;
  badge: string;
  description: string;
  classification: 'normal' | 'warning' | 'critical' | 'pending';
  deviceConnected: boolean;
  isStale: boolean;
  isEmpty: boolean;
  isError: boolean;
}

export const DEMO_SCENARIOS: Record<DemoScenarioId, DemoScenarioDefinition> = {
  normal: {
    id: 'normal',
    name: 'Kondisi Optimal (Normal)',
    badge: 'OPTIMAL',
    description: 'Semua parameter perairan berada dalam rentang ideal untuk pertumbuhan lobster.',
    classification: 'normal',
    deviceConnected: true,
    isStale: false,
    isEmpty: false,
    isError: false
  },
  warning_hypoxia: {
    id: 'warning_hypoxia',
    name: 'Waspada Hipoksia (DO Rendah)',
    badge: 'WASPADA',
    description: 'Oksigen terlarut turun mendekati 4.1 mg/L disertai kenaikan suhu air.',
    classification: 'warning',
    deviceConnected: true,
    isStale: false,
    isEmpty: false,
    isError: false
  },
  critical_acidification: {
    id: 'critical_acidification',
    name: 'Kritis Asidifikasi & Suhu Ekstrem',
    badge: 'KRITIS',
    description: 'pH anjlok ke 6.8, suhu melonjak 31.5°C, memicu stres mortalitas akut.',
    classification: 'critical',
    deviceConnected: true,
    isStale: false,
    isEmpty: false,
    isError: false
  },
  stale_data: {
    id: 'stale_data',
    name: 'Data Usang (Stale Telemetry)',
    badge: 'STALE DATA',
    description: 'Data terakhir diterima 45 menit lalu; koneksi ESP32 tertunda.',
    classification: 'warning',
    deviceConnected: false,
    isStale: true,
    isEmpty: false,
    isError: false
  },
  disconnected: {
    id: 'disconnected',
    name: 'Perangkat Terputus (Offline)',
    badge: 'OFFLINE',
    description: 'ESP32 dan bus sensor tidak merespons telemetri.',
    classification: 'pending',
    deviceConnected: false,
    isStale: true,
    isEmpty: false,
    isError: false
  },
  empty_record: {
    id: 'empty_record',
    name: 'Kolam Baru (Menunggu Data Awal)',
    badge: 'MENUNGGU DATA',
    description: 'Belum ada data pengukuran masuk dari sensor.',
    classification: 'pending',
    deviceConnected: true,
    isStale: false,
    isEmpty: true,
    isError: false
  },
  api_error: {
    id: 'api_error',
    name: 'Simulasi Kegagalan REST API (503)',
    badge: 'API ERROR',
    description: 'Simulasi kegagalan jaringan atau server backend offline.',
    classification: 'pending',
    deviceConnected: false,
    isStale: false,
    isEmpty: false,
    isError: true
  }
};
