import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * The mark: three nodes on one orbit — collaborators sharing a single sphere.
 */
export function LogoMark({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cs-logo" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--c-accent)" />
          <stop offset="1" stopColor="var(--c-violet)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11.5" stroke="url(#cs-logo)" strokeWidth="1.6" opacity="0.55" />
      <circle cx="16" cy="4.5" r="3.2" fill="url(#cs-logo)" />
      <circle cx="26" cy="22" r="3.2" fill="url(#cs-logo)" opacity="0.85" />
      <circle cx="6" cy="22" r="3.2" fill="url(#cs-logo)" opacity="0.7" />
      <circle cx="16" cy="16" r="2.1" fill="var(--c-ink)" />
    </svg>
  );
}

export function Logo({ size = 28, showWord = true, className = '' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showWord && (
        <span className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink">CollabSphere</span>
      )}
    </span>
  );
}
