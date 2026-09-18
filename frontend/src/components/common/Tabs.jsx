import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';

export function Tabs({ tabs = [], value, onChange, className = '' }) {
  return (
    <div className={cn('relative -mb-px flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-[13.5px] font-medium transition-colors',
              active ? 'text-ink' : 'text-muted hover:text-ink'
            )}
          >
            {tab.icon && <Icon name={tab.icon} size={15} />}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="rounded-md bg-raised px-1.5 py-0.5 text-[11px] tabular-nums text-muted">
                {tab.count}
              </span>
            )}
            {active && <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}
