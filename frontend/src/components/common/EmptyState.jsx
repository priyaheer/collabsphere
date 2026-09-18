import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';

/** An empty screen is an invitation to act, so the action is always present. */
export function EmptyState({ icon = 'inbox', title, description, action, compact = false, className = '' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 text-center cs-grid',
        compact ? 'py-10' : 'py-16',
        className
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-faint">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'That did not load', message, onRetry, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center rounded-xl border border-line bg-surface px-6 py-12 text-center', className)}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line text-danger">
        <Icon name="alert" size={20} />
      </span>
      <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">
        {message || 'The request did not come back. Check your connection and try again.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink transition-colors hover:border-lineStrong"
        >
          <Icon name="refresh" size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
