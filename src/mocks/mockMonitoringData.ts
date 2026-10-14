/**
 * Mock Data Generator for Lobster Monitoring Dashboard
 * All values are structured demo records and clearly marked as DEMO.
 */

import type { ParameterKey, HistoricalDataPoint } from '../types/sensor';
import type { MonitoringSnapshot } from '../types/monitoring';
import type { EnvironmentalAlert } from '../types/alert';
import type { FuzzyClassificationResult } from '../types/classification';
import type { SystemPipelineStatus } from '../types/device';
import type { DemoScenarioId } from './mockScenarios';

/**
 * Generate historical time-series curves
 */
export function generateMockHistory(
  _parameter: ParameterKey,
  baseValue: number,
  variance: number,
  pointsCount = 24,
  intervalMinutes = 60
): HistoricalDataPoint[] {
  const points: HistoricalDataPoint[] = [];
  const now = new Date();

  for (let i = pointsCount - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    // Smooth wave pattern
    const wave = Math.sin((pointsCount - i) * 0.4) * variance * 0.6;
    const noise = (Math.random() - 0.5) * variance * 0.4;
    const rawVal = Number((baseValue + wave + noise).toFixed(2));
    
    points.push({
      timestamp: time.toISOString(),
      value: rawVal,
      status: 'normal'
    });
  }

  return points;
}

