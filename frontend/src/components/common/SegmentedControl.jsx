import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';

export function SegmentedControl({ options = [], value, onChange, size = 'md', className = '' }) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-lg border border-line bg-base p-0.5', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.title || o.label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[7px] font-medium transition-colors duration-150',
              size === 'sm' ? 'h-7 px-2 text-[12.5px]' : 'h-8 px-3 text-[13px]',
              active ? 'bg-raised text-ink shadow-soft' : 'text-muted hover:text-ink'
            )}
          >
            {o.icon && <Icon name={o.icon} size={14} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
