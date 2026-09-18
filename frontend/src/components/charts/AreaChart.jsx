import React, { useMemo, useState } from 'react';
import { cn } from '../../utils/cn.js';

const VB_W = 600;

function buildPath(values, height, max) {
  const step = VB_W / Math.max(1, values.length - 1);
  return values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 8) - 4;
    return { x, y };
  });
}

function smooth(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

/**
 * Area chart drawn as plain SVG. Strokes use non-scaling-stroke so the shape
 * can stretch to any container width without the line thickening.
 */
export function AreaChart({
  data = [],
  labels = [],
  height = 200,
  color = 'var(--c-accent)',
  id = 'area',
  valueSuffix = '',
  className = '',
}) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data, 1) * 1.15;
  const points = useMemo(() => buildPath(data, height, max), [data, height, max]);
  const line = smooth(points);
  const area = `${line} L ${VB_W} ${height} L 0 ${height} Z`;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, index)));
  };

  return (
    <div className={cn('relative', className)} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${VB_W} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        role="img"
        aria-label="Activity over time"
      >
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1="0"
            x2={VB_W}
            y1={height * t}
            y2={height * t}
            stroke="var(--c-line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={area} fill={`url(#fill-${id})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover !== null && points[hover] && (
          <>
            <line
              x1={points[hover].x}
              x2={points[hover].x}
              y1="0"
              y2={height}
              stroke="var(--c-line-strong)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={points[hover].x} cy={points[hover].y} r="4" fill={color} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-raised px-2.5 py-1.5 text-[12px] shadow-soft"
          style={{ left: `${(hover / Math.max(1, data.length - 1)) * 100}%` }}
        >
          <span className="font-medium text-ink tabular-nums">
            {data[hover]}
            {valueSuffix}
          </span>
          {labels[hover] && <span className="ml-1.5 text-faint">{labels[hover]}</span>}
        </div>
      )}

      {labels.length > 0 && (
        <div className="mt-2 flex justify-between text-[11px] text-faint">
          <span>{labels[0]}</span>
          <span className="hidden sm:inline">{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}

export function Sparkline({ data = [], color = 'var(--c-accent)', height = 34, className = '' }) {
  const max = Math.max(...data, 1);
  const points = buildPath(data, height, max);
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      className={className}
      aria-hidden="true"
    >
      <path
        d={smooth(points)}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
