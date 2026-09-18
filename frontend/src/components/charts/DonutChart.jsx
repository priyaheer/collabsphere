import React from 'react';
import { cn } from '../../utils/cn.js';

const RADIUS = 42;
const CIRC = 2 * Math.PI * RADIUS;

export function DonutChart({ data = [], size = 168, thickness = 14, centerLabel, centerValue, className = '' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let offset = 0;

  return (
    <div className={cn('flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--c-line)" strokeWidth={thickness / 2} />
          {data.map((slice) => {
            const length = (slice.value / total) * CIRC;
            const dash = `${length} ${CIRC - length}`;
            const el = (
              <circle
                key={slice.label}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={thickness / 2}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += length;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[22px] font-semibold tracking-tight text-ink tabular-nums">
            {centerValue ?? total}
          </span>
          <span className="text-[11.5px] text-faint">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2.5 text-[13px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: slice.color }} />
            <span className="flex-1 truncate text-muted">{slice.label}</span>
            <span className="tabular-nums text-ink">{slice.value}</span>
            <span className="w-10 text-right tabular-nums text-faint">
              {Math.round((slice.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
