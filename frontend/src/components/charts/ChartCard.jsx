import React from 'react';
import { cn } from '../../utils/cn.js';
import { Skeleton } from '../common/Skeleton.jsx';

export function ChartCard({ title, description, action, loading = false, children, className = '' }) {
  return (
    <section className={cn('cs-surface flex flex-col', className)}>
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
        <div className="min-w-0">
          <h3 className="font-display text-[14.5px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 px-5 pb-5">
        {loading ? <Skeleton className="h-[180px] w-full rounded-lg" /> : children}
      </div>
    </section>
  );
}
