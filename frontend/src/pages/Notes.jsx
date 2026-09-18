import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { NoteCard } from '../components/cards/NoteCard.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input, Select } from '../components/common/Input.jsx';
import { SkeletonCard } from '../components/common/Skeleton.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { notesAPI, projectAPI } from '../services/api.js';

export default function Notes() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('all');
  const [projectId, setProjectId] = useState('');
  const [sort, setSort] = useState('recent');
  const debounced = useDebounce(query, 250);
  const navigate = useNavigate();

  const notes = useAsync(
    () => notesAPI.list({ q: debounced, tag, sort, projectId: projectId || undefined }),
    [debounced, tag, sort, projectId]
  );
  const projects = useAsync(() => projectAPI.list(), []);

  const projectName = useMemo(() => {
    const map = {};
    (projects.data || []).forEach((p) => {
      map[p._id] = p.name;
    });
    return map;
  }, [projects.data]);

  const tags = useMemo(() => {
    const set = new Set();
    (notes.data || []).forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes.data]);

  const rows = notes.data || [];
  const filtersActive = Boolean(query || tag !== 'all' || projectId);

  return (
    <AppLayout>
      <PageHeader
        title="Notes"
        description="Markdown documentation across every project you can see."
        actions={
          <Button variant="primary" icon="plus" onClick={() => navigate('/notes/new')}>
            New note
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <Input
            icon="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles and content"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-auto min-w-[150px]"
            options={[{ value: '', label: 'All projects' }, ...(projects.data || []).map((p) => ({ value: p._id, label: p.name }))]}
          />
          <Select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-auto min-w-[130px]"
            options={[{ value: 'all', label: 'Any tag' }, ...tags.map((t) => ({ value: t, label: t }))]}
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-auto min-w-[150px] sm:ml-auto"
            options={[
              { value: 'recent', label: 'Recently updated' },
              { value: 'created', label: 'Newest first' },
              { value: 'title', label: 'Title A–Z' },
            ]}
          />
        </div>
      </div>

      {notes.error && <ErrorState onRetry={notes.refetch} />}

      {notes.loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!notes.loading && !notes.error && rows.length === 0 && (
        <EmptyState
          icon={filtersActive ? 'search' : 'note'}
          title={filtersActive ? 'No notes match that' : 'Start documenting your project'}
          description={
            filtersActive
              ? 'Try a different term, or clear the filters to see everything.'
              : 'Write down the decision while the reasoning is still fresh. Future you will read it.'
          }
          action={
            filtersActive ? (
              <Button
                variant="secondary"
                icon="refresh"
                onClick={() => {
                  setQuery('');
                  setTag('all');
                  setProjectId('');
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button variant="primary" icon="plus" onClick={() => navigate('/notes/new')}>
                Write your first note
              </Button>
            )
          }
        />
      )}

      {!notes.loading && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((note) => (
            <NoteCard key={note._id} note={note} projectName={projectName[note.projectId]} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
