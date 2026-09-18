import React from 'react';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Badge } from '../common/Badge.jsx';
import { Dropdown } from '../common/Dropdown.jsx';
import { formatDate, timeAgo } from '../../utils/format.js';

const ROLE_TONE = { Owner: 'accent', Admin: 'ai', Member: 'neutral' };

export function MemberRow({ membership, canManage = false, onRoleChange, onRemove, className = '' }) {
  const { user, role, joinedAt } = membership;

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-line px-4 py-3.5 transition-colors last:border-0 hover:bg-raised',
        className
      )}
    >
      <Avatar user={user} size="md" />

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-[14px] font-medium text-ink">
          {user?.name}
          <Badge tone={ROLE_TONE[role]}>{role}</Badge>
        </p>
        <p className="mt-0.5 truncate text-[12.5px] text-faint">
          @{user?.username} · {user?.email}
        </p>
      </div>

      <div className="hidden w-36 shrink-0 text-[12.5px] text-muted lg:block">
        <p className="text-faint">Joined</p>
        <p>{formatDate(joinedAt)}</p>
      </div>

      <div className="hidden w-32 shrink-0 text-[12.5px] text-muted md:block">
        <p className="text-faint">Last active</p>
        <p>{timeAgo(user?.lastActive)}</p>
      </div>

      {canManage && role !== 'Owner' ? (
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              aria-label="Member actions"
              className="rounded-lg p-1.5 text-faint transition-colors hover:bg-surface hover:text-ink"
            >
              <Icon name="more" size={16} />
            </button>
          }
          items={[
            { label: 'Make admin', icon: 'shield', disabled: role === 'Admin', onClick: () => onRoleChange?.(user._id, 'Admin') },
            { label: 'Set as member', icon: 'user', disabled: role === 'Member', onClick: () => onRoleChange?.(user._id, 'Member') },
            { divider: true },
            { label: 'Remove from project', icon: 'trash', tone: 'danger', onClick: () => onRemove?.(membership) },
          ]}
        />
      ) : (
        <span className="w-8" />
      )}
    </div>
  );
}
