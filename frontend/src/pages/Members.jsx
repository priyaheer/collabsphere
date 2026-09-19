import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card } from '../components/common/Card.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { SkeletonCard } from '../components/common/Skeleton.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { timeAgo, formatDate } from '../utils/format.js';
import { projectAPI } from '../services/api.js';

export default function Members() {
  const [query, setQuery] = useState('');
  const projects = useAsync(() => projectAPI.list(), []);

  const users = useMemo(() => {
    const map = new Map();
    (projects.data || []).forEach((project) => {
      project.members.forEach((member) => {
        if (!member.user?._id) return;
        const existing = map.get(member.user._id) || { ...member.user, projectIds: [] };
        existing.joinedAt = existing.joinedAt || member.joinedAt;
        existing.projectIds.push(project._id);
        map.set(member.user._id, existing);
      });
    });
    return [...map.values()];
  }, [projects.data]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users
      .filter((u) => !needle || u.name.toLowerCase().includes(needle) || u.username.toLowerCase().includes(needle))
      .map((user) => ({
        user,
        projects: (projects.data || []).filter((p) => user.projectIds.includes(p._id)),
      }));
  }, [users, query, projects.data]);

  return (
    <AppLayout>
      <PageHeader
        title="Team"
        description="Everyone you share a project with, and what they are on."
      />

      <div className="mb-5 max-w-sm">
        <Input icon="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people" />
      </div>

      {projects.loading && (
        <div>
          <p className="mb-3 text-[13px] text-muted">Loading team...</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {!projects.loading && projects.error && <ErrorState title="Unable to load team members" message="Please try again." onRetry={projects.refetch} />}

      {!projects.loading && !projects.error && users.length === 0 && (
        <EmptyState
          icon="users"
          title="No team members yet"
          description="Team members appear here when they belong to one of your projects."
        />
      )}

      {!projects.loading && users.length > 0 && rows.length === 0 && (
        <EmptyState
          icon="users"
          title="Nobody matches that"
          description="Try a different name or username."
          action={
            <Button variant="secondary" icon="refresh" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      )}

      {!projects.loading && !projects.error && users.length > 0 && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ user, projects: shared }) => (
          <Card key={user._id} className="flex flex-col p-5" interactive>
            <div className="flex items-start gap-3">
              <Avatar user={user} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-[15px] font-semibold text-ink">{user.name}</h3>
                <p className="truncate text-[12.5px] text-faint">@{user.username}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-faint">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  Active {timeAgo(user.lastActive)}
                </p>
              </div>
            </div>

            <p className="mt-3.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{user.bio || 'Project collaborator'}</p>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {(user.skills || []).slice(0, 3).map((skill) => (
                <span key={skill} className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-auto space-y-2 border-t border-line pt-4">
              <p className="text-[11.5px] text-faint">
                {shared.length} shared project{shared.length === 1 ? '' : 's'} · joined {formatDate(user.joinedAt)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {shared.slice(0, 2).map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:text-ink"
                  >
                    <Icon name="folder" size={11} />
                    {p.name}
                  </Link>
                ))}
                {shared.length > 2 && <Badge>+{shared.length - 2}</Badge>}
              </div>
            </div>
          </Card>
        ))}
      </div>}
    </AppLayout>
  );
}
