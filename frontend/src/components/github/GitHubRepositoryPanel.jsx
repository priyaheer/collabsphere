import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../common/Button.jsx';
import { Card, CardHeader } from '../common/Card.jsx';
import { EmptyState, ErrorState } from '../common/EmptyState.jsx';
import { Icon } from '../common/Icon.jsx';
import { Modal } from '../common/Modal.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate, timeAgo } from '../../utils/format.js';
import { githubAPI } from '../../services/api.js';
import { cn } from '../../utils/cn.js';

function buildTree(entries) {
  const root = { name: '', path: '', type: 'tree', children: [] };
  entries.forEach((entry) => {
    let current = root;
    entry.path.split('/').forEach((name, index, parts) => {
      const path = parts.slice(0, index + 1).join('/');
      let child = current.children.find((item) => item.name === name);
      if (!child) {
        child = { name, path, type: index === parts.length - 1 ? entry.type : 'tree', entry, children: [] };
        current.children.push(child);
      }
      current = child;
    });
  });
  const sort = (nodes) => nodes.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'tree' ? -1 : 1)).forEach((node) => sort(node.children));
  sort(root.children);
  return root.children;
}

function TreeNode({ node, level, selectedPath, onSelect }) {
  const [expanded, setExpanded] = useState(level < 1);
  const isFolder = node.type === 'tree';
  return (
    <div>
      <button
        type="button"
        onClick={() => (isFolder ? setExpanded((value) => !value) : onSelect(node.entry))}
        className={cn('flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-[13px] hover:bg-raised', selectedPath === node.path && 'bg-accentSoft text-accent')}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <Icon name={isFolder ? (expanded ? 'chevronDown' : 'chevronRight') : 'file'} size={13} className="shrink-0 text-faint" />
        <span className="truncate font-mono">{node.name}</span>
      </button>
      {isFolder && expanded && node.children.map((child) => <TreeNode key={child.path} node={child} level={level + 1} selectedPath={selectedPath} onSelect={onSelect} />)}
    </div>
  );
}

