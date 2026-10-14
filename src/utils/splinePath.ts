/**
 * Monotone Cubic Spline (Fritsch-Carlson) Path Generator for SVG Charts
 *
 * Guarantees:
 * - Strictly passes through all actual data points (p.x, p.y).
 * - C1 continuous curvature (smooth, fluid, organic water-like line).
 * - Zero artificial overshoot or undershoot (preserves physical sensor fidelity).
 * - Natural and consistent across all viewport sizes.
 */

export interface SplinePoint {
  x: number;
  y: number;
}

/**
 * Computes an SVG cubic Bézier path string using the Fritsch-Carlson monotone cubic spline.
 */
export function getMonotoneSplinePath(points: SplinePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
  }

  const n = points.length;

  // 1. Calculate secants (deltaX and slope d)
  const d: number[] = [];
  const dx: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const deltaX = points[i + 1].x - points[i].x;
    const deltaY = points[i + 1].y - points[i].y;
    dx.push(deltaX);
    d.push(deltaX === 0 ? 0 : deltaY / deltaX);
  }

  // 2. Initialize tangents m
  const m: number[] = new Array(n).fill(0);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) {
      m[i] = 0;
    } else {
      m[i] = (d[i - 1] + d[i]) / 2;
    }
  }

  // 3. Fritsch-Carlson adjustment to prevent overshoot
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / d[i];
      const beta = m[i + 1] / d[i];
      const hyp = alpha * alpha + beta * beta;
      if (hyp > 9) {
        const tau = 3 / Math.sqrt(hyp);
        m[i] = tau * alpha * d[i];
        m[i + 1] = tau * beta * d[i];
      }
    }
  }

  // 4. Construct SVG cubic Bézier path commands
  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const h = dx[i] / 3;
    const cp1x = p0.x + h;
    const cp1y = p0.y + m[i] * h;
    const cp2x = p1.x - h;
    const cp2y = p1.y - m[i + 1] * h;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }

  return path;
}

/**
 * Computes an enclosed SVG path for a smooth area gradient under the monotone spline.
 */
export function getMonotoneAreaPath(points: SplinePoint[], baselineY: number): string {
  if (points.length < 2) return '';
  const spline = getMonotoneSplinePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${spline} L ${last.x.toFixed(1)},${baselineY.toFixed(1)} L ${first.x.toFixed(1)},${baselineY.toFixed(1)} Z`;
}

/**
 * Parameter-specific themes for consistent visual hierarchy across charts
 */
export interface ParameterChartTheme {
  stroke: string;
  gradientTop: string;
  gradientMid: string;
  glow: string;
  accent: string;
}

export const PARAMETER_CHART_THEMES: Record<string, ParameterChartTheme> = {
  temperature: {
    stroke: '#0284c7', // Sky ocean
    gradientTop: '#0ea5e9',
    gradientMid: 'rgba(14, 165, 233, 0.16)',
    glow: 'rgba(2, 132, 199, 0.28)',
    accent: '#0369a1'
  },
  salinity: {
    stroke: '#0891b2', // Deep cyan
    gradientTop: '#06b6d4',
    gradientMid: 'rgba(6, 182, 212, 0.16)',
    glow: 'rgba(8, 145, 178, 0.28)',
    accent: '#0e7490'
  },
  dissolvedOxygen: {
    stroke: '#8b5cf6', // Indigo / Purple life
    gradientTop: '#a855f7',
    gradientMid: 'rgba(168, 85, 247, 0.16)',
    glow: 'rgba(139, 92, 246, 0.28)',
    accent: '#7c3aed'
  },
  ph: {
    stroke: '#f59e0b', // Amber
    gradientTop: '#fbbf24',
    gradientMid: 'rgba(251, 191, 36, 0.16)',
    glow: 'rgba(245, 158, 11, 0.28)',
    accent: '#d97706'
  },
  ec: {
    stroke: '#4f46e5', // Marine indigo
    gradientTop: '#6366f1',
    gradientMid: 'rgba(99, 102, 241, 0.16)',
    glow: 'rgba(79, 70, 229, 0.28)',
    accent: '#4338ca'
  },
  tds: {
    stroke: '#475569', // Marine slate
    gradientTop: '#64748b',
    gradientMid: 'rgba(100, 116, 139, 0.16)',
    glow: 'rgba(71, 85, 105, 0.28)',
    accent: '#334155'
  }
};

export const DEFAULT_CHART_THEME: ParameterChartTheme = {
  stroke: '#0284c7',
  gradientTop: '#0ea5e9',
  gradientMid: 'rgba(14, 165, 233, 0.16)',
  glow: 'rgba(2, 132, 199, 0.28)',
  accent: '#0369a1'
};
