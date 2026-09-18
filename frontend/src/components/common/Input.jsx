import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';

const FIELD =
  'w-full bg-base border border-line rounded-xl text-sm text-ink placeholder:text-faint ' +
  'transition-colors duration-150 hover:border-lineStrong focus:border-accent focus:outline-none ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export function Field({ label, hint, error, required, htmlFor, children, className = '' }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-muted">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-[12.5px] text-danger">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : (
        hint && <p className="text-[12.5px] text-faint">{hint}</p>
      )}
    </div>
  );
}

export function Input({ icon, error, className = '', ...props }) {
  return (
    <div className="relative">
      {icon && (
        <Icon
          name={icon}
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
      )}
      <input
        className={cn(FIELD, 'h-10 px-3', icon && 'pl-9', error && 'border-danger', className)}
        {...props}
      />
    </div>
  );
}

export function PasswordInput({ error, className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Icon name="lock" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
      <input
        type={visible ? 'text' : 'password'}
        className={cn(FIELD, 'h-10 pl-9 pr-10', error && 'border-danger', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-faint transition-colors hover:text-ink"
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={16} />
      </button>
    </div>
  );
}

export function Textarea({ error, className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(FIELD, 'px-3 py-2.5 resize-y leading-relaxed', error && 'border-danger', className)}
      {...props}
    />
  );
}

export function Select({ options = [], className = '', ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(FIELD, 'h-10 pl-3 pr-9 appearance-none cursor-pointer', className)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevronDown"
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  );
}
