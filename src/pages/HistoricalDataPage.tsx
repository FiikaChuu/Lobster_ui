import React, { useState, useMemo } from 'react';
import type { ParameterKey, HistoricalDataPoint } from '../types/sensor';
import { formatValue } from '../utils/unitFormatter';
import { formatDateTime } from '../utils/dateFormatter';
import { Download, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface HistoricalDataPageProps {
  history: Record<ParameterKey, HistoricalDataPoint[]>;
  pondId: string;
}

export const HistoricalDataPage: React.FC<HistoricalDataPageProps> = ({
  history,
  pondId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Align timestamps into unified table rows
  const tableRows = useMemo(() => {
    const tempPoints = history.temperature || [];
    const phPoints = history.ph || [];
    const salPoints = history.salinity || [];
    const doPoints = history.dissolvedOxygen || [];

    // Map by timestamp
    const map = new Map<string, {
      timestamp: string;
      temp: number | null;
      ph: number | null;
      salinity: number | null;
      do: number | null;
      status: 'normal' | 'warning' | 'critical';
    }>();

    tempPoints.forEach((p) => {
      map.set(p.timestamp, {
        timestamp: p.timestamp,
        temp: p.value,
        ph: null,
        salinity: null,
        do: null,
        status: (p.value !== null && p.value > 30) ? 'warning' : 'normal'
      });
    });

    phPoints.forEach((p) => {
      const existing = map.get(p.timestamp);
      if (existing) {
        existing.ph = p.value;
        if (p.value !== null && (p.value < 7.2 || p.value > 8.8)) existing.status = 'warning';
      }
    });

    salPoints.forEach((p) => {
      const existing = map.get(p.timestamp);
      if (existing) existing.salinity = p.value;
    });

    doPoints.forEach((p) => {
      const existing = map.get(p.timestamp);
      if (existing) {
        existing.do = p.value;
        if (p.value !== null && p.value < 4.0) existing.status = 'critical';
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [history]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return tableRows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchTerm) {
        const dateStr = formatDateTime(r.timestamp).toLowerCase();
        return dateStr.includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [tableRows, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExportCSV = () => {
    const headers = ['Waktu', 'ID Tangki', 'Suhu (°C)', 'pH', 'Salinitas (ppt)', 'DO (mg/L)', 'Status'];
    const rows = filteredRows.map((r) => [
      formatDateTime(r.timestamp),
      pondId,
      r.temp ?? '',
      r.ph ?? '',
      r.salinity ?? '',
      r.do ?? '',
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `lobster_historical_table_${pondId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tabel Riwayat Sensor Telemetri</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Catatan historis parameter perairan untuk tangki: <strong style={{ color: 'var(--text-primary)' }}>{pondId}</strong>
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Download size={15} />}
          onClick={handleExportCSV}
        >
          Ekspor Riwayat (CSV)
        </Button>
      </div>

      {/* Filter Bar (Inspired by Reference Images 3 & 4) */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-inset)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-light)', minWidth: '260px' }}>
          <Search size={15} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Cari berdasarkan tanggal / jam..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Filter Status:</span>
          {(['all', 'normal', 'warning', 'critical'] as const).map((st) => (
            <button
              key={st}
              className={`range-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
            >
              {st === 'all' ? 'Semua' : st === 'normal' ? 'Normal' : st === 'warning' ? 'Waspada' : 'Kritis'}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Data Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Waktu Pengukuran</th>
                <th style={{ padding: '1rem' }}>ID Tangki</th>
                <th style={{ padding: '1rem' }}>Suhu Air (°C)</th>
                <th style={{ padding: '1rem' }}>pH Air</th>
                <th style={{ padding: '1rem' }}>Salinitas (ppt)</th>
                <th style={{ padding: '1rem' }}>DO (mg/L)</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status Klasifikasi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Tidak ada catatan historis yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-inset)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {formatDateTime(row.timestamp)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>
                      {pondId}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatValue(row.temp, 1)} °C
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatValue(row.ph, 2)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatValue(row.salinity, 1)} ppt
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatValue(row.do, 2)} mg/L
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <Badge status={row.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-light)',
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)'
          }}
        >
          <div>
            Menampilkan {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, filteredRows.length)} dari {filteredRows.length} rekaman
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
