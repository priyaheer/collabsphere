import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Field, Input, Textarea } from '../common/Input.jsx';
import { Icon } from '../common/Icon.jsx';
import { Switch } from '../common/Switch.jsx';
import { cn } from '../../utils/cn.js';
import { githubAPI } from '../../services/api.js';

const SUGGESTED_TECH = ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Python', 'Docker', 'Tailwind'];

const EMPTY = { name: '', description: '', techStack: [], visibility: 'private', generateReadme: true };

/** One form for both create and edit — the verb changes, the fields do not. */
export function ProjectFormModal({ open, onClose, onSubmit, project }) {
  const [form, setForm] = useState(EMPTY);
  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('manual');
  const [repositories, setRepositories] = useState([]);
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [repositoriesError, setRepositoriesError] = useState('');
  const [githubConnection, setGithubConnection] = useState(null);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const isEdit = Boolean(project);

  useEffect(() => {
    if (open) {
      setForm(project ? { ...EMPTY, ...project } : EMPTY);
      setErrors({});
      setTechInput('');
      setMode('manual');
      setSelectedRepository(null);
      setRepositories([]);
      setGithubConnection(null);
      setRepositoriesError('');
    }
  }, [open, project]);

  const loadGitHubRepositories = async () => {
    setRepositoriesLoading(true);
    setRepositoriesError('');
    try {
      const connection = await githubAPI.connection();
      setGithubConnection(connection);
      if (!connection.connected) {
        setRepositories([]);
        return;
      }
      setRepositories(await githubAPI.repositories());
    } catch (error) {
      setRepositories([]);
      setRepositoriesError(error.message || 'GitHub repositories could not be loaded.');
    } finally {
      setRepositoriesLoading(false);
    }
  };

  useEffect(() => {
    if (!open || isEdit || mode !== 'github') return;
    loadGitHubRepositories();
  }, [open, isEdit, mode]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const addTech = (value) => {
    const tech = value.trim();
    if (!tech || form.techStack.includes(tech)) return;
    set({ techStack: [...form.techStack, tech] });
    setTechInput('');
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Give the project a name.';
    else if (form.name.trim().length < 3) next.name = 'Use at least three characters.';
    if (form.description.length > 240) next.description = 'Keep the description under 240 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!isEdit && mode === 'github' && !selectedRepository) {
      setErrors({ repository: 'Choose a repository to import.' });
      return;
    }
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(mode === 'github' ? { ...form, githubRepository: selectedRepository } : form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit project' : 'Create a project'}
      description={isEdit ? 'Changes apply to everyone on the project.' : 'Projects hold notes, files, members and documentation.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} isLoading={saving} icon={isEdit ? 'check' : 'plus'}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {!isEdit && (
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 'manual', icon: 'plus', title: 'Create Project Manually', copy: 'Start with your own project details.' },
              { value: 'github', icon: 'github', title: 'Import from GitHub', copy: 'Choose from your accessible repositories.' },
            ].map((option) => (
              <button key={option.value} type="button" onClick={() => setMode(option.value)} className={cn('flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors', mode === option.value ? 'border-accent bg-accentSoft' : 'border-line hover:border-lineStrong')}>
                <Icon name={option.icon} size={17} className={cn('mt-0.5 shrink-0', mode === option.value ? 'text-accent' : 'text-faint')} />
                <span><span className="block text-[13.5px] font-medium text-ink">{option.title}</span><span className="mt-0.5 block text-[12px] leading-snug text-muted">{option.copy}</span></span>
              </button>
            ))}
          </div>
        )}

        {!isEdit && mode === 'github' && (
          <Field label="GitHub repository" required error={errors.repository}>
            {repositoriesLoading ? <p className="rounded-xl border border-line px-3 py-3 text-[13px] text-muted">Checking your connected GitHub account...</p> : repositoriesError ? (
              <div className="rounded-xl border border-danger/40 bg-danger/5 px-3 py-3">
                <p className="text-[13px] text-danger">{repositoriesError}</p>
                <Button type="button" size="sm" variant="ghost" icon="refresh" className="mt-2" onClick={loadGitHubRepositories}>Try again</Button>
              </div>
            ) : !githubConnection?.connected ? (
              <div className="rounded-xl border border-line px-3 py-3">
                <p className="text-[13px] text-muted">Connect GitHub in Settings before importing a repository.</p>
                <Button type="button" size="sm" variant="secondary" icon="github" className="mt-3" onClick={() => githubAPI.connect()}>Connect GitHub</Button>
              </div>
            ) : (
              <div className="max-h-56 space-y-2 overflow-auto">
                {repositories.map((repository) => (
                  <button key={repository.id} type="button" onClick={() => { setSelectedRepository(repository); set({ name: repository.name, description: repository.description, techStack: repository.language ? [repository.language] : [] }); }} className={cn('flex w-full items-start gap-3 rounded-lg border p-3 text-left', selectedRepository?.id === repository.id ? 'border-accent bg-accentSoft' : 'border-line hover:border-lineStrong')}>
                    <Icon name="github" size={16} className="mt-0.5 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-ink">{repository.fullName}</span><span className="mt-0.5 block truncate text-[12px] text-muted">{repository.description || 'No description'} · {repository.visibility}</span></span>
                  </button>
                ))}
                {!repositories.length && <p className="rounded-xl border border-line px-3 py-3 text-[13px] text-muted">No accessible repositories were returned by GitHub.</p>}
              </div>
            )}
          </Field>
        )}

        {(isEdit || mode === 'manual') && <>
        <Field label="Project name" required error={errors.name} htmlFor="project-name">
          <Input
            id="project-name"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Atlas API Gateway"
            error={errors.name}
            autoFocus
          />
        </Field>

        <Field
          label="Description"
          hint={`${form.description.length}/240 — one sentence a new teammate would understand`}
          error={errors.description}
          htmlFor="project-description"
        >
          <Textarea
            id="project-description"
            rows={3}
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Edge gateway that handles auth, rate limiting and request shaping."
            error={errors.description}
          />
        </Field>

        <Field label="Technologies" hint="Press Enter to add">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTech(techInput);
              }
            }}
            placeholder="React, Node.js, MongoDB…"
            icon="tag"
          />
          {form.techStack.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {form.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-raised px-2 py-1 font-mono text-[11.5px] text-ink"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => set({ techStack: form.techStack.filter((t) => t !== tech) })}
                    className="text-faint transition-colors hover:text-danger"
                    aria-label={`Remove ${tech}`}
                  >
                    <Icon name="x" size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SUGGESTED_TECH.filter((t) => !form.techStack.includes(t)).slice(0, 6).map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addTech(tech)}
                className="rounded-md border border-dashed border-line px-2 py-1 font-mono text-[11.5px] text-faint transition-colors hover:border-lineStrong hover:text-ink"
              >
                + {tech}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Visibility">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 'private', icon: 'lock', title: 'Private', copy: 'Only invited members can open it.' },
              { value: 'public', icon: 'globe', title: 'Public', copy: 'Anyone with the link reads the docs.' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set({ visibility: option.value })}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors',
                  form.visibility === option.value
                    ? 'border-accent bg-accentSoft'
                    : 'border-line hover:border-lineStrong'
                )}
              >
                <Icon
                  name={option.icon}
                  size={17}
                  className={cn('mt-0.5 shrink-0', form.visibility === option.value ? 'text-accent' : 'text-faint')}
                />
                <span>
                  <span className="block text-[13.5px] font-medium text-ink">{option.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted">{option.copy}</span>
                </span>
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-xl border border-line px-4">
          <Switch
            id="generate-readme"
            checked={form.generateReadme}
            onChange={(v) => set({ generateReadme: v })}
            label="Start with a generated README"
            description="The assistant drafts a README from the name, description and stack. You can edit it after."
          />
        </div>
        </>}
      </div>
    </Modal>
  );
}
