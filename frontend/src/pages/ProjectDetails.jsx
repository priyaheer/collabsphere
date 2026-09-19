import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { Button, IconButton } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Badge, StatusBadge, VisibilityBadge } from '../components/common/Badge.jsx';
import { Avatar, AvatarGroup } from '../components/common/Avatar.jsx';
import { ProgressBar } from '../components/common/ProgressBar.jsx';
import { Skeleton, SkeletonCard, SkeletonRow } from '../components/common/Skeleton.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { MarkdownPreview } from '../components/editor/MarkdownPreview.jsx';
import { NoteCard } from '../components/cards/NoteCard.jsx';
import { FileRow } from '../components/cards/FileRow.jsx';
import { MemberRow } from '../components/cards/MemberRow.jsx';
import { ActivityFeed } from '../components/cards/ActivityFeed.jsx';
import { StatCard } from '../components/cards/StatCard.jsx';
import { AreaChart } from '../components/charts/AreaChart.jsx';
import { DonutChart } from '../components/charts/DonutChart.jsx';
import { ChartCard } from '../components/charts/ChartCard.jsx';
import { ProjectFormModal } from '../components/modals/ProjectFormModal.jsx';
import { AddMemberModal } from '../components/modals/AddMemberModal.jsx';
import { UploadModal } from '../components/modals/UploadModal.jsx';
import { FilePreviewModal } from '../components/modals/FilePreviewModal.jsx';
import { AIResultModal } from '../components/ai/AIResultModal.jsx';
import { GitHubImportModal } from '../components/modals/GitHubImportModal.jsx';
import { GitHubRepositoryPanel } from '../components/github/GitHubRepositoryPanel.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, timeAgo } from '../utils/format.js';
import {
  analyticsAPI,
  fileAPI,
  geminiAPI,
  memberAPI,
  notesAPI,
  projectAPI,
  githubAPI,
} from '../services/api.js';

