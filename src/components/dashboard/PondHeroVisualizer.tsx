import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, BarChart2, Eye, ChevronDown, MapPin, Clock, Waves } from 'lucide-react';
import type { ParameterKey, ParameterSummary, HistoricalDataPoint } from '../../types/sensor';
import type { DashboardConnectionState } from '../../types/monitoring';
import { TimeSeriesChart } from '../charts/TimeSeriesChart';
import { PondWaterOverlay } from './PondWaterOverlay';
import pondVideoMute from '../../assets/pond 3d mute.mp4';
import pondPoster from '../../assets/pond_video_poster.jpg';
import pondImg from '../../assets/pond_3d.png';

interface PondOption {
  id: string;
  name: string;
  species: string;
  label: string;
}

const POND_OPTIONS: PondOption[] = [
  { id: 'POOL-01', name: 'Bak A-01', species: 'P. ornatus - Mutiara', label: 'Bak A-01 (P. ornatus - Mutiara)' },
  { id: 'POOL-02', name: 'Bak B-02', species: 'P. homarus - Pasir', label: 'Bak B-02 (P. homarus - Pasir)' },
  { id: 'NURSERY-01', name: 'Bak C-01', species: 'Juvenil Pendedahan', label: 'Bak C-01 (Juvenil Pendedahan)' }
];

interface PondHeroVisualizerProps {
  pondId: string;
  pondName?: string;
  speciesName?: string;
  videoSrc?: string;
  parameters?: Record<ParameterKey, ParameterSummary>;
  chartHistory: Record<ParameterKey, HistoricalDataPoint[]>;
  chartTimeRange: '1h' | '24h' | '7d';
  onChartTimeRangeChange: (range: '1h' | '24h' | '7d') => void;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  onPondChange?: (pondId: string) => void;
  connectionState?: DashboardConnectionState;
  dataProvider?: 'demo' | 'real';
}

export const PondHeroVisualizer: React.FC<PondHeroVisualizerProps> = ({
  pondId,
  pondName,
  speciesName,
  videoSrc,
  parameters: _parameters,
  chartHistory,
  chartTimeRange,
  onChartTimeRangeChange,
  onRefresh,
  isLoading,
  onPondChange,
  connectionState = 'connected',
  dataProvider = 'demo'
}) => {
  const [viewMode, setViewMode] = useState<'3d' | 'chart'>('3d');
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeVideoSrc = videoSrc || pondVideoMute;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay handled
      });
    }
  }, [activeVideoSrc]);

  const currentPond = POND_OPTIONS.find((p) => p.id === pondId) || POND_OPTIONS[0];
  const activeName = pondName && pondName !== 'Tambak A-01' ? pondName : currentPond.name;
  const activeSpecies = speciesName && speciesName !== 'Panulirus ornatus (Lobster Mutiara)' ? speciesName : currentPond.species;

  const isConnected = connectionState === 'connected' || connectionState === 'demo_mode';

  return (
    <div className="pond-hero-container">
      {/* Floating Minimal Controls (top-right, subtle glass pill, no boxy header) */}
      <div className="pond-floating-controls">
        <div className="pond-toggle-glass-pill">
          <button
            type="button"
            className={`pond-toggle-sub-btn ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
            title="Tampilan Visual 3D Tambak"
          >
            <Eye size={13} />
            <span>3D View</span>
          </button>
          <button
            type="button"
            className={`pond-toggle-sub-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
            title="Grafik Tren Waktu Nyata"
          >
            <BarChart2 size={13} />
            <span>Grafik</span>
          </button>
        </div>

        <button
          type="button"
          className="pond-refresh-glass-btn"
          onClick={onRefresh}
          disabled={isLoading}
          title="Sinkronisasi Telemetri"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Pond Visual Area */}
      <div className="pond-visual-viewport">
        {/* Persistent Background Video Layer: Always active so video silhouette/shadow remains when closed */}
        <div className={`pond-3d-wrapper ${viewMode === 'chart' ? 'chart-mode-dimmed' : ''}`}>
          <div className="pond-3d-scene-container">
            {/* Primary Video Element with Poster & Fallback */}
            {!videoError ? (
              <video
                ref={videoRef}
                src={activeVideoSrc}
                poster={pondPoster}
                autoPlay
                loop
                muted
                playsInline
                className="pond-media-element pond-media-video"
                onError={() => setVideoError(true)}
                aria-label="Animasi Looping 3D Tambak Lobster"
              />
            ) : (
              <img
                src={pondImg}
                alt="Isometric 3D Lobster Pond"
                className="pond-media-element pond-media-image"
              />
            )}

            {/* Realistic Animated Water Surface, Caustics & Aerator Ripples (active as fallback) */}
            {videoError && <PondWaterOverlay />}
          </div>
        </div>

        {/* Chart View Overlay: Floats on top when chart mode is active, showing the video silhouette underneath */}
        {viewMode === 'chart' && (
          <div className="pond-chart-wrapper">
            <TimeSeriesChart
              history={chartHistory}
              isLoading={isLoading}
              timeRange={chartTimeRange}
              onTimeRangeChange={onChartTimeRangeChange}
              onRefresh={onRefresh}
            />
          </div>
        )}

        {/* Seamless Glassmorphism Identity Dock (Flows across bottom of pond, no separate box) */}
        <div className="pond-seamless-identity-overlay">
          <div className="pond-blend-left">
            <div className="pond-badge-avatar">
              <Waves size={20} />
            </div>

            <div className="pond-blend-identity-text">
              <div className="pond-title-interactive-row">
                {onPondChange ? (
                  <div className="pond-seamless-select-container">
                    <select
                      className="pond-seamless-select"
                      value={pondId}
                      onChange={(e) => onPondChange(e.target.value)}
                      aria-label="Pilih Bak Kolam"
                    >
                      {POND_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pond-select-chevron" />
                  </div>
                ) : (
                  <h2 className="pond-seamless-title">{activeName}</h2>
                )}

                <span
                  className={`pond-live-indicator-pill ${dataProvider === 'demo' ? 'pill-demo' : 'pill-live'}`}
                  title={`Status: ${connectionState}`}
                >
                  <span
                    className="live-dot"
                    style={{ background: isConnected ? '#10b981' : '#ef4444' }}
                  />
                  {dataProvider === 'demo' ? 'DEMO' : 'LIVE'}
                </span>
              </div>

              <div className="pond-subspecies-text">{activeSpecies}</div>

              <div className="pond-meta-location-row">
                <MapPin size={12} className="meta-pin-icon" />
                <span>Tambak A01 — Situbondo, Jawa Timur</span>
              </div>
            </div>
          </div>

          <div className="pond-blend-metrics-group">
            <div className="pond-metric-stat">
              <div className="pond-metric-main-val">
                274 <small>ekor</small>
              </div>
              <div className="pond-metric-sublabel">Jumlah Stok</div>
            </div>

            <div className="pond-metric-stat stat-update">
              <div className="pond-update-header">
                <Clock size={12} />
                <span>Terakhir Update</span>
              </div>
              <div className="pond-update-val">
                12 Okt 2026 • 17:45
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

