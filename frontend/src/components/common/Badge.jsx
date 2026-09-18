import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';

const TONES = {
  neutral: 'text-muted border-line bg-raised',
  accent: 'text-accent border-line bg-accentSoft',
  ok: 'text-ok border-line bg-raised',
  warn: 'text-warn border-line bg-raised',
  danger: 'text-danger border-line bg-raised',
  ai: 'text-ai border-line bg-raised',
};

export function Badge({ tone = 'neutral', icon, dot = false, className = '', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-medium',
        TONES[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

const STATUS_TONE = { active: 'ok', paused: 'warn', archived: 'neutral' };

export function StatusBadge({ status }) {
  return (
    <Badge tone={STATUS_TONE[status] || 'neutral'} dot>
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function VisibilityBadge({ visibility }) {
  return (
    <Badge icon={visibility === 'public' ? 'globe' : 'lock'}>
      {visibility === 'public' ? 'Public' : 'Private'}
    </Badge>
  );
}
