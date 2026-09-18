import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';

/** Bars are DOM elements, not SVG: they stay crisp and reflow for free. */
export function BarChart({ data = [], labels = [], height = 180, color = 'var(--c-accent)', className = '' }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data, 1);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((value, i) => (
          <div
            key={i}
            className="group relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="w-full rounded-t-[4px] transition-[height,opacity] duration-500 ease-out"
              style={{
                height: `${Math.max(2, (value / max) * 100)}%`,
                background: `linear-gradient(180deg, ${color}, ${color}44)`,
                opacity: hover === null || hover === i ? 1 : 0.4,
              }}
            />
            {hover === i && (
              <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-raised px-2 py-1 text-[11.5px] shadow-soft">
                <span className="font-medium text-ink tabular-nums">{value}</span>
                {labels[i] && <span className="ml-1.5 text-faint">{labels[i]}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      {labels.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {labels.map((label, i) => (
            <span key={i} className="flex-1 truncate text-center text-[11px] text-faint">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
