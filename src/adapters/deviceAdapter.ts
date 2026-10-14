/**
 * Device and System Pipeline Adapter
 * Normalizes reporting state across the 6 architecture nodes:
 * Physical Sensors -> ESP32 -> REST API -> Database -> Fuzzy Logic Model -> Web Dashboard
 */

import type { SystemPipelineStatus, NodeConnectionStatus } from '../types/device';

export function adaptPipelineStatus(
  rawPipeline: any,
  rawDeviceStatus?: any,
  lastUpdatedTimestamp?: string
): SystemPipelineStatus {
  // If no hardware/pipeline data is supplied by backend, nodes report 'not_reported' or 'unknown'
  const esp32Connected = rawDeviceStatus?.esp32_connected ?? rawPipeline?.esp32?.connected;
  const esp32Status: NodeConnectionStatus =
    esp32Connected === true ? 'connected' : esp32Connected === false ? 'disconnected' : 'not_reported';

  const sensorStatus: NodeConnectionStatus =
    rawDeviceStatus?.sensor_bus_ok === true
      ? 'connected'
      : rawDeviceStatus?.sensor_bus_ok === false
      ? 'degraded'
      : esp32Status === 'connected'
      ? 'connected'
      : 'not_reported';

  const apiStatus: NodeConnectionStatus = rawPipeline?.api?.status ?? 'connected'; // If we got a response, API is connected
  const dbStatus: NodeConnectionStatus = rawPipeline?.database?.status ?? (rawPipeline ? 'connected' : 'not_reported');
  const fuzzyStatus: NodeConnectionStatus = rawPipeline?.fuzzy?.status ?? (rawPipeline ? 'connected' : 'not_reported');

  return {
    overallHealth:
      esp32Status === 'disconnected'
        ? 'offline'
        : esp32Status === 'not_reported'
        ? 'unknown'
        : 'healthy',
    nodes: {
      sensors: {
        id: 'sensors',
        title: 'Sensor Fisik',
        subtitle: 'pH, Suhu, Salinitas, DO',
        status: sensorStatus,
        lastReportedAt: lastUpdatedTimestamp || null,
        detail: rawDeviceStatus?.sensor_detail || 'Bus 1-Wire & Analog ADC'
      },
      esp32: {
        id: 'esp32',
        title: 'Mikrokontroler ESP32',
        subtitle: 'IoT Edge Controller',
        status: esp32Status,
        lastReportedAt: rawDeviceStatus?.last_ping || lastUpdatedTimestamp || null,
        detail: rawDeviceStatus?.ipAddress ? `IP: ${rawDeviceStatus.ipAddress}` : 'WiFi Telemetri'
      },
      api: {
        id: 'api',
        title: 'REST API Gateway',
        subtitle: 'HTTP Endpoints',
        status: apiStatus,
        lastReportedAt: new Date().toISOString(),
        detail: 'JSON Serializer & CORS'
      },
      database: {
        id: 'database',
        title: 'Database Telemetri',
        subtitle: 'Time-series Storage',
        status: dbStatus,
        lastReportedAt: lastUpdatedTimestamp || null,
        detail: 'Penyimpanan Riwayat Sensor'
      },
      fuzzy: {
        id: 'fuzzy',
        title: 'Model Fuzzy Logic',
        subtitle: 'Mesin Inferensi Mamdani/Sugeno',
        status: fuzzyStatus,
        lastReportedAt: lastUpdatedTimestamp || null,
        detail: 'Evaluasi Mutu Air Server-side'
      },
      dashboard: {
        id: 'dashboard',
        title: 'Web Dashboard',
        subtitle: 'Monitoring Client (Antarmuka)',
        status: 'connected',
        lastReportedAt: new Date().toISOString(),
        detail: 'React SPA Client'
      }
    },
    lastCheckedAt: new Date().toISOString()
  };
}
