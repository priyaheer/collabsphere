import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';

export const SUGGESTED_PROMPTS = [
  { label: 'Explain this code', icon: 'code', prompt: 'Explain this code and point out anything surprising.' },
  { label: 'Improve this documentation', icon: 'edit', prompt: 'Improve this documentation without changing its meaning.' },
  { label: 'Generate README', icon: 'book', prompt: 'Generate a README for this project.' },
  { label: 'Generate documentation', icon: 'note', prompt: 'Generate API documentation for the selected file.' },
  { label: 'Find possible issues', icon: 'alert', prompt: 'Find possible issues in this code, ordered by blast radius.' },
];

export function PromptSuggestions({ onSelect, className = '' }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {SUGGESTED_PROMPTS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onSelect(s.prompt)}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-muted transition-[border-color,color,transform] duration-150 hover:-translate-y-px hover:border-lineStrong hover:text-ink"
        >
          <Icon name={s.icon} size={14} className="text-faint" />
          {s.label}
        </button>
      ))}
    </div>
  );
}
