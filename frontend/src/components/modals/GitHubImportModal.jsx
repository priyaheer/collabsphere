import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Field, Input } from '../common/Input.jsx';
import { githubAPI } from '../../services/api.js';

export function GitHubImportModal({ open, onClose, onImport, existingRepository }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState(null);

  useEffect(() => {
    if (open) {
      setUrl(existingRepository?.htmlUrl || '');
      setError('');
      setSelectedRepository(null);
      setRepositoriesLoading(true);
      githubAPI.repositories().then(setRepositories).catch(() => setRepositories([])).finally(() => setRepositoriesLoading(false));
    }
  }, [open, existingRepository]);

  const submit = async () => {
    if (!selectedRepository && !/^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/i.test(url.trim())) {
      setError('Use a repository URL such as https://github.com/owner/repository');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onImport(selectedRepository ? { fullName: selectedRepository.fullName } : url.trim());
      onClose();
    } catch (requestError) {
      setError(requestError.message || 'GitHub could not import this repository.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existingRepository ? 'Change GitHub repository' : 'Import from GitHub'}
      description="Choose a repository from your connected GitHub account, or paste a repository URL."
      size="md"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" icon="github" onClick={submit} isLoading={saving}>
            {existingRepository ? 'Re-import repository' : 'Import repository'}
          </Button>
        </>
      )}
    >
      <Field label="GitHub repository URL" required error={error} htmlFor="github-repository-url">
        <Input
          id="github-repository-url"
          icon="link"
          value={url}
          onChange={(event) => { setUrl(event.target.value); setSelectedRepository(null); }}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
          placeholder="https://github.com/owner/repository"
          error={error}
          autoFocus
        />
      </Field>
      <Field label="Or choose an accessible repository" hint={repositoriesLoading ? 'Loading repositories from your connected GitHub account...' : ''}>
        <div className="max-h-48 space-y-2 overflow-auto">
          {repositories.map((repository) => (
            <button key={repository.id} type="button" onClick={() => { setSelectedRepository(repository); setUrl(repository.htmlUrl); }} className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${selectedRepository?.id === repository.id ? 'border-accent bg-accentSoft' : 'border-line hover:border-lineStrong'}`}>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-ink">{repository.fullName}</span><span className="mt-0.5 block truncate text-[12px] text-muted">{repository.description || 'No description'} · {repository.visibility}</span></span>
            </button>
          ))}
          {!repositoriesLoading && !repositories.length && <p className="rounded-lg border border-line px-3 py-2.5 text-[12.5px] text-muted">Connect GitHub in Settings to browse your repositories.</p>}
        </div>
      </Field>
      <p className="mt-4 rounded-lg border border-line bg-raised px-3 py-2.5 text-[12.5px] leading-relaxed text-muted">
        CollabSphere validates the repository with GitHub, imports its metadata and complete tree, then reads file contents directly from GitHub.
      </p>
    </Modal>
  );
}
