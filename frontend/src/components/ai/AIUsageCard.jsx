import React from 'react';
import { Icon } from '../common/Icon.jsx';
import { ProgressBar } from '../common/ProgressBar.jsx';

export function AIUsageCard({ usage }) {
  if (!usage) return null;
  const pct = Math.round((usage.used / usage.limit) * 100);

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-4">
      <span className="absolute inset-x-0 top-0 h-px cs-hairline-ai" />
      <div className="flex items-center gap-2">
        <Icon name="cpu" size={15} className="text-ai" />
        <h3 className="flex-1 font-display text-[13.5px] font-semibold text-ink">Assistant usage</h3>
        <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
          {usage.status}
        </span>
      </div>

      <p className="mt-3 text-[13px] text-muted">
        <span className="font-medium text-ink tabular-nums">{usage.used}</span> of {usage.limit} requests this cycle
      </p>
      <ProgressBar
        value={pct}
        height={5}
        className="mt-2"
        tone="linear-gradient(90deg, var(--c-ai), var(--c-violet))"
      />
      <p className="mt-2.5 text-[11.5px] text-faint">Resets {usage.resetsAt} · runs on the server, never in your browser</p>
    </div>
  );
}
