import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import type { NavigationTab } from './Sidebar';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadAlertCount: number;
  onNavigateToAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  unreadAlertCount,
  onNavigateToAlerts
}) => {
  const navTabs: Array<{ id: NavigationTab; label: string; badge?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'water_quality', label: 'Analytics' },
    { id: 'alerts', label: 'Monitoring', badge: unreadAlertCount },
    { id: 'history', label: 'Riwayat' },
    { id: 'device', label: 'Perangkat' },
    { id: 'settings', label: 'Pengaturan' }
  ];

  return (
    <header className="top-bar-bento">
      {/* Left: Minimal Geometric Brand Mark (Matching reference screenshot) */}
      <div className="top-bar-brand">
        <button
          type="button"
          className="top-brand-icon-minimal"
          onClick={() => onTabChange('overview')}
          title="LOBSTER AQM - Beranda"
          aria-label="LOBSTER AQM - Beranda"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#000000">
            <circle cx="12" cy="7.2" r="4.2" />
            <circle cx="7.2" cy="15.5" r="4.2" />
            <circle cx="16.8" cy="15.5" r="4.2" />
          </svg>
        </button>
      </div>

      {/* Right: Navigation Pills + Bell + Profile (Right-aligned matching reference screenshot) */}
      <div className="top-bar-right-group">
        {/* Navigation Tabs Pills */}
        <nav className="top-nav-pills" aria-label="Navigasi Utama">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              className={`top-pill-btn ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="top-pill-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Notification Bell Button */}
        <button
          type="button"
          className="bento-bell-btn"
          onClick={onNavigateToAlerts}
          title="Buka Pusat Peringatan"
          aria-label="Pusat Peringatan"
        >
          <Bell size={15} />
          {unreadAlertCount > 0 && (
            <span className="bell-badge-count">{unreadAlertCount}</span>
          )}
        </button>

        {/* User Profile Pill */}
        <div
          className="bento-profile-pill"
          title="Profil Pengguna: Tuti Joshua (TWA Fish)"
          role="button"
          tabIndex={0}
        >
          <div className="bento-avatar">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
              alt="Tuti Joshua"
              className="bento-avatar-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="bento-avatar-fallback">TJ</span>
          </div>
          <div className="profile-texts">
            <span className="profile-name">Tuti Joshua</span>
            <span className="profile-role">TWA Fish</span>
          </div>
          <ChevronDown size={13} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
};
