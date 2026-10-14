/**
 * Date and Time Formatting Utilities
 */

export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr);
  if (!d) return '—';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(d);
}

export function formatTimeOnly(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr);
  if (!d) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(d);
}

export function formatRelativeTime(dateStr: string | null | undefined, now: Date = new Date()): string {
  const d = parseDate(dateStr);
  if (!d) return 'Tidak ada data';

  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return 'Baru saja';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return 'Baru saja';
  if (diffSec < 60) return `${diffSec} detik lalu`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

export function isTimestampStale(dateStr: string | null | undefined, thresholdMs = 60000, now: Date = new Date()): boolean {
  const d = parseDate(dateStr);
  if (!d) return true;
  return now.getTime() - d.getTime() > thresholdMs;
}

export function formatChartTick(dateStr: string, range: '1h' | '24h' | '7d' | 'custom'): string {
  const d = parseDate(dateStr);
  if (!d) return '';

  if (range === '1h') {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  }

  if (range === '24h') {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
}
