'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

function makeFormatter(format?: 'number' | 'currency', scale = 1) {
  return (v: number) => {
    const real = v * scale;
    if (format === 'currency') return formatCurrency(real);
    return real.toLocaleString('fr-FR');
  };
}

// ── Cubic bezier path through points (horizontal tangents) ───────────────────
function smoothD(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const t = 0.42;
    const cp1x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
    const cp1y = pts[i][1];
    const cp2x = pts[i + 1][0] - (pts[i + 1][0] - pts[i][0]) * t;
    const cp2y = pts[i + 1][1];
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

// ── Single-series bezier area chart ─────────────────────────────────────────
interface SingleAreaChartProps {
  data: number[];
  labels: string[];
  color: string;
  gradId: string;
  height?: number;
  format?: 'number' | 'currency';
  scale?: number;
}

function SingleAreaChart({ data, labels, color, gradId, height = 170, format, scale = 1 }: SingleAreaChartProps) {
  const formatValue = makeFormatter(format, scale);
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 500, H = 100, PAD = 8;
  const max = Math.max(...data) * 1.12 || 1;
  const colW = (W - PAD * 2) / Math.max(data.length - 1, 1);

  const pts: [number, number][] = data.map((v, i) => [
    (i / Math.max(data.length - 1, 1)) * (W - PAD * 2) + PAD,
    H - (v / max) * (H - PAD * 2) - PAD,
  ]);
  const line = smoothD(pts);
  const fill = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 24}`}
      style={{ width: '100%', height, overflow: 'visible', display: 'block' }}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Minimal grid */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={PAD} y1={H - t * (H - PAD * 2) - PAD}
          x2={W - PAD} y2={H - t * (H - PAD * 2) - PAD}
          stroke="var(--color-border)"
          strokeWidth=".6"
          strokeDasharray="3 4"
        />
      ))}

      {/* Gradient fill */}
      <path d={fill} fill={`url(#${gradId})`} />

      {/* Bezier line */}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Hover zones + dots */}
      {pts.map(([x, y], i) => {
        const isHovered = hovered === i;
        const tipX = Math.min(Math.max(x - 28, PAD), W - 58);
        return (
          <g key={i}>
            {/* Invisible hover zone */}
            <rect
              x={x - colW / 2} y={0} width={colW} height={H}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHovered(i)}
            />
            {isHovered && (
              <>
                {/* Vertical guide */}
                <line x1={x} y1={PAD} x2={x} y2={H} stroke={color} strokeWidth=".8" strokeDasharray="3 3" opacity=".6" />
                {/* Dot halo */}
                <circle cx={x} cy={y} r="5" fill={color} opacity=".15" />
                <circle cx={x} cy={y} r="3" fill={color} />
                {/* Tooltip */}
                <rect x={tipX} y={y - 30} width={56} height={20} rx={5} fill="var(--color-foreground)" opacity=".9" />
                <text x={tipX + 28} y={y - 15} textAnchor="middle" fontSize={9} fill="var(--color-background)" fontFamily="Manrope,sans-serif" fontWeight="700">
                  {formatValue(data[i])}
                </text>
              </>
            )}
            {/* Trailing dot when no hover */}
            {!hovered && i === data.length - 1 && (
              <circle cx={x} cy={y} r="3" fill={color} />
            )}
          </g>
        );
      })}

      {/* X labels */}
      {labels.map((l, i) => {
        const x = (i / Math.max(labels.length - 1, 1)) * (W - PAD * 2) + PAD;
        return (
          <text key={i} x={x} y={H + 16} textAnchor="middle" fontSize={9.5} fill="var(--color-muted-foreground)" fontFamily="Manrope,sans-serif">
            {l}
          </text>
        );
      })}
    </svg>
  );
}

// ── Multi-series bezier area chart ───────────────────────────────────────────
interface MultiSeries {
  label: string;
  data: number[];
  color: string;
  format?: 'number' | 'currency';
  scale?: number;
}

interface MultiAreaChartProps {
  datasets: MultiSeries[];
  labels: string[];
  height?: number;
}

