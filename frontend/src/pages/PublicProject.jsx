import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '../components/common/Logo.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { Card } from '../components/common/Card.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { ErrorState } from '../components/common/EmptyState.jsx';
import { MarkdownPreview } from '../components/editor/MarkdownPreview.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useUsers } from '../hooks/useUsers.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatBytes, formatDate, timeAgo } from '../utils/format.js';
import { markdownExcerpt } from '../utils/markdown.js';
import { fileAPI, notesAPI, projectAPI } from '../services/api.js';
import { SAMPLE_README } from '../data/mockData.js';

/** Read-only view served at /public/project/:projectId — no editing controls. */
export default function PublicProject() {
  const { projectId } = useParams();
  const { byId } = useUsers();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const project = useAsync(() => projectAPI.getPublic(projectId), [projectId]);
  const notes = useAsync(() => notesAPI.list({ projectId }), [projectId]);
  const files = useAsync(() => fileAPI.list({ projectId }), [projectId]);

  const data = project.data;
  const owner = data ? byId[data.ownerId] : null;
  const contributors = (data?.members || []).map((m) => byId[m.userId]).filter(Boolean);
  const publicNotes = (notes.data || []).filter((n) => n.visibility === 'public');

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-base">
      <header className="sticky top-0 z-40 border-b border-line cs-glass">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-4 px-5">
          <Link to="/">
            <Logo size={24} />
          </Link>
          <Badge icon="globe">Public project</Badge>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Switch theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>
            <Button variant="secondary" size="sm" icon={copied ? 'check' : 'link'} onClick={copyLink}>
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button variant="primary" size="sm" to="/register">
              Get started
            </Button>
          </div>
        </div>
      </header>

      {project.loading && (
        <div className="mx-auto max-w-[1100px] px-5 py-10">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
          <Skeleton className="mt-8 h-[420px] w-full rounded-xl" />
        </div>
      )}

      {project.error && (
        <div className="mx-auto max-w-lg px-5 py-24">
          <ErrorState
            title="No public project here"
            message="The link may be wrong, or the owner made the project private again."
          />
        </div>
      )}

      {data && (
        <>
          {/* GitHub-style header */}
          <div className="border-b border-line">
            <div className="mx-auto max-w-[1100px] px-5 py-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line"
                  style={{ color: data.accent }}
                >
                  <Icon name="folder" size={17} />
                </span>
                <h1 className="font-display text-[26px] font-semibold tracking-[-0.025em] text-ink">
                  {owner?.username ? `${owner.username} / ` : ''}
                  <span className="text-ink">{data.name}</span>
                </h1>
              </div>

              <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">{data.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-faint">
                <span className="flex items-center gap-1.5">
                  <Avatar user={owner} size="xs" />
                  {owner?.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="users" size={13} />
                  {contributors.length} contributors
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" size={13} />
                  Updated {timeAgo(data.updatedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" size={13} />
                  Created {formatDate(data.createdAt)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {data.techStack.map((tech) => (
                  <span key={tech} className="rounded-md border border-line px-2 py-0.5 font-mono text-[11.5px] text-muted">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <main className="mx-auto grid max-w-[1100px] gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-8">
              <Card className="min-w-0">
                <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                  <Icon name="book" size={15} className="text-faint" />
                  <span className="font-mono text-[12.5px] text-muted">README.md</span>
                </div>
                <div className="px-6 py-6">
                  <MarkdownPreview source={SAMPLE_README} />
                </div>
              </Card>

              {publicNotes.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">
                    Public notes
                  </h2>
                  <div className="space-y-2.5">
                    {publicNotes.map((note) => (
                      <article key={note._id} className="rounded-xl border border-line bg-surface p-5">
                        <h3 className="font-display text-[15px] font-semibold text-ink">{note.title}</h3>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                          {markdownExcerpt(note.content, 220)}
                        </p>
                        <p className="mt-3 text-[11.5px] text-faint">Updated {timeAgo(note.updatedAt)}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-5">
              <div>
                <h2 className="mb-2.5 font-display text-[14px] font-semibold text-ink">Contributors</h2>
                <div className="space-y-2.5">
                  {contributors.map((user) => (
                    <div key={user._id} className="flex items-center gap-2.5">
                      <Avatar user={user} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-ink">{user.name}</span>
                        <span className="block text-[11.5px] text-faint">@{user.username}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-line pt-5">
                <h2 className="mb-2.5 font-display text-[14px] font-semibold text-ink">Public files</h2>
                <div className="space-y-1.5">
                  {(files.data || []).slice(0, 6).map((file) => (
                    <div key={file._id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-raised">
                      <Icon name="file" size={13} className="shrink-0 text-faint" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-muted">{file.name}</span>
                      <span className="text-[11px] tabular-nums text-faint">{formatBytes(file.size)}</span>
                    </div>
                  ))}
                  {!files.loading && (files.data || []).length === 0 && (
                    <p className="text-[12.5px] text-faint">No files published yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="text-[13px] leading-relaxed text-muted">
                  This is a read-only page. Sign in to the workspace to edit notes or add files.
                </p>
                <Button variant="secondary" size="sm" fullWidth className="mt-3" to="/login">
                  Log in
                </Button>
              </div>
            </aside>
          </main>

          <footer className="border-t border-line py-8">
            <div className="mx-auto flex max-w-[1100px] flex-col gap-2 px-5 text-[12.5px] text-faint sm:flex-row sm:items-center sm:justify-between">
              <span>Published with CollabSphere</span>
              <Link to="/" className="transition-colors hover:text-ink">
                Create your own workspace
              </Link>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
