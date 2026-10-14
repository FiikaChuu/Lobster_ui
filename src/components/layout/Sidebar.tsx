import React from 'react';
import {
  LayoutDashboard,
  Droplets,
  History,
  AlertTriangle,
  Cpu,
  Settings,
  ShieldCheck,
  Compass
} from 'lucide-react';

export type NavigationTab = 'overview' | 'water_quality' | 'history' | 'alerts' | 'device' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  unreadAlertCount
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'overview',
      label: 'Ringkasan Utama',
      icon: <LayoutDashboard size={16} />
    },
    {
      id: 'water_quality',
      label: 'Kualitas Air & Sensor',
      icon: <Droplets size={16} />
    },
    {
      id: 'history',
      label: 'Tabel Riwayat Sensor',
      icon: <History size={16} />
    },
    {
      id: 'alerts',
      label: 'Pusat Peringatan',
      icon: <AlertTriangle size={16} />,
      badge: unreadAlertCount
    },
    {
      id: 'device',
      label: 'Status Perangkat IoT',
      icon: <Cpu size={16} />
    },
    {
      id: 'settings',
      label: 'Pengaturan & Integrasi',
      icon: <Settings size={16} />
    }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Compass size={18} />
        </div>
        <div>
          <div className="brand-title">LOBSTER AQM</div>
          <div className="brand-subtitle">Smart Water Telemetry</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu Pemantauan</div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <div className="nav-item-content">
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    background: 'var(--status-critical)',
                    color: 'var(--text-white)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.1rem 0.4rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    lineHeight: 1.3
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <div
          style={{
            background: 'var(--bg-inset)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.7rem',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem'
          }}
        >
          <ShieldCheck size={16} style={{ color: 'var(--status-normal)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sistem Siap Integrasi</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>Fuzzy Ready • ESP32 Bridge</div>
          </div>
        </div>

        <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          v1.0.0-PROD • Panulirus Telemetry
        </div>
      </div>
    </aside>
  );
};