function MultiAreaChart({ datasets, labels, height = 170 }: MultiAreaChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 500, H = 100, PAD = 8;
  const all = datasets.flatMap((d) => d.data);
  const max = Math.max(...all) * 1.12 || 1;
  const colW = (W - PAD * 2) / Math.max(labels.length - 1, 1);

  const buildPts = (data: number[]): [number, number][] =>
    data.map((v, i) => [
      (i / Math.max(data.length - 1, 1)) * (W - PAD * 2) + PAD,
      H - (v / max) * (H - PAD * 2) - PAD,
    ]);

  const tooltipW = 110;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 24}`}
      style={{ width: '100%', height, overflow: 'visible', display: 'block' }}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        {datasets.map((ds, i) => (
          <linearGradient key={i} id={`mg_${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ds.color} stopOpacity=".18" />
            <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* Minimal grid */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={PAD} y1={H - t * (H - PAD * 2) - PAD}
          x2={W - PAD} y2={H - t * (H - PAD * 2) - PAD}
          stroke="var(--color-border)"
          strokeWidth=".6"
          strokeDasharray="3 4"
        />
      ))}

      {/* Series fills + lines */}
      {datasets.map((ds, di) => {
        const pts = buildPts(ds.data);
        const line = smoothD(pts);
        const fill = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
        return (
          <g key={di}>
            <path d={fill} fill={`url(#mg_${di})`} />
            <path d={line} fill="none" stroke={ds.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {buildPts(ds.data).map(([x, y], i) => (
              <g key={i}>
                {hovered === i && <circle cx={x} cy={y} r="4" fill={ds.color} opacity=".2" />}
                {hovered === i && <circle cx={x} cy={y} r="2.5" fill={ds.color} />}
                {hovered === null && i === ds.data.length - 1 && <circle cx={x} cy={y} r="3" fill={ds.color} />}
              </g>
            ))}
          </g>
        );
      })}

      {/* Hover zones + tooltips */}
      {labels.map((l, i) => {
        const x = (i / Math.max(labels.length - 1, 1)) * (W - PAD * 2) + PAD;
        const tipX = Math.min(Math.max(x - tooltipW / 2, PAD), W - tooltipW);
        const tipH = datasets.length * 15 + 16;
        return (
          <g key={i}>
            <rect
              x={x - colW / 2} y={0} width={colW} height={H}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHovered(i)}
            />
            {hovered === i && (
              <>
                <line x1={x} y1={PAD} x2={x} y2={H} stroke="var(--color-muted-foreground)" strokeWidth=".8" strokeDasharray="3 3" opacity=".5" />
                <rect x={tipX} y={2} width={tooltipW} height={tipH} rx={5} fill="var(--color-foreground)" opacity=".9" />
                <text x={tipX + tooltipW / 2} y={15} textAnchor="middle" fontSize={9} fill="var(--color-background)" fontFamily="Manrope,sans-serif" fontWeight="700">{l}</text>
                {datasets.map((ds, di) => {
                  const fmt = makeFormatter(ds.format, ds.scale);
                  return (
                    <text key={di} x={tipX + 7} y={28 + di * 15} fontSize={8.5} fill={ds.color} fontFamily="Manrope,sans-serif" fontWeight="600">
                      {ds.label}: {fmt(ds.data[i] ?? 0)}
                    </text>
                  );
                })}
              </>
            )}
            <text x={x} y={H + 16} textAnchor="middle" fontSize={9.5} fill="var(--color-muted-foreground)" fontFamily="Manrope,sans-serif">{l}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Public MetricsChart wrapper (keeps existing API) ─────────────────────────
interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor?: string;
  format?: 'number' | 'currency';
  scale?: number;
}

interface MetricsChartProps {
  title: string;
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  height?: number;
}

export function MetricsChart({ title, data, height = 170 }: MetricsChartProps) {
  const { labels, datasets } = data;
  const isSingle = datasets.length === 1;

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {!isSingle && (
          <div className="flex items-center gap-3">
            {datasets.map((ds) => (
              <span key={ds.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ background: ds.borderColor }}
                />
                {ds.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {isSingle ? (
        <SingleAreaChart
          data={datasets[0].data}
          labels={labels}
          color={datasets[0].borderColor}
          gradId={`grad_${title.replace(/\s/g, '_')}`}
          height={height}
          format={datasets[0].format}
          scale={datasets[0].scale}
        />
      ) : (
        <MultiAreaChart
          datasets={datasets.map((ds) => ({
            label: ds.label,
            data: ds.data,
            color: ds.borderColor,
            format: ds.format,
            scale: ds.scale,
          }))}
          labels={labels}
          height={height}
        />
      )}
    </div>
  );
}
