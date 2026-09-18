import React from 'react';
import { Icon } from '../common/Icon.jsx';
import { Tooltip } from '../common/Tooltip.jsx';
import { cn } from '../../utils/cn.js';

export const MARKDOWN_ACTIONS = [
  { id: 'heading', icon: 'heading', label: 'Heading', wrap: ['## ', ''], block: true },
  { id: 'bold', icon: 'bold', label: 'Bold', wrap: ['**', '**'] },
  { id: 'italic', icon: 'italic', label: 'Italic', wrap: ['*', '*'] },
  { id: 'code', icon: 'code', label: 'Code block', wrap: ['\n```js\n', '\n```\n'] },
  { id: 'link', icon: 'link', label: 'Link', wrap: ['[', '](https://)'] },
  { id: 'list', icon: 'list', label: 'Bulleted list', wrap: ['- ', ''], block: true },
  { id: 'quote', icon: 'quote', label: 'Quote', wrap: ['> ', ''], block: true },
  { id: 'table', icon: 'table', label: 'Table', wrap: ['\n| Column | Column |\n| --- | --- |\n| Value | Value |\n', ''] },
];

export function EditorToolbar({ onAction, className = '', children }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-0.5 border-b border-line px-2 py-1.5', className)}>
      {MARKDOWN_ACTIONS.map((action) => (
        <Tooltip key={action.id} label={action.label}>
          <button
            type="button"
            onClick={() => onAction(action)}
            aria-label={action.label}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <Icon name={action.icon} size={15} />
          </button>
        </Tooltip>
      ))}
      <div className="ml-auto flex items-center gap-1.5">{children}</div>
    </div>
  );
}
