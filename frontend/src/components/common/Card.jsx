import React from 'react';
import { cn } from '../../utils/cn.js';

export function Card({ as: Tag = 'div', interactive = false, className = '', children, ...props }) {
  return (
    <Tag
      className={cn(
        'cs-surface',
        interactive &&
          'transition-[border-color,transform,box-shadow] duration-200 hover:border-lineStrong hover:-translate-y-0.5 hover:shadow-lift',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 py-4 border-b border-line', className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
