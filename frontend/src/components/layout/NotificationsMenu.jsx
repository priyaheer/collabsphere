import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { timeAgo } from '../../utils/format.js';

const TYPE_ICON = {
  member_added: 'users',
  readme: 'book',
  file: 'file',
  note: 'note',
  visibility: 'globe',
  mention: 'message',
};

export function NotificationsMenu({ items = [], onMarkAll, onRead, onOpen, onClose }) {
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="w-[min(380px,calc(100vw-2rem))]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-[14px] font-semibold text-ink">Notifications</h3>
          {unread > 0 && (
            <span className="rounded-md bg-accentSoft px-1.5 py-0.5 text-[11px] font-semibold text-accent">
              {unread} new
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={onMarkAll}
            className="text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[380px] overflow-y-auto">
        {items.length === 0 && (
          <p className="px-4 py-10 text-center text-[13px] text-muted">
            Nothing yet. Activity from your projects shows up here.
          </p>
        )}
        {items.slice(0, 6).map((n) => (
          <button
            key={n._id}
            type="button"
            onClick={() => {
              onRead?.(n._id);
              if (n.projectId) onOpen?.(n);
            }}
            className={cn(
              'flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-raised',
              !n.read && 'bg-base'
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line',
                n.read ? 'text-faint' : 'text-accent'
              )}
            >
              <Icon name={TYPE_ICON[n.type] || 'bell'} size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('block text-[13px] leading-snug', n.read ? 'text-muted' : 'text-ink')}>
                {n.title}
              </span>
              <span className="mt-1 block text-[11.5px] text-faint">{timeAgo(n.at)}</span>
            </span>
            {!n.read && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      <Link
        to="/notifications"
        onClick={onClose}
        className="flex items-center justify-center gap-1.5 border-t border-line py-2.5 text-[13px] text-muted transition-colors hover:text-ink"
      >
        Open notifications
        <Icon name="arrowRight" size={13} />
      </Link>
    </div>
  );
}