const TABS = [
  { value: 'overview', label: 'Overview', icon: 'dashboard' },
  { value: 'notes', label: 'Notes', icon: 'note' },
  { value: 'files', label: 'Files', icon: 'files' },
  { value: 'members', label: 'Members', icon: 'users' },
  { value: 'analytics', label: 'Analytics', icon: 'chart' },
  { value: 'readme', label: 'README', icon: 'book' },
  { value: 'github', label: 'GitHub', icon: 'github' },
  { value: 'ai', label: 'AI', icon: 'sparkles' },
];

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'overview');
  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [ai, setAi] = useState({ open: false, loading: false, result: null, title: '' });
  const [githubImportOpen, setGithubImportOpen] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const project = useAsync(() => projectAPI.get(projectId), [projectId]);
  const notes = useAsync(() => notesAPI.list({ projectId }), [projectId]);
  const files = useAsync(() => fileAPI.list({ projectId }), [projectId]);
  const members = useAsync(() => memberAPI.list(projectId), [projectId]);
  const activity = useAsync(() => projectAPI.activity(projectId), [projectId]);
  const stats = useAsync(() => analyticsAPI.overview({ range: '30d', projectId }), [projectId]);
  const github = useAsync(
    () => githubAPI.get(projectId).catch((error) => {
      if (error.status === 404) return null;
      throw error;
    }),
    [projectId]
  );

  const data = project.data;
  const owner = data?.owner;
  const memberUsers = (members.data || []).map((m) => m.user).filter(Boolean);
  const canManage = data && (data.ownerId === user?._id || members.data?.some((m) => m.userId === user?._id && m.role === 'Admin'));
  const readmeSource = data?.readme || '# README\n\nNo README has been saved for this project yet.';

  const changeTab = (value) => {
    setTab(value);
    params.set('tab', value);
    setParams(params, { replace: true });
  };

  const runAI = async (kind) => {
    const titles = {
      readme: 'Generated README',
      summary: 'Project summary',
    };
    setAi({ open: true, loading: true, result: null, title: titles[kind] });
    const res =
      kind === 'readme'
        ? await geminiAPI.generateReadme({ name: data.name, description: data.description, techStack: data.techStack })
        : await geminiAPI.chat({ prompt: 'Summarise this project', context: { type: 'project', id: projectId } });
    setAi({ open: true, loading: false, result: res.content, title: titles[kind] });
  };

  const copyLink = () => {
    if (!data?.publicToken) return;
    const url = `${window.location.origin}/public/project/${data.publicToken}`;
    navigator.clipboard?.writeText(url);
    toast.success('Public link copied');
  };

  const togglePublicSharing = async () => {
    const nextVisibility = data.visibility === 'public' ? 'private' : 'public';
    await projectAPI.update(projectId, { visibility: nextVisibility });
    await project.refetch();
    toast.success(nextVisibility === 'public' ? 'Public sharing enabled' : 'Public sharing disabled');
  };

  const preview = async (file) => {
    setPreviewFile(await fileAPI.get(file._id));
  };

  const download = async (file) => {
    const { url } = await fileAPI.download(file._id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (project.loading) {
    return (
      <AppLayout>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-9 w-72" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (project.error || !data) {
    return (
      <AppLayout>
        <ErrorState
          title="Project not found"
          message="It may have been deleted, or you no longer have access to it."
          onRetry={() => navigate('/projects')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5">
        <nav className="mb-3 flex items-center gap-1.5 text-[12.5px] text-faint">
          <Link to="/projects" className="transition-colors hover:text-ink">
            Projects
          </Link>
          <Icon name="chevronRight" size={12} />
          <span className="text-muted">{data.name}</span>
        </nav>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line"
                style={{ color: data.accent }}
              >
                <Icon name="folder" size={19} />
              </span>
              <h1 className="font-display text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">
                {data.name}
              </h1>
              <StatusBadge status={data.status} />
              <VisibilityBadge visibility={data.visibility} />
            </div>

            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">{data.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-faint">
              <span className="flex items-center gap-1.5">
                <Avatar user={owner} size="xs" />
                Owned by {owner?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={13} />
                Updated {timeAgo(data.updatedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="calendar" size={13} />
                Created {formatDate(data.createdAt)}
              </span>
              <span className="flex items-center gap-2">
                <AvatarGroup users={memberUsers} max={4} size="xs" />
                {data.members.length} members
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

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {canManage && data.visibility === 'public' ? (
              <>
                <Button variant="secondary" icon="link" onClick={copyLink}>
                  Copy public link
                </Button>
                <Button variant="ghost" icon="lock" onClick={togglePublicSharing}>
                  Disable sharing
                </Button>
              </>
            ) : canManage ? (
              <Button variant="secondary" icon="globe" onClick={togglePublicSharing}>
                Enable public sharing
              </Button>
            ) : null}
            <Button variant="secondary" icon="edit" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            {canManage && (
              <Button variant="secondary" icon="github" onClick={() => setGithubImportOpen(true)}>
                {github.data ? 'Change GitHub' : 'Import from GitHub'}
              </Button>
            )}
            <Button variant="ai" icon="sparkles" onClick={() => runAI('readme')}>
              Generate README
            </Button>
          </div>
        </div>

        <div className="mt-5 max-w-sm">
          <ProgressBar value={data.progress} showLabel />
        </div>
      </div>

      <Tabs tabs={TABS.map((t) =>
        t.value === 'notes'
          ? { ...t, count: notes.data?.length }
          : t.value === 'files'
          ? { ...t, count: files.data?.length }
          : t.value === 'members'
          ? { ...t, count: members.data?.length }
          : t
      )} value={tab} onChange={changeTab} className="mb-6" />

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Notes" value={notes.data?.length ?? 0} icon="note" loading={notes.loading} />
              <StatCard label="Files" value={files.data?.length ?? 0} icon="files" loading={files.loading} />
              <StatCard label="Members" value={data.members.length} icon="users" />
            </div>

            <Card>
              <CardHeader
                title="README"
                description="The first thing a new contributor reads"
                action={
                  <Button size="sm" variant="ghost" icon="arrowRight" onClick={() => changeTab('readme')}>
                    Open
                  </Button>
                }
              />
              <div className="max-h-72 overflow-hidden px-5 py-4">
                <MarkdownPreview source={readmeSource.split('\n').slice(0, 14).join('\n')} />
              </div>
            </Card>

            <Card>
              <CardHeader title="Recent activity" description="What moved in this project" />
              {activity.loading ? <ActivityFeed loading /> : <ActivityFeed items={activity.data || []} />}
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <h3 className="font-display text-[14px] font-semibold text-ink">Quick actions</h3>
              <div className="mt-3 space-y-2">
                {[
                  { label: 'Write a note', icon: 'note', onClick: () => navigate(`/notes/new?projectId=${projectId}`) },
                  { label: 'Upload files', icon: 'upload', onClick: () => setUploadOpen(true) },
                  { label: 'Add a member', icon: 'users', onClick: () => setAddMemberOpen(true) },
                  { label: 'Ask about this project', icon: 'sparkles', onClick: () => navigate(`/ai?context=project:${projectId}`) },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="group flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-left text-[13.5px] text-ink transition-colors hover:border-lineStrong hover:bg-raised"
                  >
                    <Icon name={action.icon} size={15} className="text-muted" />
                    <span className="flex-1">{action.label}</span>
                    <Icon name="arrowRight" size={13} className="text-faint transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-display text-[14px] font-semibold text-ink">Members</h3>
              <div className="mt-3 space-y-2.5">
                {(members.data || []).map((m) => (
                  <div key={m.userId} className="flex items-center gap-2.5">
                    <Avatar user={m.user} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink">{m.user?.name}</span>
                      <span className="block text-[11.5px] text-faint">@{m.user?.username}</span>
                    </span>
                    <Badge tone={m.role === 'Owner' ? 'accent' : 'neutral'}>{m.role}</Badge>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="secondary" fullWidth icon="plus" className="mt-4" onClick={() => setAddMemberOpen(true)}>
                Add member
              </Button>
            </Card>
          </aside>
        </div>
      )}

      {/* Notes */}
      {tab === 'notes' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13.5px] text-muted">Documentation written by the team.</p>
            <Button variant="primary" size="sm" icon="plus" onClick={() => navigate(`/notes/new?projectId=${projectId}`)}>
              New note
            </Button>
          </div>
          {notes.loading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {!notes.loading && (notes.data || []).length === 0 && (
            <EmptyState
              icon="note"
              title="Start documenting your project"
              description="The first note usually answers: what is this, and why does it work this way?"
              action={
                <Button variant="primary" icon="plus" onClick={() => navigate(`/notes/new?projectId=${projectId}`)}>
                  Write the first note
                </Button>
              }
            />
          )}
          {!notes.loading && (notes.data || []).length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {notes.data.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Files */}
      {tab === 'files' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13.5px] text-muted">Source files, schemas and documents.</p>
            <Button variant="primary" size="sm" icon="upload" onClick={() => setUploadOpen(true)}>
              Upload file
            </Button>
          </div>
          <Card className="overflow-hidden">
            {files.loading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            {!files.loading && (files.data || []).length === 0 && (
              <EmptyState
                className="border-0"
                icon="upload"
                title="Upload your first file"
                description="Drop in the code or documents this project depends on."
                action={
                  <Button variant="primary" icon="upload" onClick={() => setUploadOpen(true)}>
                    Upload file
                  </Button>
                }
              />
            )}
            {!files.loading &&
              (files.data || []).map((file) => (
                <FileRow
                  key={file._id}
                  file={file}
                  onPreview={preview}
                  onDelete={setDeletingFile}
                  onDownload={download}
                  onExplain={async (f) => {
                    setAi({ open: true, loading: true, result: null, title: `Explaining ${f.name}` });
                    const res = await geminiAPI.explainCode({ fileId: f._id });
                    setAi({ open: true, loading: false, result: res.content, title: `Explaining ${f.name}` });
                  }}
                />
              ))}
          </Card>
        </section>
      )}

      {/* Members */}
      {tab === 'members' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13.5px] text-muted">Owners set direction, admins manage people, members write.</p>
            <Button variant="primary" size="sm" icon="plus" onClick={() => setAddMemberOpen(true)}>
              Add member
            </Button>
          </div>
          <Card className="overflow-hidden">
            {members.loading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            {!members.loading &&
              (members.data || []).map((m) => (
                <MemberRow
                  key={m.userId}
                  membership={m}
                  canManage={canManage}
                  onRoleChange={async (userId, role) => {
                    await memberAPI.updateRole(projectId, userId, role);
                    toast.success('Role updated');
                    members.refetch();
                  }}
                  onRemove={setRemovingMember}
                />
              ))}
          </Card>
        </section>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Activity events" value={stats.data?.totals.activityEvents} delta={stats.data?.deltas.activityEvents} icon="trendingUp" loading={stats.loading} />
            <StatCard label="Notes" value={notes.data?.length ?? 0} icon="note" loading={stats.loading} />
            <StatCard label="Files" value={files.data?.length ?? 0} icon="files" loading={stats.loading} />
            <StatCard label="Assistant calls" value={stats.data?.totals.aiCalls} delta={stats.data?.deltas.aiCalls} icon="sparkles" loading={stats.loading} />
          </div>

          <Card>
            <CardHeader title="Member contributions" description="Notes and files created by each project member" />
            <div className="divide-y divide-line">
              {(stats.data?.contributions || []).map((contribution) => (
                <div key={contribution.userId} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={contribution.user} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink">{contribution.user?.name}</p>
                    <p className="text-[12px] text-faint">{contribution.user?.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-right text-[12.5px] text-muted">
                    <span><strong className="text-ink">{contribution.notes}</strong> notes</span>
                    <span><strong className="text-ink">{contribution.files}</strong> files</span>
                  </div>
                </div>
              ))}
              {!stats.loading && !stats.data?.contributions?.length && (
                <p className="px-5 py-8 text-center text-[13px] text-muted">No member contributions yet.</p>
              )}
            </div>
          </Card>

          <ChartCard title="Activity over time" description="Last 30 days in this project" loading={stats.loading}>
            {stats.data && <AreaChart id="project-activity" data={stats.data.activity} labels={stats.data.labels} height={220} />}
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="File types" description="What the project is made of" loading={stats.loading}>
              {stats.data && <DonutChart data={stats.data.fileMix} centerLabel="files" />}
            </ChartCard>
            <ChartCard title="Notes created" description="Documentation added per day" loading={stats.loading}>
              {stats.data && (
                <AreaChart id="project-notes" data={stats.data.notesCreated} labels={stats.data.labels} height={190} color="var(--c-violet)" />
              )}
            </ChartCard>
          </div>
        </section>
      )}

      {/* README */}
      {tab === 'readme' && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Card className="min-w-0">
            <CardHeader
              title="README.md"
              description="Rendered as it will appear on the public project page"
              action={
                <Button size="sm" variant="ghost" icon="copy" onClick={() => {
                  navigator.clipboard?.writeText(data.readme || '');
                  toast.success('README copied');
                }}>
                  Copy
                </Button>
              }
            />
            <div className="px-6 py-6">
              <MarkdownPreview source={readmeSource} />
            </div>
          </Card>

          <aside className="space-y-4">
            <Card className="p-4">
              <h3 className="font-display text-[14px] font-semibold text-ink">Regenerate</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                Rewrite the README from the project name, stack and notes. Nothing is saved until you accept it.
              </p>
              <Button variant="ai" icon="sparkles" fullWidth className="mt-3" onClick={() => runAI('readme')}>
                Generate with AI
              </Button>
              <Button variant="ghost" icon="book" fullWidth className="mt-2" to="/readme">
                Open the full generator
              </Button>
            </Card>
          </aside>
        </section>
      )}

      {tab === 'github' && (
        <GitHubRepositoryPanel
          projectId={projectId}
          repository={github.data}
          canManage={canManage}
          onImport={() => setGithubImportOpen(true)}
          onSync={async () => {
            try {
              await githubAPI.sync(projectId);
              await github.refetch();
              toast.success('GitHub repository synced');
            } catch (error) {
              toast.error(error.message || 'Could not sync GitHub repository');
            }
          }}
        />
      )}

      {/* AI */}
      {tab === 'ai' && (
        <section className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'Summarise this project', body: 'What it does, who owns it, what changed this week.', icon: 'info', kind: 'summary' },
            { title: 'Generate the README', body: 'Install, usage, environment and contribution sections.', icon: 'book', kind: 'readme' },
          ].map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => runAI(card.kind)}
              className="group relative overflow-hidden rounded-xl border border-line bg-surface p-5 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-lineStrong"
            >
              <span className="absolute inset-x-0 top-0 h-px cs-hairline-ai opacity-0 transition-opacity group-hover:opacity-100" />
              <Icon name={card.icon} size={18} className="text-ai" />
              <h3 className="mt-4 font-display text-[15px] font-semibold text-ink">{card.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{card.body}</p>
            </button>
          ))}

          <Card className="p-5 sm:col-span-2">
            <h3 className="font-display text-[15px] font-semibold text-ink">Work with the full assistant</h3>
            <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-muted">
              Open the assistant with this project already set as context, then ask about any file or note inside it.
            </p>
            <Button variant="primary" icon="sparkles" className="mt-4" to={`/ai?context=project:${projectId}`}>
              Open assistant
            </Button>
          </Card>
        </section>
      )}

      {/* Modals */}
      <ProjectFormModal
        open={editOpen}
        project={data}
        onClose={() => setEditOpen(false)}
        onSubmit={async (form) => {
          await projectAPI.update(projectId, form);
          toast.success('Project updated');
          project.refetch();
        }}
      />

      <GitHubImportModal
        open={githubImportOpen}
        existingRepository={github.data}
        onClose={() => setGithubImportOpen(false)}
        onImport={async (url) => {
          await githubAPI.import(projectId, url);
          await github.refetch();
          changeTab('github');
          toast.success('GitHub repository imported');
        }}
      />

      <AddMemberModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        existingIds={data.members.map((m) => m.userId)}
        projectId={projectId}
        onAdd={async (payload) => {
          await memberAPI.add(projectId, payload);
          toast.success('Member added');
          members.refetch();
          project.refetch();
        }}
      />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projects={[data]}
        defaultProjectId={projectId}
        onUpload={async (payload) => {
          await fileAPI.upload(payload);
          toast.success('File uploaded');
          files.refetch();
        }}
      />

      <FilePreviewModal
        open={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={download}
        onExplain={async (f) => {
          setPreviewFile(null);
          setAi({ open: true, loading: true, result: null, title: `Explaining ${f.name}` });
          const res = await geminiAPI.explainCode({ fileId: f._id });
          setAi({ open: true, loading: false, result: res.content, title: `Explaining ${f.name}` });
        }}
      />

      <AIResultModal
        open={ai.open}
        loading={ai.loading}
        result={ai.result}
        title={ai.title}
        subtitle="Review before you save it anywhere"
        onClose={() => setAi({ open: false, loading: false, result: null, title: '' })}
        onRegenerate={() => runAI(ai.title.includes('README') ? 'readme' : 'summary')}
      />

      <ConfirmDialog
        open={Boolean(removingMember)}
        onClose={() => setRemovingMember(null)}
        title={`Remove ${removingMember?.user?.name}?`}
        message="They lose access to every note and file in this project."
        confirmLabel="Remove member"
        onConfirm={async () => {
          await memberAPI.remove(projectId, removingMember.userId);
          toast.success('Member removed');
          members.refetch();
          project.refetch();
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingFile)}
        onClose={() => setDeletingFile(null)}
        title={`Delete ${deletingFile?.name}?`}
        message="The file is removed for everyone on the project."
        confirmLabel="Delete file"
        onConfirm={async () => {
          await fileAPI.remove(deletingFile._id);
          toast.success('File deleted');
          files.refetch();
        }}
      />
    </AppLayout>
  );
}
