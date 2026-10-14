/**
 * API Contract Types & Raw Payload Representations
 * Facilitates strict typing and decoupled mapping.
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Raw conceptual backend format for latest reading
 * (Flexible to handle various naming conventions from future backend)
 */
export interface RawBackendLatestReading {
  deviceId?: string;
  device_id?: string;
  pondId?: string;
  pond_id?: string;
  timestamp?: string;
  created_at?: string;
  data?: {
    ph?: number | null;
    temperature?: number | null;
    temp_c?: number | null;
    salinity?: number | null;
    dissolvedOxygen?: number | null;
    dissolved_oxygen?: number | null;
    do?: number | null;
    tds?: number | null;
    ec?: number | null;
    conductivity?: number | null;
  };
  units?: {
    ph?: string;
    temperature?: string;
    salinity?: string;
    dissolvedOxygen?: string;
    dissolved_oxygen?: string;
    tds?: string;
    ec?: string;
    conductivity?: string;
  };
  status?: {
    ph?: string;
    temperature?: string;
    salinity?: string;
    dissolvedOxygen?: string;
    dissolved_oxygen?: string;
    tds?: string;
    ec?: string;
    conductivity?: string;
  };
  deviceStatus?: {
    esp32_connected?: boolean;
    sensor_bus_ok?: boolean;
    last_ping?: string;
  };
}

/**
 * Raw conceptual backend format for fuzzy classification
 */
export interface RawBackendClassification {
  pondId?: string;
  pond_id?: string;
  classification?: string; // "NORMAL" | "WARNING" | "CRITICAL" | "OPTIMAL" | "WASPADA" | "BAHAYA"
  evaluatedAt?: string;
  evaluated_at?: string;
  confidence?: number;
  score?: number;
  summary?: string;
  factors?: Array<{
    parameter: string;
    value: number | string;
    unit?: string;
    influence?: 'high' | 'moderate' | 'low';
    note?: string;
  }>;
  triggering_factors?: Array<{
    parameter: string;
    observed_value: number | string;
    unit?: string;
    influence?: 'high' | 'moderate' | 'low';
    note?: string;
  }>;
}

/**
 * Raw conceptual backend format for alert
 */
export interface RawBackendAlert {
  id: string | number;
  severity: string; // "warning" | "critical" | "info"
  title: string;
  message?: string;
  description?: string;
  parameter?: string;
  value?: number | string;
  measured_value?: number | string;
  unit?: string;
  timestamp: string;
  acknowledged?: boolean;
  acknowledged_at?: string | null;
}

/**
 * History query params
 */
export interface HistoryQueryParams {
  parameter?: string;
  range?: '1h' | '24h' | '7d' | 'custom';
  startDate?: string;
  endDate?: string;
  limit?: number;
}
