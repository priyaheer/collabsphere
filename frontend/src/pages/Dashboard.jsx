import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { StatCard } from '../components/cards/StatCard.jsx';
import { ProjectCard } from '../components/cards/ProjectCard.jsx';
import { ActivityFeed } from '../components/cards/ActivityFeed.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { SkeletonCard } from '../components/common/Skeleton.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { ProjectFormModal } from '../components/modals/ProjectFormModal.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { greeting } from '../utils/format.js';
import { activityAPI, analyticsAPI, geminiAPI, projectAPI } from '../services/api.js';

const QUICK_ACTIONS = [
  { label: 'Create project', icon: 'folder', hint: 'Start a workspace', action: 'project' },
  { label: 'Write a note', icon: 'note', hint: 'Markdown doc', to: '/notes/new' },
  { label: 'Upload a file', icon: 'upload', hint: 'Code or docs', to: '/files?upload=1' },
  { label: 'Ask the assistant', icon: 'sparkles', hint: 'Explain or draft', to: '/ai' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const summary = useAsync(() => analyticsAPI.summary(), []);
  const projects = useAsync(() => projectAPI.list({ sort: 'recent' }), []);
  const activity = useAsync(() => activityAPI.recent(7), []);

  const recent = (projects.data || []).slice(0, 4);

  const createProject = async (form) => {
    const created = await projectAPI.create(form);
    toast.success('Project created', { description: `${created.name} is ready.` });
    projects.refetch();
    navigate(`/projects/${created._id}`);
  };

  return (
    <AppLayout>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            {activity.data?.length
              ? `${activity.data.length} things moved across your projects recently.`
              : 'Here is where your projects stand today.'}
          </p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>
          New project
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total projects" value={summary.data?.projects.value} delta={summary.data?.projects.delta} icon="folder" loading={summary.loading} />
        <StatCard label="Active projects" value={summary.data?.active.value} delta={summary.data?.active.delta} icon="zap" loading={summary.loading} />
        <StatCard label="Team members" value={summary.data?.members.value} delta={summary.data?.members.delta} icon="users" loading={summary.loading} />
        <StatCard label="Files" value={summary.data?.files.value} delta={summary.data?.files.delta} icon="files" loading={summary.loading} />
        <StatCard label="Notes" value={summary.data?.notes.value} delta={summary.data?.notes.delta} icon="note" loading={summary.loading} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-semibold tracking-[-0.01em] text-ink">Recent projects</h2>
              <Link to="/projects" className="flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-ink">
                View all
                <Icon name="chevronRight" size={13} />
              </Link>
            </div>

            {projects.error && <ErrorState onRetry={projects.refetch} />}

            {projects.loading && (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!projects.loading && !projects.error && recent.length === 0 && (
              <EmptyState
                icon="folder"
                title="Create your first project"
                description="A project holds the notes, files and people behind one piece of work."
                action={
                  <Button variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>
                    Create project
                  </Button>
                }
              />
            )}

            {!projects.loading && recent.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {recent.map((project) => (
                  <ProjectCard key={project._id} project={project} onEdit={() => navigate(`/projects/${project._id}`)} />
                ))}
              </div>
            )}
          </section>

          <Card>
            <CardHeader
              title="Recent activity"
              description="Everything that moved across your projects"
              action={
                <Link to="/notifications" className="text-[13px] text-muted transition-colors hover:text-ink">
                  Notifications
                </Link>
              }
            />
            {activity.loading ? (
              <ActivityFeed loading />
            ) : activity.data?.length ? (
              <ActivityFeed items={activity.data} />
            ) : (
              <p className="px-5 py-10 text-center text-[13.5px] text-muted">
                Nothing yet. Activity appears as your team writes and uploads.
              </p>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="font-display text-[14px] font-semibold text-ink">Quick actions</h2>
            <div className="mt-3 grid gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => (qa.action === 'project' ? setCreateOpen(true) : navigate(qa.to))}
                  className="group flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-left transition-colors hover:border-lineStrong hover:bg-raised"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors group-hover:text-accent">
                    <Icon name={qa.icon} size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-ink">{qa.label}</span>
                    <span className="block text-[11.5px] text-faint">{qa.hint}</span>
                  </span>
                  <Icon name="arrowRight" size={14} className="text-faint transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="font-display text-[14px] font-semibold text-ink">Needs documentation</h2>
            <p className="mt-1 text-[12.5px] text-muted">Projects with fewer than ten notes.</p>
            <div className="mt-3 space-y-2">
              {(projects.data || [])
                .filter((p) => p.counts.notes < 10)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-raised"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{p.name}</span>
                    <span className="text-[11.5px] text-faint tabular-nums">{p.counts.notes} notes</span>
                  </Link>
                ))}
            </div>
          </Card>
        </aside>
      </div>

      <ProjectFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createProject} />
    </AppLayout>
  );
}
