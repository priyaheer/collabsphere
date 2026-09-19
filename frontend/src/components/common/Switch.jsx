import React from 'react';
import { cn } from '../../utils/cn.js';

export function Switch({ checked, onChange, label, description, id }) {
  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5',
        'transition-[background-color,border-color,box-shadow] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base',
        checked ? 'border-accent bg-accent' : 'border-lineStrong bg-raised'
      )}
    >
      <span
        className={cn(
          'block h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.3)]',
          'transition-transform duration-200 ease-out',
          checked ? 'translate-x-[20px]' : 'translate-x-0'
        )}
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
