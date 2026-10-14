import React, { useState } from 'react';
import { useMonitoring } from '../hooks/useMonitoring';
import { useSensorHistory } from '../hooks/useSensorHistory';
import { useAlerts } from '../hooks/useAlerts';
import { type NavigationTab } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { DashboardOverview } from './DashboardOverview';
import { WaterQualityPage } from './WaterQualityPage';
import { HistoricalDataPage } from './HistoricalDataPage';
import { AlertsPage } from './AlertsPage';
import { DeviceStatusPage } from './DeviceStatusPage';
import { SettingsPage } from './SettingsPage';

export const DashboardPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');

  const {
    data,
    state,
    error,
    isLoading,
    isRefreshing,
    isStale,
    lastUpdated,
    config,
    isPollingPaused,
    activeScenario,
    refresh,
    togglePolling,
    setPollingInterval,
    setDataProvider,
    changeScenario,
    setActivePond
  } = useMonitoring();

  const {
    history,
    timeRange,
    setTimeRange,
    refetch: refetchHistory
  } = useSensorHistory(config.activePondId);

  const {
    alerts,
    isLoading: isAlertsLoading,
    actionFeedback,
    acknowledge,
    clearFeedback
  } = useAlerts(config.activePondId);

  const unreadAlertCount = alerts.filter((a) => a.status === 'active').length;

  const handleRefreshAll = async () => {
    await Promise.all([refresh(), refetchHistory()]);
  };

  return (
    <div className="app-container">
      {/* Main Container */}
      <div className="app-main" style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar matching reference design */}
        <Navbar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            clearFeedback();
          }}
          unreadAlertCount={unreadAlertCount}
          onNavigateToAlerts={() => setCurrentTab('alerts')}
        />

        {/* Dynamic Page Content: Overview is strictly 100vh non-scrollable, subpages support natural vertical scrolling */}
        <main
          className="dashboard-content"
          style={{
            padding: '10px 16px',
            flex: 1,
            minHeight: 0,
            overflowY: currentTab === 'overview' ? 'hidden' : 'auto',
            overflowX: 'hidden'
          }}
        >
          {currentTab === 'overview' && (
            <DashboardOverview
              data={data}
              state={state}
              error={error}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              isStale={isStale}
              lastUpdated={lastUpdated}
              config={config}
              isPollingPaused={isPollingPaused}
              activeScenario={activeScenario}
              chartHistory={history}
              chartTimeRange={timeRange}
              onChartTimeRangeChange={setTimeRange}
              onRefresh={handleRefreshAll}
              onTogglePolling={togglePolling}
              onIntervalChange={setPollingInterval}
              onProviderChange={setDataProvider}
              onScenarioChange={changeScenario}
              onAcknowledgeAlert={acknowledge}
              alertFeedback={actionFeedback}
              onPondChange={setActivePond}
              onNavigateToWaterQuality={() => setCurrentTab('water_quality')}
              onNavigateToAlerts={() => setCurrentTab('alerts')}
            />
          )}

          {currentTab === 'water_quality' && (
            <WaterQualityPage
              data={data}
              history={history}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onRefresh={handleRefreshAll}
              isLoading={isLoading}
              isStale={isStale}
            />
          )}

          {currentTab === 'history' && (
            <HistoricalDataPage
              history={history}
              pondId={config.activePondId}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              isLoading={isAlertsLoading}
              onAcknowledge={acknowledge}
              feedbackMessage={actionFeedback}
            />
          )}

          {currentTab === 'device' && (
            <DeviceStatusPage
              pipeline={data?.pipeline}
              deviceId={data?.deviceId || 'ESP32-LOBSTER-01'}
              pondId={config.activePondId}
              lastUpdated={lastUpdated}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              config={config}
              onUpdateProvider={setDataProvider}
              onUpdatePolling={setPollingInterval}
              activeScenario={activeScenario}
              onScenarioChange={changeScenario}
            />
          )}
        </main>
      </div>
    </div>
  );
};
