import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card } from '../components/common/Card.jsx';
import { Input } from '../components/common/Input.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { SkeletonRow } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { cn } from '../utils/cn.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { markdownExcerpt } from '../utils/markdown.js';
import { formatBytes, timeAgo } from '../utils/format.js';
import { searchAPI } from '../services/api.js';

const CATEGORIES = [
  { key: 'all', label: 'Everything', icon: 'search' },
  { key: 'projects', label: 'Projects', icon: 'folder' },
  { key: 'notes', label: 'Notes', icon: 'note' },
  { key: 'files', label: 'Files', icon: 'file' },
  { key: 'members', label: 'People', icon: 'users' },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useLocalStorage('collabsphere.recentSearches', []);
  const debounced = useDebounce(query, 250);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError('');
    searchAPI.query(debounced).then((res) => {
      setResults(res);
      setRecent((list) => [debounced, ...list.filter((l) => l !== debounced)].slice(0, 5));
    }).catch((err) => {
      setResults(null);
      setError(err.message || 'Search is unavailable right now.');
    }).finally(() => setLoading(false));
    params.set('q', debounced);
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const counts = results
    ? {
        all: results.projects.length + results.notes.length + results.files.length + results.members.length,
        projects: results.projects.length,
        notes: results.notes.length,
        files: results.files.length,
        members: results.members.length,
      }
    : {};

  const show = (key) => category === 'all' || category === key;

  return (
    <AppLayout>
      <PageHeader title="Search" description="Projects, notes, files and people in one place." />

      <div className="mb-5 max-w-xl">
        <Input
          icon="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try a project name, a note title, or a filename"
          autoFocus
        />
      </div>

      {!query && recent.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-[12.5px] text-faint">Recent searches</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setQuery(r)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] text-muted transition-colors hover:text-ink"
              >
                <Icon name="clock" size={12} />
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors',
                category === c.key ? 'border-accent bg-accentSoft text-accent' : 'border-line text-muted hover:text-ink'
              )}
            >
              <Icon name={c.icon} size={13} />
              {c.label}
              {results && <span className="tabular-nums text-faint">{counts[c.key]}</span>}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <Card className="overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} columns={2} />
          ))}
        </Card>
      )}

      {!loading && error && <EmptyState icon="alert" title="Search failed" description={error} />}

      {!query && !loading && (
        <EmptyState
          icon="search"
          title="Search the whole workspace"
          description="Start typing above. Press ⌘K anywhere in the app to open the quick search instead."
        />
      )}

      {query && !loading && results && counts.all === 0 && (
        <EmptyState
          icon="search"
          title={`Nothing matches “${query}”`}
          description="Check the spelling, or try a broader term like a project name."
        />
      )}

      {!loading && results && counts.all > 0 && (
        <div className="space-y-6">
          {show('projects') && results.projects.length > 0 && (
            <section>
              <h2 className="mb-2.5 font-display text-[15px] font-semibold text-ink">Projects</h2>
              <Card className="overflow-hidden">
                {results.projects.map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="flex items-center gap-3 border-b border-line px-4 py-3.5 transition-colors last:border-0 hover:bg-raised"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line" style={{ color: p.accent }}>
                      <Icon name="folder" size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">{p.name}</span>
                      <span className="block truncate text-[12.5px] text-muted">{p.description}</span>
                    </span>
                    <Badge icon={p.visibility === 'public' ? 'globe' : 'lock'}>{p.visibility}</Badge>
                  </Link>
                ))}
              </Card>
            </section>
          )}

          {show('notes') && results.notes.length > 0 && (
            <section>
              <h2 className="mb-2.5 font-display text-[15px] font-semibold text-ink">Notes</h2>
              <Card className="overflow-hidden">
                {results.notes.map((n) => (
                  <Link
                    key={n._id}
                    to={`/notes/${n._id}`}
                    className="flex items-center gap-3 border-b border-line px-4 py-3.5 transition-colors last:border-0 hover:bg-raised"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-faint">
                      <Icon name="note" size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">{n.title}</span>
                      <span className="block truncate text-[12.5px] text-muted">{n.project?.name || 'Project'} · {markdownExcerpt(n.content, 90)}</span>
                    </span>
                    <span className="hidden text-[11.5px] text-faint sm:block">{timeAgo(n.updatedAt)}</span>
                  </Link>
                ))}
              </Card>
            </section>
          )}

          {show('files') && results.files.length > 0 && (
            <section>
              <h2 className="mb-2.5 font-display text-[15px] font-semibold text-ink">Files</h2>
              <Card className="overflow-hidden">
                {results.files.map((f) => (
                  <Link
                    key={f._id}
                    to={`/files?file=${f._id}`}
                    className="flex items-center gap-3 border-b border-line px-4 py-3.5 transition-colors last:border-0 hover:bg-raised"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-faint">
                      <Icon name="file" size={16} />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{f.name}</span>
                    <span className="hidden max-w-36 truncate text-[11.5px] text-faint sm:block">{f.project?.name || 'Project'}</span>
                    <span className="text-[11.5px] tabular-nums text-faint">{formatBytes(f.size)}</span>
                  </Link>
                ))}
              </Card>
            </section>
          )}

          {show('members') && results.members.length > 0 && (
            <section>
              <h2 className="mb-2.5 font-display text-[15px] font-semibold text-ink">People</h2>
              <Card className="overflow-hidden">
                {results.members.map((u) => (
                  <Link
                    key={u._id}
                    to="/team"
                    className="flex items-center gap-3 border-b border-line px-4 py-3.5 transition-colors last:border-0 hover:bg-raised"
                  >
                    <Avatar user={u} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">{u.name}</span>
                      <span className="block truncate text-[12.5px] text-muted">@{u.username}</span>
                    </span>
                  </Link>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}
    </AppLayout>
  );
}
