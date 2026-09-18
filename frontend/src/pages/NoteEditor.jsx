import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Button, IconButton } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Input, Select } from '../components/common/Input.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { MarkdownEditor } from '../components/editor/MarkdownEditor.jsx';
import { AIResultModal } from '../components/ai/AIResultModal.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { timeAgo } from '../utils/format.js';
import { geminiAPI, notesAPI, projectAPI } from '../services/api.js';

const STARTER = `# Title

Write the decision first, then the reasoning.

## Context

## Decision

## Consequences
`;

export default function NoteEditor() {
  const { noteId } = useParams();
  const [params] = useSearchParams();
  const isNew = !noteId || noteId === 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    content: STARTER,
    tags: [],
    visibility: 'private',
    projectId: params.get('projectId') || '',
  });
  const [tagInput, setTagInput] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ai, setAi] = useState({ open: false, loading: false, result: null, title: '' });

  const projects = useAsync(() => projectAPI.list(), []);
  const note = useAsync(() => (isNew ? Promise.resolve(null) : notesAPI.get(noteId)), [noteId]);

  useEffect(() => {
    if (note.data) setForm({ ...note.data });
  }, [note.data]);

  useEffect(() => {
    if (!form.projectId && projects.data?.length && isNew) {
      setForm((f) => ({ ...f, projectId: params.get('projectId') || projects.data[0]._id }));
    }
  }, [projects.data, isNew, params, form.projectId]);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Give the note a title before saving');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await notesAPI.create(form);
        toast.success('Note saved');
        setDirty(false);
        navigate(`/notes/${created._id}`, { replace: true });
      } else {
        await notesAPI.update(noteId, form);
        toast.success('Note saved');
        setDirty(false);
        note.refetch();
      }
    } finally {
      setSaving(false);
    }
  };

  const runAI = async (kind) => {
    const title = kind === 'explain' ? 'What this note says' : 'Suggested improvements';
    setAi({ open: true, loading: true, result: null, title });
    const res =
      kind === 'explain'
        ? await geminiAPI.explainNote({ noteId: noteId || 'draft' })
        : await geminiAPI.improveNote({ noteId: noteId || 'draft' });
    setAi({ open: true, loading: false, result: res.content, title });
  };

  if (note.loading) {
    return (
      <AppLayout>
        <Skeleton className="h-9 w-80" />
        <Skeleton className="mt-6 h-[460px] w-full rounded-xl" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate('/notes')}
            className="mb-3 flex items-center gap-1.5 text-[12.5px] text-faint transition-colors hover:text-ink"
          >
            <Icon name="arrowLeft" size={13} />
            All notes
          </button>

          <input
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Untitled note"
            className="w-full bg-transparent font-display text-[26px] font-semibold tracking-[-0.025em] text-ink placeholder:text-faint focus:outline-none sm:text-[30px]"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-faint">
            <Select
              value={form.projectId}
              onChange={(e) => set({ projectId: e.target.value })}
              className="h-8 w-auto min-w-[160px] text-[12.5px]"
              options={(projects.data || []).map((p) => ({ value: p._id, label: p.name }))}
            />
            <button
              type="button"
              onClick={() => set({ visibility: form.visibility === 'public' ? 'private' : 'public' })}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12.5px] text-muted transition-colors hover:text-ink"
            >
              <Icon name={form.visibility === 'public' ? 'globe' : 'lock'} size={13} />
              {form.visibility === 'public' ? 'Public' : 'Private'}
            </button>
            {!isNew && <span>Updated {timeAgo(form.updatedAt)}</span>}
            {dirty && (
              <span className="flex items-center gap-1.5 text-warn">
                <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                Unsaved changes
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-raised px-2 py-1 text-[11.5px] text-ink"
              >
                <Icon name="tag" size={11} className="text-faint" />
                {tag}
                <button
                  type="button"
                  onClick={() => set({ tags: form.tags.filter((t) => t !== tag) })}
                  aria-label={`Remove ${tag}`}
                  className="text-faint transition-colors hover:text-danger"
                >
                  <Icon name="x" size={11} />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  if (!form.tags.includes(tagInput.trim())) set({ tags: [...form.tags, tagInput.trim()] });
                  setTagInput('');
                }
              }}
              placeholder="Add tag"
              className="h-7 w-24 rounded-md border border-dashed border-line bg-transparent px-2 text-[11.5px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!isNew && (
            <IconButton icon="trash" label="Delete note" variant="danger" onClick={() => setConfirmDelete(true)} />
          )}
          <Button variant="secondary" icon="eye" to={form.projectId ? `/projects/${form.projectId}?tab=notes` : '/notes'}>
            Project
          </Button>
          <Button variant="primary" icon="check" onClick={save} isLoading={saving} disabled={!dirty && !isNew}>
            Save note
          </Button>
        </div>
      </div>

      <MarkdownEditor
        value={form.content}
        onChange={(content) => set({ content })}
        aiActions={
          <>
            <button
              type="button"
              onClick={() => runAI('explain')}
              className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-lineStrong hover:text-ink"
            >
              <Icon name="sparkles" size={13} className="text-ai" />
              Explain note
            </button>
            <button
              type="button"
              onClick={() => runAI('improve')}
              className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-lineStrong hover:text-ink"
            >
              <Icon name="edit" size={13} className="text-ai" />
              Improve note
            </button>
          </>
        }
      />

      <AIResultModal
        open={ai.open}
        loading={ai.loading}
        result={ai.result}
        title={ai.title}
        subtitle="Nothing is written to the note until you apply it"
        applyLabel="Append to note"
        onApply={(result) => {
          set({ content: `${form.content}\n\n---\n\n${result}` });
          setAi({ open: false, loading: false, result: null, title: '' });
          toast.success('Added to the note', { description: 'Review it, then save.' });
        }}
        onRegenerate={() => runAI(ai.title.includes('improve') ? 'improve' : 'explain')}
        onClose={() => setAi({ open: false, loading: false, result: null, title: '' })}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete “${form.title || 'this note'}”?`}
        message="The note is removed for everyone on the project."
        confirmLabel="Delete note"
        onConfirm={async () => {
          await notesAPI.remove(noteId);
          toast.success('Note deleted');
          navigate('/notes');
        }}
      />
    </AppLayout>
  );
}
