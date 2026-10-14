import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface HourlyTrendCardProps {
  title?: string;
}

export const HourlyTrendCard: React.FC<HourlyTrendCardProps> = ({
  title = 'Site Power & Telemetri 24 Jam'
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'power'>('telemetry');

  // 6 Time slices matching reference: 00:00, 02:30, 05:00, 07:30, 10:00, 12:30
  const timeSlices = [
    { time: '00:00', dots: 2, max: 10, label: 'Night Aeration' },
    { time: '02:30', dots: 3, max: 10, label: 'Low Flow' },
    { time: '05:00', dots: 5, max: 10, label: 'Sunrise Boost' },
    { time: '07:30', dots: 6, max: 10, label: 'Morning Peak' },
    { time: '10:00', dots: 4, max: 10, label: 'Normal Flow' },
    { time: '12:30', dots: 7, max: 10, label: 'Midday High DO' }
  ];

  return (
    <div className="bento-card hourly-trend-card">
      <div className="bento-card-header">
        <div className="card-title-with-info">
          <h3 className="bento-card-title">{title}</h3>
          <span title="Distribusi intensitas pengukuran sensor per interval waktu" style={{ display: 'inline-flex' }}>
            <Info size={12} className="info-icon" />
          </span>
        </div>

        {/* Toggle switch: [ Telemetri ] [ Daya ] */}
        <div className="trend-toggle-group">
          <button
            className={`trend-toggle-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            Telemetri
          </button>
          <button
            className={`trend-toggle-btn ${activeTab === 'power' ? 'active' : ''}`}
            onClick={() => setActiveTab('power')}
          >
            Daya
          </button>
        </div>
      </div>

      {/* Dot Matrix / Segmented Vertical Bar Visualization */}
      <div className="dot-matrix-container">
        {timeSlices.map((slice, colIdx) => (
          <div key={colIdx} className="dot-column">
            <div className="dot-stack">
              {Array.from({ length: slice.max }).map((_, dotIdx) => {
                // Bottom-up indexing: 0 is bottom, 9 is top
                const fromBottom = slice.max - 1 - dotIdx;
                const isLit = fromBottom < slice.dots;
                return (
                  <span
                    key={dotIdx}
                    className={`matrix-dot ${isLit ? 'dot-lit' : 'dot-dim'}`}
                  />
                );
              })}
            </div>
            <span className="dot-time-label">{slice.time}</span>
          </div>
        ))}
      </div>

      {/* Footnote text matching reference */}
      <div className="dot-matrix-footer">
        <span className="info-dot" />
        <span>Total energi aerasi terpakai 28.25 kWh. Laju telemetri MQTT 100% konsisten.</span>
      </div>
    </div>
  );
};
