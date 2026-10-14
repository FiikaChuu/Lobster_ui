import React from 'react';
import type { SystemPipelineStatus, NodeConnectionStatus } from '../../types/device';
import { Cpu, Server, Database, BrainCircuit, Monitor, Radio } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface DataFlowPanelProps {
  pipeline?: SystemPipelineStatus;
}

export const DataFlowPanel: React.FC<DataFlowPanelProps> = ({ pipeline }) => {
  const nodes = pipeline?.nodes;

  const getNodeColor = (status: NodeConnectionStatus = 'not_reported') => {
    switch (status) {
      case 'connected': return 'var(--status-normal)';
      case 'degraded': return 'var(--status-warning)';
      case 'disconnected': return 'var(--status-critical)';
      case 'unknown':
      case 'not_reported':
      default:
        return 'var(--text-tertiary)';
    }
  };

  const getStatusText = (status: NodeConnectionStatus = 'not_reported') => {
    switch (status) {
      case 'connected': return 'Terhubung';
      case 'degraded': return 'Degradasi';
      case 'disconnected': return 'Terputus';
      case 'unknown': return 'Unknown';
      case 'not_reported': return 'Belum Dilaporkan';
    }
  };

  const pipelineStages = [
    {
      id: 'sensors',
      title: 'Sensor Fisik',
      sub: 'pH, Suhu, Salinitas, DO',
      icon: <Radio size={18} />,
      status: nodes?.sensors.status ?? 'not_reported',
      detail: nodes?.sensors.detail
    },
    {
      id: 'esp32',
      title: 'ESP32 IoT Node',
      sub: 'Mikrokontroler Edge',
      icon: <Cpu size={18} />,
      status: nodes?.esp32.status ?? 'not_reported',
      detail: nodes?.esp32.ipAddress || nodes?.esp32.detail
    },
    {
      id: 'api',
      title: 'REST API',
      sub: 'Endpoints & JSON',
      icon: <Server size={18} />,
      status: nodes?.api.status ?? 'not_reported',
      detail: nodes?.api.detail
    },
    {
      id: 'database',
      title: 'Database Telemetri',
      sub: 'Time-series Storage',
      icon: <Database size={18} />,
      status: nodes?.database.status ?? 'not_reported',
      detail: nodes?.database.detail
    },
    {
      id: 'fuzzy',
      title: 'Fuzzy Logic Model',
      sub: 'Mesin Inferensi Server',
      icon: <BrainCircuit size={18} />,
      status: nodes?.fuzzy.status ?? 'not_reported',
      detail: nodes?.fuzzy.detail
    },
    {
      id: 'dashboard',
      title: 'Web Dashboard',
      sub: 'Frontend Antarmuka',
      icon: <Monitor size={18} />,
      status: 'connected' as NodeConnectionStatus,
      detail: 'React SPA Client'
    }
  ];

  return (
    <div className="pipeline-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alur Arsitektur Telemetri & Data</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Sensor Fisik → ESP32 → REST API → Database → Fuzzy Logic → Web Dashboard
          </p>
        </div>

        <Badge
          status={
            pipeline?.overallHealth === 'healthy' ? 'normal' :
            pipeline?.overallHealth === 'degraded' ? 'warning' :
            pipeline?.overallHealth === 'offline' ? 'critical' : 'pending'
          }
          label={`Status: ${pipeline?.overallHealth || 'Tidak Diketahui'}`}
        />
      </div>

      {/* Pipeline Flow Visualization */}
      <div className="pipeline-nodes-flow">
        {pipelineStages.map((stage, idx) => {
          const color = getNodeColor(stage.status);
          const isLast = idx === pipelineStages.length - 1;

          return (
            <React.Fragment key={stage.id}>
              <div className="pipeline-node" style={{ borderColor: stage.status === 'connected' ? 'var(--border-light)' : 'var(--border-light)' }}>
                <div
                  className="pipeline-node-icon"
                  style={{
                    color,
                    borderColor: `rgba(${stage.status === 'connected' ? '16, 185, 129' : stage.status === 'disconnected' ? '244, 63, 94' : '148, 163, 184'}, 0.4)`
                  }}
                >
                  {stage.icon}
                </div>
                <span className="pipeline-node-name">{stage.title}</span>
                <span className="pipeline-node-sub">{stage.sub}</span>

                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    marginTop: '0.2rem',
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: color
                    }}
                  />
                  {getStatusText(stage.status)}
                </span>
              </div>

              {!isLast && <div className="pipeline-connector" />}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
        * Visualisasi menunjukkan status pelaporan aktual komponen sistem. Status yang belum diverifikasi oleh backend ditampilkan sebagai "Belum Dilaporkan" (Not Reported) untuk menjaga keabsahan data ilmiah.
      </div>
    </div>
  );
};
