import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { timeAgo } from '../../utils/format.js';
import { useUsers } from '../../hooks/useUsers.js';

const VERBS = {
  project_created: { icon: 'folder', text: 'created' },
  project_published: { icon: 'globe', text: 'made public' },
  member_joined: { icon: 'users', text: 'joined' },
  note_created: { icon: 'note', text: 'wrote' },
  note_updated: { icon: 'edit', text: 'updated' },
  file_uploaded: { icon: 'upload', text: 'uploaded' },
  readme_generated: { icon: 'sparkles', text: 'generated' },
};

export function ActivityFeed({ items = [], loading = false, className = '' }) {
  const { byId } = useUsers();

  if (loading) {
    return (
      <div className={cn('space-y-4 p-5', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className={cn('relative px-5 py-4', className)}>
      <span className="absolute bottom-6 left-[34px] top-8 w-px bg-line" aria-hidden="true" />
      {items.map((item) => {
        const actor = item.actor || byId[item.actorId];
        const verb = VERBS[item.type] || { icon: 'clock', text: 'touched' };
        return (
          <li key={item._id} className="relative flex gap-3 py-2.5">
            <span className="relative z-10">
              <Avatar user={actor} size="sm" ring />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-line bg-surface text-faint">
                <Icon name={verb.icon} size={9} strokeWidth={2} />
              </span>
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] leading-snug text-muted">
                <span className="font-medium text-ink">{actor?.name || 'Someone'}</span> {verb.text}{' '}
                <span className="text-ink">{item.target}</span>
                {item.project && (
                  <>
                    {' in '}
                    <Link to={`/projects/${item.project._id}`} className="text-accent hover:underline">
                      {item.project.name}
                    </Link>
                  </>
                )}
              </p>
              <p className="mt-0.5 text-[11.5px] text-faint">{timeAgo(item.at)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
