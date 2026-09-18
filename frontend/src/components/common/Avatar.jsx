import React from 'react';
import { cn } from '../../utils/cn.js';
import { avatarTint, initials } from '../../utils/format.js';

const SIZES = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-[13px]', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' };

export function Avatar({ user, size = 'md', className = '', ring = false }) {
  const name = user?.name || 'Unknown';
  const tint = avatarTint(user?.username || name);
  return (
    <span
      title={name}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        SIZES[size],
        ring && 'ring-2 ring-surface',
        className
      )}
      style={{ background: `linear-gradient(140deg, ${tint}, ${tint}99)` }}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function AvatarGroup({ users = [], max = 4, size = 'sm' }) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <Avatar
          key={u?._id || i}
          user={u}
          size={size}
          ring
          className={i === 0 ? '' : '-ml-2'}
        />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            '-ml-2 inline-flex items-center justify-center rounded-full bg-raised text-[11px] font-medium text-muted ring-2 ring-surface',
            SIZES[size]
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