function CommitDetails({ commit, onClose }) {
  return (
    <Modal open={Boolean(commit)} onClose={onClose} title={commit?.message?.split('\n')[0] || 'Commit details'} description={commit?.sha} size="xl">
      {commit && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-4 text-[12.5px] text-muted">
            <span>{commit.commitAuthor?.name || commit.author?.login || 'Unknown author'}</span>
            <span>{commit.commitAuthor?.date ? formatDate(commit.commitAuthor.date) : 'Unknown date'}</span>
            {commit.stats && <span>{commit.stats.total} changes, {commit.stats.additions} additions, {commit.stats.deletions} deletions</span>}
          </div>
          <div className="overflow-hidden rounded-lg border border-line">
            {(commit.files || []).map((file) => (
              <div key={file.filename} className="border-b border-line px-3 py-3 last:border-0">
                <div className="flex items-center gap-3 text-[13px]">
                  <Icon name="file" size={14} className="text-faint" />
                  <span className="min-w-0 flex-1 truncate font-mono text-ink">{file.filename}</span>
                  <span className="text-[11px] text-muted">{file.status}</span>
                  <span className="text-[11px] text-success">+{file.additions}</span>
                  <span className="text-[11px] text-danger">-{file.deletions}</span>
                </div>
                {file.patch && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-base p-2 font-mono text-[11px] leading-relaxed text-muted">{file.patch}</pre>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export function GitHubRepositoryPanel({ projectId, repository, loading = false, error: repositoryError, onImport, onSync, canManage }) {
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [commits, setCommits] = useState([]);
  const [commit, setCommit] = useState(null);
  const [commitLoading, setCommitLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const tree = useMemo(() => buildTree(repository?.tree || []), [repository]);

  useEffect(() => {
    if (!repository) return;
    setError(null);
    githubAPI.commits(projectId).then(setCommits).catch((requestError) => setError(requestError));
  }, [projectId, repository]);

  const openFile = async (entry) => {
    setSelected(entry.path);
    setFileLoading(true);
    try {
      setFile(await githubAPI.file(projectId, entry.path, repository.defaultBranch));
    } catch (requestError) {
      toast.error(requestError.message || 'Could not read this GitHub file.');
    } finally {
      setFileLoading(false);
    }
  };

  const openCommit = async (item) => {
    setCommitLoading(true);
    try {
      setCommit(await githubAPI.commit(projectId, item.sha));
    } catch (requestError) {
      toast.error(requestError.message || 'Could not load commit details.');
    } finally {
      setCommitLoading(false);
    }
  };

  if (!repository) {
    if (loading) {
      return (
        <div className="space-y-4">
          <Card className="p-5"><div className="h-5 w-48 animate-pulse rounded bg-raised" /><div className="mt-3 h-4 w-80 animate-pulse rounded bg-raised" /></Card>
          <Card className="p-5"><div className="h-64 animate-pulse rounded bg-raised" /></Card>
        </div>
      );
    }
    if (repositoryError) {
      return <ErrorState title="Could not load the GitHub repository" message={repositoryError.message} onRetry={() => window.location.reload()} />;
    }
    return (
      <EmptyState
        icon="github"
        title="Connect a GitHub repository"
        description="Import a real repository to browse its tree, inspect files and review commit history."
        action={canManage && <Button variant="primary" icon="github" onClick={onImport}>Import from GitHub</Button>}
      />
    );
  }

  return (
    <section className="space-y-5">
      <Card>
        <CardHeader
          title={repository.fullName}
          description={repository.description || 'GitHub repository'}
          action={(
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" icon="externalLink" href={repository.htmlUrl} target="_blank" rel="noreferrer">GitHub</Button>
              {canManage && <Button size="sm" variant="secondary" icon="refresh" onClick={onSync}>Sync</Button>}
            </div>
          )}
        />
        <div className="grid gap-3 px-5 py-4 text-[12.5px] text-muted sm:grid-cols-4">
          <span><strong className="text-ink">{repository.defaultBranch}</strong> default branch</span>
          <span><strong className="text-ink">{repository.tree.filter((entry) => entry.type === 'blob').length}</strong> files</span>
          <span><strong className="text-ink">{repository.stars}</strong> stars</span>
          <span>Synced {timeAgo(repository.syncedAt)}</span>
        </div>
      </Card>

      {error && <ErrorState title="Could not load GitHub commits" message={error.message} onRetry={() => githubAPI.commits(projectId).then(setCommits).catch(setError)} />}

      <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="Repository files" description={`${repository.tree.length} imported paths`} />
          <div className="max-h-[560px] overflow-auto p-2">
            {tree.map((node) => <TreeNode key={node.path} node={node} level={0} selectedPath={selected} onSelect={openFile} />)}
          </div>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader title={file?.path || 'Select a file'} description={file ? `${file.size} bytes · ${file.sha}` : 'Open a file from the repository tree'} />
          <div className="min-h-[420px] overflow-auto bg-[#111827] p-4">
            {fileLoading && <div className="space-y-2">{Array.from({ length: 8 }).map((_, index) => <SkeletonRow key={index} />)}</div>}
            {!fileLoading && file && <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-slate-200">{file.content}</pre>}
            {!fileLoading && !file && <p className="py-16 text-center text-[13px] text-slate-400">Choose a file to view its real GitHub contents.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Commit history" description="Real commits from the repository default branch" />
        <div className="divide-y divide-line">
          {commits.map((item) => (
            <button key={item.sha} type="button" onClick={() => openCommit(item)} className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-raised">
              <Icon name="branch" size={16} className="mt-0.5 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-ink">{item.message.split('\n')[0]}</span>
                <span className="mt-1 block text-[12px] text-muted">{item.author?.login || item.commitAuthor?.name || 'Unknown author'} · {item.committedAt ? timeAgo(item.committedAt) : 'Unknown date'}</span>
              </span>
              <span className="font-mono text-[11px] text-faint">{item.sha.slice(0, 7)}</span>
            </button>
          ))}
          {!commits.length && !error && <p className="px-5 py-8 text-center text-[13px] text-muted">No commits returned by GitHub.</p>}
        </div>
      </Card>

      <CommitDetails commit={commit} onClose={() => setCommit(null)} />
      {commitLoading && <span className="sr-only">Loading commit details</span>}
    </section>
  );
}
