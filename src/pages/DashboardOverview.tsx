import React from 'react';
import type { MonitoringSnapshot, DashboardConnectionState } from '../types/monitoring';
import type { DemoScenarioId } from '../mocks/mockScenarios';
import type { AppRuntimeConfig } from '../services/api/apiConfig';
import type { ParameterKey, HistoricalDataPoint } from '../types/sensor';
import { CurrentConditionsCard } from '../components/dashboard/CurrentConditionsCard';
import { ConsumptionCard } from '../components/dashboard/ConsumptionCard';
import { BentoAlertsList } from '../components/dashboard/BentoAlertsList';
import { PondHeroVisualizer } from '../components/dashboard/PondHeroVisualizer';
import { BentoStockMetricsCard } from '../components/dashboard/BentoStockMetricsCard';
import { BentoControlsCard } from '../components/dashboard/BentoControlsCard';
import pondVideoDefault from '../assets/pond 3d mute.mp4';

interface DashboardOverviewProps {
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
  chartHistory: Record<ParameterKey, HistoricalDataPoint[]>;
  chartTimeRange: '1h' | '24h' | '7d';
  onChartTimeRangeChange: (range: '1h' | '24h' | '7d') => void;
  onRefresh: () => Promise<void>;
  onTogglePolling: () => void;
  onIntervalChange: (ms: number) => void;
  onProviderChange: (p: 'demo' | 'real') => void;
  onScenarioChange: (s: DemoScenarioId) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  alertFeedback: string | null;
  onPondChange: (pondId: string) => void;
  onNavigateToWaterQuality?: () => void;
  onNavigateToAlerts?: () => void;
  pondVideoSrc?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  state,
  error: _error,
  isLoading,
  isRefreshing,
  isStale: _isStale,
  lastUpdated,
  config,
  isPollingPaused,
  activeScenario,
  chartHistory,
  chartTimeRange,
  onChartTimeRangeChange,
  onRefresh,
  onTogglePolling,
  onIntervalChange,
  onProviderChange,
  onScenarioChange,
  onAcknowledgeAlert,
  alertFeedback,
  onPondChange,
  onNavigateToWaterQuality,
  onNavigateToAlerts,
  pondVideoSrc
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: '8px' }}>
      {/* 3-Column Bento Grid Layout (100% height, zero vertical scroll) */}
      <div className="bento-dashboard-layout">
        {/* Column 1 (Left): Current Condition, Alert */}
        <div className="bento-col bento-col-left">
          <CurrentConditionsCard
            parameters={data?.parameters}
            chartHistory={chartHistory}
            isLoading={isLoading}
            onViewDetails={onNavigateToWaterQuality}
            lastUpdatedText={lastUpdated ? 'Baru saja' : 'Menghubungkan...'}
          />

          <BentoAlertsList
            alerts={data?.alerts || []}
            systemError={_error}
            isStale={_isStale}
            connectionState={state}
            dataProvider={config.dataProvider}
            onNavigateToAlerts={onNavigateToAlerts}
            onAcknowledge={onAcknowledgeAlert}
            feedbackMessage={alertFeedback}
          />
        </div>

        {/* Column 2 (Center Hero): 3D Isometric Pond + Seamless Identity */}
        <div className="bento-col bento-col-center">
          <PondHeroVisualizer
            pondId={config.activePondId}
            onPondChange={onPondChange}
            connectionState={state}
            dataProvider={config.dataProvider}
            parameters={data?.parameters}
            chartHistory={chartHistory}
            chartTimeRange={chartTimeRange}
            onChartTimeRangeChange={onChartTimeRangeChange}
            onRefresh={onRefresh}
            isLoading={isLoading || isRefreshing}
            videoSrc={pondVideoSrc || pondVideoDefault}
          />
        </div>

        {/* Column 3 (Right): Water Health & Stock Metrics, Consumption, Kontrol & Simulasi IoT */}
        <div className="bento-col bento-col-right">
          <BentoStockMetricsCard
            classification={data?.classification}
            isLoading={isLoading}
          />

          <ConsumptionCard
            powerKw={56.46}
            loadLevelPercent={56}
          />

          <BentoControlsCard
            dataProvider={config.dataProvider}
            activeScenario={activeScenario}
            onScenarioChange={onScenarioChange}
            onProviderChange={onProviderChange}
            isPollingPaused={isPollingPaused}
            onTogglePolling={onTogglePolling}
            onManualRefresh={onRefresh}
            isRefreshing={isRefreshing}
            pollingIntervalMs={config.pollingIntervalMs}
            onIntervalChange={onIntervalChange}
          />
        </div>
      </div>
    </div>
  );
};