export function buildMockSnapshot(scenario: DemoScenarioId = 'normal', pondId = 'POOL-01'): MonitoringSnapshot {
  const now = new Date();

  if (scenario === 'api_error') {
    throw new Error('503 Service Unavailable: Simulated backend downtime in Demo Mode');
  }

  if (scenario === 'empty_record') {
    return {
      pondId,
      deviceId: 'ESP32-LOBSTER-01',
      timestamp: now.toISOString(),
      isStale: false,
      parameters: {
        ph: { current: null, unit: 'pH', status: 'unknown', timestamp: null, min: null, max: null, avg: null, trend: 'unknown', history: [] },
        temperature: { current: null, unit: '°C', status: 'unknown', timestamp: null, min: null, max: null, avg: null, trend: 'unknown', history: [] },
        salinity: { current: null, unit: 'ppt', status: 'unknown', timestamp: null, min: null, max: null, avg: null, trend: 'unknown', history: [] },
        dissolvedOxygen: { current: null, unit: 'mg/L', status: 'unknown', timestamp: null, min: null, max: null, avg: null, trend: 'unknown', history: [] },
        tds: { current: null, unit: 'ppm', status: 'unknown', timestamp: null, min: null, max: null, avg: null, trend: 'unknown', history: [] },
        ec: { current: null, unit: 'mS/cm', status: 'unknown', timestamp: null, min: null, max: null, avg: null, trend: 'unknown', history: [] }
      },
      classification: {
        classification: 'pending',
        evaluatedAt: null,
        summary: 'Menunggu data telemetri pertama untuk dievaluasi oleh sistem.',
        triggeringFactors: []
      },
      alerts: [],
      pipeline: {
        overallHealth: 'unknown',
        nodes: {
          sensors: { id: 'sensors', title: 'Sensor Fisik', subtitle: 'pH, Suhu, Salinitas, DO', status: 'unknown' },
          esp32: { id: 'esp32', title: 'Mikrokontroler ESP32', subtitle: 'IoT Edge Controller', status: 'connected' },
          api: { id: 'api', title: 'REST API Gateway', subtitle: 'HTTP Endpoints', status: 'connected' },
          database: { id: 'database', title: 'Database Telemetri', subtitle: 'Time-series Storage', status: 'connected' },
          fuzzy: { id: 'fuzzy', title: 'Model Fuzzy Logic', subtitle: 'Mesin Inferensi', status: 'not_reported' },
          dashboard: { id: 'dashboard', title: 'Web Dashboard', subtitle: 'Monitoring Client', status: 'connected' }
        },
        lastCheckedAt: now.toISOString()
      }
    };
  }

  // Base parameters based on scenario
  let phVal = 7.95;
  let tempVal = 28.4;
  let salVal = 32.2;
  let doVal = 5.65;
  let timeStampDate = now;
  let isStale = false;
  let classificationResult: FuzzyClassificationResult;
  let alerts: EnvironmentalAlert[] = [];
  let pipelineHealth: SystemPipelineStatus['overallHealth'] = 'healthy';
  let esp32Status: SystemPipelineStatus['nodes']['esp32']['status'] = 'connected';
  let sensorStatus: SystemPipelineStatus['nodes']['sensors']['status'] = 'connected';

  if (scenario === 'warning_hypoxia') {
    phVal = 7.45;
    tempVal = 29.8;
    salVal = 33.5;
    doVal = 4.15; // Warning DO < 4.5
    classificationResult = {
      classification: 'warning',
      evaluatedAt: now.toISOString(),
      confidence: 0.88,
      summary: 'Kondisi perairan memerlukan perhatian: Penurunan oksigen terlarut berisiko hipoksia.',
      triggeringFactors: [
        { parameter: 'Dissolved Oxygen (DO)', observedValue: 4.15, unit: 'mg/L', influence: 'high', note: 'Mendekati batas hipoksia lobster' },
        { parameter: 'Suhu Air', observedValue: 29.8, unit: '°C', influence: 'moderate', note: 'Meningkatkan laju konsumsi O2' }
      ],
      recommendation: 'Aktifkan aerasi tambahan dan periksa sirkulasi air pada bak pemeliharaan.'
    };
    alerts = [
      {
        id: 'ALT-101',
        severity: 'warning',
        title: 'Penurunan DO Terdeteksi',
        message: 'Oksigen terlarut turun ke 4.15 mg/L. Berisiko stres respirasi pada benih lobster.',
        parameter: 'dissolvedOxygen',
        observedValue: 4.15,
        unit: 'mg/L',
        timestamp: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
        status: 'active',
        canAcknowledge: true
      }
    ];
  } else if (scenario === 'critical_acidification') {
    phVal = 6.82; // Critical pH
    tempVal = 31.5; // Critical Temp
    salVal = 27.2;
    doVal = 3.25; // Critical DO
    classificationResult = {
      classification: 'critical',
      evaluatedAt: now.toISOString(),
      confidence: 0.95,
      summary: 'Kondisi Perairan Kritis: Ancaman mortalitas lobster akibat asidifikasi dan hipertermia.',
      triggeringFactors: [
        { parameter: 'pH Perairan', observedValue: 6.82, unit: 'pH', influence: 'high', note: 'Asidifikasi ekstrem mengikis karapas lobster' },
        { parameter: 'Dissolved Oxygen (DO)', observedValue: 3.25, unit: 'mg/L', influence: 'high', note: 'Di bawah ambang batas toleransi' },
        { parameter: 'Suhu Air', observedValue: 31.5, unit: '°C', influence: 'high', note: 'Suhu di atas batas aman metabolisme' }
      ],
      recommendation: 'TINDAKAN SEGERA: Ganti air parsial, stabilkan buffer pH, dan maksimalkan aerator darurat.'
    };
    alerts = [
      {
        id: 'ALT-201',
        severity: 'critical',
        title: 'Asidifikasi Akut (pH Kritis)',
        message: 'Tingkat pH terukur 6.82 pH, jauh di bawah standar aman budidaya lobster laut (7.5 - 8.5).',
        parameter: 'ph',
        observedValue: 6.82,
        unit: 'pH',
        timestamp: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        status: 'active',
        canAcknowledge: true
      },
      {
        id: 'ALT-202',
        severity: 'critical',
        title: 'Hipoksia Berat (DO Kritis)',
        message: 'Kadar DO 3.25 mg/L berpotensi fatal bagi Panulirus ornatus dalam durasi > 3 jam.',
        parameter: 'dissolvedOxygen',
        observedValue: 3.25,
        unit: 'mg/L',
        timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        status: 'active',
        canAcknowledge: true
      }
    ];
  } else if (scenario === 'stale_data') {
    timeStampDate = new Date(now.getTime() - 48 * 60 * 1000); // 48 min ago
    isStale = true;
    esp32Status = 'degraded';
    classificationResult = {
      classification: 'warning',
      evaluatedAt: timeStampDate.toISOString(),
      summary: 'Data telemetri tertunda (Stale Data). Evaluasi menggunakan pembacaan terakhir.',
      triggeringFactors: [
        { parameter: 'Telemetri', observedValue: '>45 menit', influence: 'high', note: 'ESP32 belum mengirim pembaruan data terbaru' }
      ]
    };
    alerts = [
      {
        id: 'ALT-301',
        severity: 'warning',
        title: 'Koneksi Telemetri Tertunda',
        message: 'Tidak ada paket data baru dari mikrokontroler ESP32 selama 48 menit.',
        parameter: 'telemetry',
        timestamp: timeStampDate.toISOString(),
        status: 'active',
        canAcknowledge: true
      }
    ];
  } else if (scenario === 'disconnected') {
    timeStampDate = new Date(now.getTime() - 120 * 60 * 1000);
    isStale = true;
    pipelineHealth = 'offline';
    esp32Status = 'disconnected';
    sensorStatus = 'disconnected';
    classificationResult = {
      classification: 'pending',
      evaluatedAt: null,
      summary: 'Perangkat terputus. Menunggu sambungan ESP32 kembali online.',
      triggeringFactors: []
    };
    alerts = [
      {
        id: 'ALT-401',
        severity: 'critical',
        title: 'ESP32 Tidak Terhubung',
        message: 'Koneksi telemetri ke bak pemeliharaan terputus total.',
        timestamp: now.toISOString(),
        status: 'active',
        canAcknowledge: false
      }
    ];
  } else {
    // Normal / Optimal
    classificationResult = {
      classification: 'normal',
      evaluatedAt: now.toISOString(),
      confidence: 0.94,
      summary: 'Mutu perairan optimal. Seluruh parameter berada pada standar baku mutu lobster air laut.',
      triggeringFactors: [
        { parameter: 'pH', observedValue: 7.95, unit: 'pH', influence: 'low', note: 'Sangat stabil' },
        { parameter: 'Suhu', observedValue: 28.4, unit: '°C', influence: 'low', note: 'Suhu tropis nyaman' },
        { parameter: 'Salinitas', observedValue: 32.2, unit: 'ppt', influence: 'low', note: 'Salinitas alami' },
        { parameter: 'DO', observedValue: 5.65, unit: 'mg/L', influence: 'low', note: 'Kandungan oksigen prima' }
      ],
      recommendation: 'Pertahankan debit sirkulasi air dan jadwal aerasi normal.'
    };
  }

  const histPh = generateMockHistory('ph', phVal, 0.15, 24, 60);
  const histTemp = generateMockHistory('temperature', tempVal, 0.5, 24, 60);
  const histSal = generateMockHistory('salinity', salVal, 0.4, 24, 60);
  const histDO = generateMockHistory('dissolvedOxygen', doVal, 0.35, 24, 60);

  return {
    pondId,
    deviceId: 'ESP32-LOBSTER-01',
    timestamp: timeStampDate.toISOString(),
    isStale,
    parameters: {
      ph: {
        current: phVal,
        unit: 'pH',
        status: scenario === 'critical_acidification' ? 'critical' : 'normal',
        timestamp: timeStampDate.toISOString(),
        min: 7.8,
        max: 8.1,
        avg: 7.95,
        trend: scenario === 'critical_acidification' ? 'down' : 'stable',
        trendDelta: scenario === 'critical_acidification' ? -0.4 : 0.05,
        history: histPh
      },
      temperature: {
        current: tempVal,
        unit: '°C',
        status: scenario === 'critical_acidification' ? 'critical' : scenario === 'warning_hypoxia' ? 'warning' : 'normal',
        timestamp: timeStampDate.toISOString(),
        min: 27.8,
        max: 28.9,
        avg: 28.3,
        trend: scenario === 'critical_acidification' ? 'up' : 'stable',
        trendDelta: scenario === 'critical_acidification' ? 1.4 : -0.2,
        history: histTemp
      },
      salinity: {
        current: salVal,
        unit: 'ppt',
        status: 'normal',
        timestamp: timeStampDate.toISOString(),
        min: 31.8,
        max: 32.6,
        avg: 32.2,
        trend: 'stable',
        trendDelta: 0.1,
        history: histSal
      },
      dissolvedOxygen: {
        current: doVal,
        unit: 'mg/L',
        status: scenario === 'critical_acidification' ? 'critical' : scenario === 'warning_hypoxia' ? 'warning' : 'normal',
        timestamp: timeStampDate.toISOString(),
        min: 5.2,
        max: 6.1,
        avg: 5.6,
        trend: scenario === 'normal' ? 'stable' : 'down',
        trendDelta: scenario === 'normal' ? 0.1 : -0.5,
        history: histDO
      },
      tds: {
        current: null, // TDS not active by default (keeps honest to prompt instruction)
        unit: 'ppm',
        status: 'unknown',
        timestamp: null,
        min: null,
        max: null,
        avg: null,
        trend: 'unknown',
        history: []
      },
      ec: {
        current: null, // EC not active by default
        unit: 'mS/cm',
        status: 'unknown',
        timestamp: null,
        min: null,
        max: null,
        avg: null,
        trend: 'unknown',
        history: []
      }
    },
    classification: classificationResult,
    alerts,
    pipeline: {
      overallHealth: pipelineHealth,
      nodes: {
        sensors: {
          id: 'sensors',
          title: 'Sensor Fisik',
          subtitle: 'pH, Suhu, Salinitas, DO',
          status: sensorStatus,
          lastReportedAt: timeStampDate.toISOString(),
          detail: '4 Sensor Analog & 1-Wire'
        },
        esp32: {
          id: 'esp32',
          title: 'Mikrokontroler ESP32',
          subtitle: 'IoT Edge Node',
          status: esp32Status,
          lastReportedAt: timeStampDate.toISOString(),
          ipAddress: '192.168.1.142',
          firmwareVersion: 'v1.4.2-lobster-edge'
        },
        api: {
          id: 'api',
          title: 'REST API Gateway',
          subtitle: 'HTTP Endpoints',
          status: 'connected',
          lastReportedAt: now.toISOString()
        },
        database: {
          id: 'database',
          title: 'Database Telemetri',
          subtitle: 'Time-series Storage',
          status: 'connected',
          lastReportedAt: timeStampDate.toISOString()
        },
        fuzzy: {
          id: 'fuzzy',
          title: 'Model Fuzzy Logic',
          subtitle: 'Mesin Inferensi Mutu Air',
          status: scenario === 'disconnected' ? 'not_reported' : 'connected',
          lastReportedAt: timeStampDate.toISOString()
        },
        dashboard: {
          id: 'dashboard',
          title: 'Web Dashboard',
          subtitle: 'Monitoring Client (Antarmuka)',
          status: 'connected',
          lastReportedAt: now.toISOString()
        }
      },
      lastCheckedAt: now.toISOString()
    }
  };
}
