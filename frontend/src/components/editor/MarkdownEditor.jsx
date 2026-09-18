import React, { useCallback, useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { SegmentedControl } from '../common/SegmentedControl.jsx';
import { EditorToolbar } from './EditorToolbar.jsx';
import { MarkdownPreview } from './MarkdownPreview.jsx';

/**
 * Split markdown editor: source on the left, live preview on the right.
 * On narrow screens the two panes become a single switchable view.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start documenting your project…',
  aiActions,
  minHeight = 460,
}) {
  const [mode, setMode] = useState('split');
  const [fullscreen, setFullscreen] = useState(false);
  const textareaRef = useRef(null);

  const applyAction = useCallback(
    (action) => {
      const el = textareaRef.current;
      if (!el) return;
      const { selectionStart: start, selectionEnd: end, value: text } = el;
      const selected = text.slice(start, end);
      const [before, after] = action.wrap;
      const next = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        const caret = start + before.length + selected.length;
        el.setSelectionRange(caret, caret);
      });
    },
    [onChange]
  );

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-line bg-surface',
        fullscreen && 'fixed inset-3 z-[65] shadow-lift'
      )}
    >
      <EditorToolbar onAction={applyAction}>
        {aiActions}
        <SegmentedControl
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'write', label: 'Write', icon: 'edit' },
            { value: 'split', label: 'Split', icon: 'panelLeft' },
            { value: 'preview', label: 'Preview', icon: 'eye' },
          ]}
          className="hidden sm:inline-flex"
        />
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <Icon name={fullscreen ? 'minimize' : 'maximize'} size={15} />
        </button>
      </EditorToolbar>

      <div
        className={cn('grid min-h-0 flex-1 divide-line', mode === 'split' ? 'sm:grid-cols-2 sm:divide-x' : 'grid-cols-1')}
        style={{ minHeight: fullscreen ? undefined : minHeight }}
      >
        <div className={cn('flex min-h-0 flex-col', mode === 'preview' && 'hidden')}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck="false"
            className="h-full min-h-[260px] flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-[1.75] text-ink placeholder:text-faint focus:outline-none"
          />
        </div>

        <div
          className={cn(
            'min-h-0 overflow-y-auto p-5',
            mode === 'write' && 'hidden',
            mode === 'split' && 'hidden sm:block'
          )}
        >
          <MarkdownPreview source={value} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[11.5px] text-faint">
        <span className="flex items-center gap-3">
          <span className="tabular-nums">{words} words</span>
          <span className="tabular-nums">{value.length} characters</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="note" size={12} />
          Markdown supported
        </span>
      </div>

      <div className="border-t border-line p-2 sm:hidden">
        <SegmentedControl
          size="sm"
          value={mode === 'split' ? 'write' : mode}
          onChange={setMode}
          className="w-full"
          options={[
            { value: 'write', label: 'Write', icon: 'edit' },
            { value: 'preview', label: 'Preview', icon: 'eye' },
          ]}
        />
      </div>
    </div>
  );
}
