import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';
import { escapeHtml } from '../../utils/markdown.js';

const TOKENS =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|import|export|from|default|if|else|await|async|class|new|for|while|of|in|try|catch|finally|throw|typeof|def|self|None|True|False|null|undefined|true|false|this|extends|interface|type|public|private|=>)\b|\b(\d+(?:\.\d+)?)\b/g;

const COLOR = {
  comment: 'var(--c-faint)',
  string: 'var(--c-ok)',
  keyword: 'var(--c-violet)',
  number: 'var(--c-ai)',
};

/** Deliberately light-touch highlighting: comments, strings, keywords, numbers. */
function highlight(source) {
  return escapeHtml(source).replace(TOKENS, (match, comment, string, keyword, number) => {
    const tone = comment ? 'comment' : string ? 'string' : keyword ? 'keyword' : 'number';
    return `<span style="color:${COLOR[tone]}">${match}</span>`;
  });
}

export function CodeBlock({
  code = '',
  language = 'text',
  filename,
  showLineNumbers = true,
  maxHeight = 420,
  className = '',
  actions,
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — nothing to recover from */
    }
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-base', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name="code" size={14} className="shrink-0 text-faint" />
          <span className="truncate font-mono text-[12px] text-muted">{filename || language}</span>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="min-w-full p-0 font-mono text-[12.5px] leading-[1.65]">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-surface">
                {showLineNumbers && (
                  <span className="sticky left-0 w-11 shrink-0 select-none bg-base pr-3 text-right text-faint">
                    {i + 1}
                  </span>
                )}
                <span
                  className="flex-1 whitespace-pre px-3"
                  dangerouslySetInnerHTML={{ __html: highlight(line) || '&nbsp;' }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
