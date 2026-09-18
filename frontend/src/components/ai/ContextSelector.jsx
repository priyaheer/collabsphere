import React from 'react';
import { Icon } from '../common/Icon.jsx';
import { Dropdown } from '../common/Dropdown.jsx';

const KIND_ICON = { project: 'folder', note: 'note', file: 'file' };

/**
 * Picks what the assistant is allowed to read. The backend resolves the id to
 * real content server-side; the browser only ever sends { type, id }.
 */
export function ContextSelector({ context, options = [], onChange }) {
  const items = [
    { label: 'No context', icon: 'x', onClick: () => onChange(null) },
    { divider: true },
    ...options.map((o) => ({
      label: o.label,
      icon: KIND_ICON[o.type],
      onClick: () => onChange(o),
    })),
  ];

  return (
    <Dropdown
      align="left"
      width="w-64"
      items={items}
      trigger={
        <button
          type="button"
          className="inline-flex h-8 max-w-[240px] items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-lineStrong hover:text-ink"
        >
          <Icon name={context ? KIND_ICON[context.type] : 'plus'} size={13} />
          <span className="truncate">{context ? context.label : 'Add context'}</span>
          <Icon name="chevronDown" size={12} className="shrink-0 text-faint" />
        </button>
      }
    />
  );
}
