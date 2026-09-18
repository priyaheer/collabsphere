import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Spinner } from '../common/Spinner.jsx';
import { cn } from '../../utils/cn.js';
import { searchAPI } from '../../services/api.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';

const GROUPS = [
  { key: 'projects', label: 'Projects', icon: 'folder' },
  { key: 'notes', label: 'Notes', icon: 'note' },
  { key: 'files', label: 'Files', icon: 'file' },
  { key: 'members', label: 'People', icon: 'users' },
];

const QUICK = [
  { label: 'Create a project', icon: 'plus', to: '/projects?new=1' },
  { label: 'Open the AI assistant', icon: 'sparkles', to: '/ai' },
  { label: 'Generate a README', icon: 'book', to: '/readme' },
  { label: 'View analytics', icon: 'chart', to: '/analytics' },
];

export function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useLocalStorage('collabsphere.recentSearches', []);
  const debounced = useDebounce(query, 220);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else {
      setQuery('');
      setResults(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!debounced.trim()) {
      setResults(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    searchAPI.query(debounced).then((res) => {
      if (active) {
        setResults(res);
        setLoading(false);
      }
    }).catch((err) => {
      if (active) {
        setError(err.message || 'Search is unavailable right now.');
        setResults(null);
        setLoading(false);
      }
    });
    // eslint-disable-next-line consistent-return
    return () => {
      active = false;
    };
  }, [debounced, open]);

  const go = (to, label) => {
    if (label) setRecent((list) => [label, ...list.filter((l) => l !== label)].slice(0, 5));
    onClose();
    navigate(to);
  };

  const total = useMemo(
    () => (results ? GROUPS.reduce((sum, g) => sum + (results[g.key]?.length || 0), 0) : 0),
    [results]
  );

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" size={17} className="shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="Search projects, notes, files and people"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
          {loading && <Spinner size={15} className="text-faint" />}
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-faint sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {!query && (
            <>
              {recent.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[11.5px] text-faint">Recent</p>
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setQuery(r)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
                    >
                      <Icon name="clock" size={15} className="text-faint" />
                      {r}
                    </button>
                  ))}
                </div>
              )}
              <p className="px-3 py-1.5 text-[11.5px] text-faint">Jump to</p>
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => go(q.to)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
                >
                  <Icon name={q.icon} size={15} className="text-faint" />
                  {q.label}
                </button>
              ))}
            </>
          )}

          {query && error && !loading && (
            <div className="px-4 py-10 text-center text-[13px] text-danger">{error}</div>
          )}

          {query && results && total === 0 && !loading && !error && (
            <div className="px-4 py-10 text-center">
              <p className="text-[14px] font-medium text-ink">Nothing matches “{query}”</p>
              <p className="mt-1 text-[13px] text-muted">
                Try a project name, a note title, or a filename like <span className="font-mono">.jsx</span>.
              </p>
            </div>
          )}

          {query &&
            results &&
            GROUPS.map((group) => {
              const rows = results[group.key] || [];
              if (!rows.length) return null;
              return (
                <div key={group.key} className="mb-1">
                  <p className="px-3 py-1.5 text-[11.5px] text-faint">{group.label}</p>
                  {rows.map((row) => {
                    const label = row.name || row.title;
                    const to =
                      group.key === 'projects'
                        ? `/projects/${row._id}`
                        : group.key === 'notes'
                        ? `/notes/${row._id}`
                        : group.key === 'files'
                        ? `/files?file=${row._id}`
                        : '/team';
                    return (
                      <button
                        key={row._id}
                        type="button"
                        onClick={() => go(to, label)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-raised"
                      >
                        {group.key === 'members' ? (
                          <Avatar user={row} size="xs" />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-faint">
                            <Icon name={group.icon} size={13} />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] text-ink">{label}</span>
                          {row.description && (
                            <span className="block truncate text-[12px] text-faint">{row.description}</span>
                          )}
                        </span>
                        <Icon name="arrowRight" size={14} className="text-faint" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[11.5px] text-faint">
          <span className={cn(query && total ? '' : 'opacity-0')}>{total} results</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line px-1 font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line px-1 font-mono">↵</kbd> open
            </span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
