import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { MarkdownPreview } from '../editor/MarkdownPreview.jsx';

export function AIMessage({ message, user, onRegenerate, isLast = false }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={cn('flex gap-3 px-1 py-4', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <Avatar user={user} size="sm" />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ai">
          <Icon name="sparkles" size={15} />
        </span>
      )}

      <div className={cn('min-w-0 max-w-[min(680px,88%)]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-xl px-4 py-3',
            isUser ? 'border border-line bg-raised text-ink' : 'border border-line bg-surface'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownPreview source={message.content} />
          )}
        </div>

        {!isUser && (
          <div className="mt-1.5 flex items-center gap-1 px-1">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-faint transition-colors hover:bg-raised hover:text-ink"
            >
              <Icon name={copied ? 'check' : 'copy'} size={13} />
              {copied ? 'Copied' : 'Copy'}
            </button>
            {isLast && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-faint transition-colors hover:bg-raised hover:text-ink"
              >
                <Icon name="refresh" size={13} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AIThinking() {
  return (
    <div className="flex gap-3 px-1 py-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ai">
        <Icon name="sparkles" size={15} />
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
        <span className="ml-1 text-[13px] text-muted">Reading your project…</span>
      </div>
    </div>
  );
}
