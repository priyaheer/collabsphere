import React, { useMemo } from 'react';
import { cn } from '../../utils/cn.js';
import { renderMarkdown } from '../../utils/markdown.js';

export function MarkdownPreview({ source = '', className = '' }) {
  const html = useMemo(() => renderMarkdown(source), [source]);
  if (!source.trim()) {
    return (
      <p className={cn('text-[13.5px] italic text-faint', className)}>
        Nothing to preview yet. Start typing on the left.
      </p>
    );
  }
  return <div className={cn('cs-md', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
