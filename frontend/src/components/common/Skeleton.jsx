import React from 'react';
import { cn } from '../../utils/cn.js';

export function Skeleton({ className = '', style }) {
  return <div className={cn('cs-skeleton rounded-md', className)} style={style} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: i === lines - 1 ? '62%' : '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="cs-surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} className="mt-4" />
      <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
    </div>
  );
}

export function SkeletonRow({ columns = 4 }) {
  return (
    <div className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0">
      <Skeleton className="h-8 w-8 rounded-lg" />
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
  );
}
