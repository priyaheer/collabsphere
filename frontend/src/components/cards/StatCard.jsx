import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { formatNumber } from '../../utils/format.js';

export function StatCard({ label, value, delta, icon, loading = false, accent, className = '' }) {
  if (loading) {
    return (
      <div className="cs-surface p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-7 w-16" />
        <Skeleton className="mt-3 h-3 w-24" />
      </div>
    );
  }

  const positive = (delta ?? 0) >= 0;

  return (
    <div
      className={cn(
        'group cs-surface cs-glow-hover relative overflow-hidden p-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-muted">{label}</span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white transition-transform duration-200 group-hover:scale-110 cs-gradient-fill"
          style={accent ? { background: accent } : undefined}
        >
          <Icon name={icon} size={14} />
        </span>
      </div>
      <p className="mt-2.5 font-display text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {typeof delta === 'number' && (
        <p className="mt-2.5 flex items-center gap-1 text-[12px]">
          <Icon
            name={positive ? 'arrowUpRight' : 'arrowDownRight'}
            size={12}
            className={positive ? 'text-ok' : 'text-danger'}
          />
          <span className={positive ? 'text-ok' : 'text-danger'}>{Math.abs(delta)}%</span>
          <span className="text-faint">vs last month</span>
        </p>
      )}
    </div>
  );
}
