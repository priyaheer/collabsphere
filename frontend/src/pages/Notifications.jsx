import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { SegmentedControl } from '../components/common/SegmentedControl.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { SkeletonRow } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { cn } from '../utils/cn.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { timeAgo } from '../utils/format.js';
import { notificationAPI } from '../services/api.js';

const TYPE_ICON = {
  member_added: 'users',
  readme: 'book',
  file: 'file',
  note: 'note',
  visibility: 'globe',
  mention: 'message',
};

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const toast = useToast();
  const { data, loading, setData } = useAsync(() => notificationAPI.list(), []);

  const rows = (data || []).filter((n) => (filter === 'unread' ? !n.read : true));
  const unread = (data || []).filter((n) => !n.read).length;

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : 'You are all caught up.'}
        actions={
          <>
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
              ]}
            />
            <Button
              variant="secondary"
              icon="check"
              disabled={!unread}
              onClick={async () => {
                const next = await notificationAPI.markAllRead();
                setData(next);
                toast.success('All marked read');
              }}
            >
              Mark all read
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} columns={3} />)}

        {!loading && rows.length === 0 && (
          <EmptyState
            className="border-0"
            icon="bell"
            title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
            description={
              filter === 'unread'
                ? 'Everything here has been read. Switch to All to look back.'
                : 'Activity from your projects — uploads, notes, members and generated docs — lands here.'
            }
          />
        )}

        {!loading &&
          rows.map((n) => {
            const actor = n.actor;
            return (
              <div
                key={n._id}
                className={cn(
                  'flex gap-3 border-b border-line px-4 py-4 transition-colors last:border-0 hover:bg-raised',
                  !n.read && 'bg-base'
                )}
              >
                <span className="relative shrink-0">
                  <Avatar user={actor} size="md" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-faint">
                    <Icon name={TYPE_ICON[n.type] || 'bell'} size={11} />
                  </span>
                </span>

                <div className="min-w-0 flex-1">
                  <p className={cn('text-[14px] leading-snug', n.read ? 'text-muted' : 'text-ink')}>{n.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-faint">
                    <span>{timeAgo(n.at)}</span>
                    {n.projectId && (
                      <Link to={`/projects/${n.projectId}`} className="flex items-center gap-1 transition-colors hover:text-ink">
                        <Icon name="folder" size={11} />
                        Open project
                      </Link>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <button
                    type="button"
                    onClick={async () => setData(await notificationAPI.markRead(n._id))}
                    className="h-fit shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-ink"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
      </Card>
    </AppLayout>
  );
}
