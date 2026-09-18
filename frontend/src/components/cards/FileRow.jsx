import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Dropdown } from '../common/Dropdown.jsx';
import { formatBytes, timeAgo } from '../../utils/format.js';

export const FILE_TYPE_META = {
  javascript: { label: 'JavaScript', icon: 'code', color: '#ffb86b' },
  python: { label: 'Python', icon: 'code', color: '#39c5bb' },
  html: { label: 'HTML', icon: 'code', color: '#f472b6' },
  css: { label: 'CSS', icon: 'code', color: '#6e8bff' },
  json: { label: 'JSON', icon: 'code', color: '#a177ff' },
  markdown: { label: 'Markdown', icon: 'note', color: '#4ade80' },
  image: { label: 'Image', icon: 'image', color: '#f472b6' },
  pdf: { label: 'PDF', icon: 'file', color: '#ff6b6b' },
  other: { label: 'File', icon: 'file', color: '#8a93a6' },
};

export const CODE_TYPES = ['javascript', 'python', 'html', 'css', 'json', 'markdown'];

export function FileIcon({ type, size = 16 }) {
  const meta = FILE_TYPE_META[type] || FILE_TYPE_META.other;
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line"
      style={{ color: meta.color }}
    >
      <Icon name={meta.icon} size={size} />
    </span>
  );
}

export function FileRow({ file, onPreview, onDelete, onDownload, onExplain, className = '' }) {
  const uploader = file.uploadedBy;
  const meta = FILE_TYPE_META[file.type] || FILE_TYPE_META.other;
  const isCode = CODE_TYPES.includes(file.type) && file.content;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-raised',
        className
      )}
    >
      <FileIcon type={file.type} />

      <button type="button" onClick={() => onPreview?.(file)} className="min-w-0 flex-1 text-left">
        <span className="block truncate font-mono text-[13px] text-ink group-hover:text-accent">{file.name}</span>
        <span className="mt-0.5 flex items-center gap-2 text-[11.5px] text-faint">
          <span>{meta.label}</span>
          <span>·</span>
          <span className="tabular-nums">{formatBytes(file.size)}</span>
        </span>
      </button>

      <div className="hidden w-40 shrink-0 items-center gap-2 md:flex">
        <Avatar user={uploader} size="xs" />
        <span className="truncate text-[12.5px] text-muted">{uploader?.name}</span>
      </div>

      <span className="hidden w-28 shrink-0 text-right text-[12px] text-faint sm:block">
        {timeAgo(file.uploadedAt)}
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        {isCode && (
          <button
            type="button"
            onClick={() => onExplain?.(file)}
            className="hidden items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-lineStrong hover:text-ink lg:flex"
          >
            <Icon name="sparkles" size={13} className="text-ai" />
            Explain
          </button>
        )}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              aria-label="File actions"
              className="rounded-lg p-1.5 text-faint transition-colors hover:bg-surface hover:text-ink"
            >
              <Icon name="more" size={16} />
            </button>
          }
          items={[
            { label: 'Preview', icon: 'eye', onClick: () => onPreview?.(file) },
            { label: 'Explain code', icon: 'sparkles', disabled: !isCode, onClick: () => onExplain?.(file) },
            { label: 'Download', icon: 'download', onClick: () => onDownload?.(file) },
            { divider: true },
            { label: 'Delete file', icon: 'trash', tone: 'danger', onClick: () => onDelete?.(file) },
          ]}
        />
      </div>
    </div>
  );
}
