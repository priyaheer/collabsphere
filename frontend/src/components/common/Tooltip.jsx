import React from 'react';
import { cn } from '../../utils/cn.js';

/** CSS-only tooltip: no portal, no positioning library, no layout thrash. */
export function Tooltip({ label, side = 'top', children, className = '' }) {
  return (
    <span className={cn('group/tip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-line bg-raised px-2 py-1 text-[11.5px] text-ink opacity-0 shadow-soft transition-opacity duration-150 group-hover/tip:opacity-100',
          side === 'top' && 'bottom-full left-1/2 mb-2 -translate-x-1/2',
          side === 'bottom' && 'top-full left-1/2 mt-2 -translate-x-1/2',
          side === 'right' && 'left-full top-1/2 ml-2 -translate-y-1/2'
        )}
      >
        {label}
      </span>
    </span>
  );
}
