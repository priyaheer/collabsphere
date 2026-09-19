import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { ProjectCard } from '../components/cards/ProjectCard.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input, Select } from '../components/common/Input.jsx';
import { SegmentedControl } from '../components/common/SegmentedControl.jsx';
import { SkeletonCard } from '../components/common/Skeleton.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { ProjectFormModal } from '../components/modals/ProjectFormModal.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useToast } from '../context/ToastContext.jsx';
import { githubAPI, projectAPI } from '../services/api.js';

const COPY = {
  all: {
    title: 'Projects',
    description: 'Every workspace you own or belong to.',
    empty: { title: 'Create your first project', body: 'A project holds the notes, files and people behind one piece of work.' },
  },
  mine: {
    title: 'My projects',
    description: 'Workspaces you own.',
    empty: { title: 'Create your first project', body: 'You do not own a project yet. Start one and invite the people who need it.' },
  },
  shared: {
    title: 'Shared with me',
    description: 'Projects other people added you to.',
    empty: { title: 'Nothing shared yet', body: 'When a teammate adds you to a project it shows up here.' },
  },
};

export default function Projects({ scope = 'all' }) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [visibility, setVisibility] = useState('all');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState('grid');
  const [formOpen, setFormOpen] = useState(params.get('new') === '1');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const debounced = useDebounce(query, 250);
  const toast = useToast();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useAsync(
    () => projectAPI.list({ scope, q: debounced, status, visibility, sort }),
    [scope, debounced, status, visibility, sort]
  );

  useEffect(() => {
    if (params.get('new') === '1') {
      setFormOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const copy = COPY[scope];
  const projects = data || [];
  const filtersActive = Boolean(query || status !== 'all' || visibility !== 'all');

  const submit = async (form) => {
    if (editing) {
      await projectAPI.update(editing._id, form);
      toast.success('Project updated');
    } else {
      const created = await projectAPI.create(form);
      const importedRepository = form.githubRepository
        ? await githubAPI.import(created._id, { fullName: form.githubRepository.fullName })
        : null;
      toast.success('Project created', { description: `${created.name} is ready.` });
      navigate(`/projects/${created._id}${importedRepository ? '?tab=github' : ''}`);
    }
    setEditing(null);
    refetch();
  };

  const remove = async () => {
    await projectAPI.remove(deleting._id);
    toast.success('Project deleted', { description: `${deleting.name} and its contents are gone.` });
    refetch();
  };

  return (
    <AppLayout>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <>
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { value: 'grid', label: '', icon: 'grid', title: 'Grid view' },
                { value: 'list', label: '', icon: 'list', title: 'List view' },
              ]}
            />
            <Button variant="primary" icon="plus" onClick={() => setFormOpen(true)}>
              New project
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <Input
            icon="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, description or stack"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-auto min-w-[130px]"
            options={[
              { value: 'all', label: 'Any status' },
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
          <Select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-auto min-w-[130px]"
            options={[
              { value: 'all', label: 'Any visibility' },
              { value: 'private', label: 'Private' },
              { value: 'public', label: 'Public' },
            ]}
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-auto min-w-[150px] sm:ml-auto"
            options={[
              { value: 'recent', label: 'Recently updated' },
              { value: 'created', label: 'Newest first' },
              { value: 'name', label: 'Name A–Z' },
              { value: 'progress', label: 'Most progress' },
              { value: 'members', label: 'Most members' },
            ]}
          />
        </div>
      </div>

      {error && <ErrorState onRetry={refetch} />}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          icon={filtersActive ? 'search' : 'folder'}
          title={filtersActive ? 'No projects match those filters' : copy.empty.title}
          description={
            filtersActive
              ? 'Clear the filters or try a different search term.'
              : copy.empty.body
          }
          action={
            filtersActive ? (
              <Button
                variant="secondary"
                icon="refresh"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setVisibility('all');
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button variant="primary" icon="plus" onClick={() => setFormOpen(true)}>
                Create project
              </Button>
            )
          }
        />
      )}

      {!loading && projects.length > 0 && view === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={(p) => {
                setEditing(p);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
              onToggleStar={async (p) => {
                await projectAPI.toggleStar(p._id);
                refetch();
              }}
            />
          ))}
        </div>
      )}

      {!loading && projects.length > 0 && view === 'list' && (
        <div className="cs-surface overflow-hidden">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              view="list"
              onEdit={(p) => {
                setEditing(p);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
              onToggleStar={async (p) => {
                await projectAPI.toggleStar(p._id);
                refetch();
              }}
            />
          ))}
        </div>
      )}

      {!loading && projects.length > 0 && (
        <p className="mt-5 text-[12.5px] text-faint">
          Showing {projects.length} project{projects.length === 1 ? '' : 's'}
        </p>
      )}

      <ProjectFormModal
        open={formOpen}
        project={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete ${deleting?.name}?`}
        message="Its notes, files and member list go with it. This cannot be undone."
        confirmLabel="Delete project"
      />
    </AppLayout>
  );
}
