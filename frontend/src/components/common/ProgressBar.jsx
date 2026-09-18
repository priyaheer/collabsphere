import React from 'react';
import { cn } from '../../utils/cn.js';

export function ProgressBar({ value = 0, tone, className = '', showLabel = false, height = 6 }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted">
          <span>Progress</span>
          <span className="tabular-nums text-ink">{clamped}%</span>
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-raised"
        style={{ height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: tone || 'linear-gradient(90deg, var(--c-accent), var(--c-violet))',
          }}
        />
      </div>
    </div>
  );
}
