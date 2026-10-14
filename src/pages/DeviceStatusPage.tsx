import React from 'react';
import type { SystemPipelineStatus } from '../types/device';
import { formatDateTime } from '../utils/dateFormatter';
import { DataFlowPanel } from '../components/connections/DataFlowPanel';
import { Cpu, Radio, Server } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface DeviceStatusPageProps {
  pipeline?: SystemPipelineStatus;
  deviceId: string;
  pondId: string;
  lastUpdated: string | null;
}

export const DeviceStatusPage: React.FC<DeviceStatusPageProps> = ({
  pipeline,
  deviceId,
  pondId,
  lastUpdated
}) => {
  const esp32Node = pipeline?.nodes.esp32;
  const isOnline = esp32Node?.status === 'connected';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Status Perangkat IoT & Telemetri</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Diagnostik mikrokontroler edge ESP32 dan integritas jalur data budidaya lobster
        </p>
      </div>

      {/* Hardware Diagnostics Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* ESP32 Module Card */}
        <div className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Cpu size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Node Mikrokontroler</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Model: ESP32-WROOM-32D</div>
              </div>
            </div>
            <Badge status={isOnline ? 'normal' : 'critical'} label={isOnline ? 'Online' : 'Offline'} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>ID Perangkat:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{deviceId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Alamat IP:</span>
              <span style={{ color: 'var(--text-secondary)' }}>{esp32Node?.ipAddress || '192.168.1.142 (DHCP)'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Firmware Edge:</span>
              <span style={{ color: 'var(--text-secondary)' }}>{esp32Node?.firmwareVersion || 'v1.4.2-lobster-edge'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Protokol Transport:</span>
              <span style={{ color: 'var(--text-secondary)' }}>HTTP REST / Polling Gateway</span>
            </div>
          </div>
        </div>

        {/* Physical Sensor Bus Card */}
        <div className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-normal)' }}>
                <Radio size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bus Sensor Perairan</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>4 Probe Terpasang</div>
              </div>
            </div>
            <Badge status="normal" label="Probe Aktif" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Probe Suhu:</span>
              <span style={{ color: 'var(--text-primary)' }}>DS18B20 (Waterproof 1-Wire)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Probe pH:</span>
              <span style={{ color: 'var(--text-primary)' }}>pH Sensor Analog E-201-C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Probe Salinitas:</span>
              <span style={{ color: 'var(--text-primary)' }}>EC / Salinity Sensor Probe</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Probe Dissolved Oxygen:</span>
              <span style={{ color: 'var(--text-primary)' }}>Galvanic / Optical DO Sensor</span>
            </div>
          </div>
        </div>

        {/* Telemetry Health Summary Card */}
        <div className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--accent-teal-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)' }}>
                <Server size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Kesehatan Jalur Data</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Integritas Telemetri</div>
              </div>
            </div>
            <Badge status={pipeline?.overallHealth === 'healthy' ? 'normal' : 'warning'} label="Kesehatan Baik" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Tangki Terhubung:</span>
              <span style={{ color: 'var(--text-primary)' }}>{pondId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Pembaruan Terakhir:</span>
              <span style={{ color: 'var(--text-secondary)' }}>{lastUpdated ? formatDateTime(lastUpdated) : 'Belum ada data'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Format Serialisasi:</span>
              <span style={{ color: 'var(--text-secondary)' }}>JSON REST Payload (ISO 8601)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Toleransi Jeda (Stale):</span>
              <span style={{ color: 'var(--text-secondary)' }}>60 Detik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Architecture Pipeline Visualization */}
      <DataFlowPanel pipeline={pipeline} />
    </div>
  );
};
