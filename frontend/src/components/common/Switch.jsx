import React from 'react';
import { cn } from '../../utils/cn.js';

export function Switch({ checked, onChange, label, description, id }) {
  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
        checked ? 'border-transparent bg-accent' : 'border-line bg-raised'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );

  if (!label) return control;

  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{description}</p>}
      </div>
      {control}
    </div>
  );
}
