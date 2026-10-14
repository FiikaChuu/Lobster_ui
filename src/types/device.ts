/**
 * IoT Hardware and Connection Pipeline Types
 */

export type NodeConnectionStatus = 'connected' | 'disconnected' | 'degraded' | 'unknown' | 'not_reported';

export interface DataFlowNode {
  id: 'sensors' | 'esp32' | 'api' | 'database' | 'fuzzy' | 'dashboard';
  title: string;
  subtitle: string;
  status: NodeConnectionStatus;
  lastReportedAt?: string | null;
  detail?: string;
  ipAddress?: string;
  firmwareVersion?: string;
  uptimeSeconds?: number;
}

export interface SystemPipelineStatus {
  overallHealth: 'healthy' | 'degraded' | 'offline' | 'unknown';
  nodes: {
    sensors: DataFlowNode;
    esp32: DataFlowNode;
    api: DataFlowNode;
    database: DataFlowNode;
    fuzzy: DataFlowNode;
    dashboard: DataFlowNode;
  };
  lastCheckedAt: string;
}
