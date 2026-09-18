import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Field, Input, Textarea, Select } from '../components/common/Input.jsx';
import { SegmentedControl } from '../components/common/SegmentedControl.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { MarkdownPreview } from '../components/editor/MarkdownPreview.jsx';
import { CodeBlock } from '../components/common/CodeBlock.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { geminiAPI, projectAPI } from '../services/api.js';

const EMPTY = {
  projectId: '',
  name: '',
  description: '',
  techStack: '',
  features: '',
  installation: '',
  usage: '',
  envVars: '',
  contributing: '',
};

export default function ReadmeGenerator() {
  const [form, setForm] = useState(EMPTY);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('preview');
  const [editing, setEditing] = useState(false);
  const toast = useToast();

  const projects = useAsync(() => projectAPI.list(), []);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const prefill = (projectId) => {
    const project = (projects.data || []).find((p) => p._id === projectId);
    if (!project) {
      set({ projectId: '' });
      return;
    }
    set({
      projectId,
      name: project.name,
      description: project.description,
      techStack: project.techStack.join(', '),
    });
  };

  const generate = async () => {
    if (!form.name.trim()) {
      toast.error('Add a project name first');
      return;
    }
    setLoading(true);
    try {
      const res = await geminiAPI.generateReadme(form);
      setResult(res.content);
      toast.ai('README generated', { description: 'Review it before you commit it.' });
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('README downloaded');
  };

  return (
    <AppLayout>
      <PageHeader
        title="README generator"
        description="Fill in what you know. The assistant writes the rest and keeps the structure consistent across projects."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Form */}
        <Card className="h-fit">
          <CardHeader title="Project details" description="Everything here goes into the prompt" />
          <div className="space-y-4 p-5">
            <Field label="Start from an existing project" hint="Optional — fills the first three fields">
              <Select
                value={form.projectId}
                onChange={(e) => prefill(e.target.value)}
                options={[{ value: '', label: 'Start from scratch' }, ...(projects.data || []).map((p) => ({ value: p._id, label: p.name }))]}
              />
            </Field>

            <Field label="Project name" required htmlFor="readme-name">
              <Input id="readme-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Atlas API Gateway" />
            </Field>

            <Field label="Description" htmlFor="readme-description">
              <Textarea
                id="readme-description"
                rows={3}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="One or two sentences on what this does and who it is for."
              />
            </Field>

            <Field label="Tech stack" hint="Comma separated" htmlFor="readme-stack">
              <Input id="readme-stack" value={form.techStack} onChange={(e) => set({ techStack: e.target.value })} placeholder="Node.js, Fastify, Redis" />
            </Field>

            <Field label="Features" hint="One per line" htmlFor="readme-features">
              <Textarea
                id="readme-features"
                rows={3}
                value={form.features}
                onChange={(e) => set({ features: e.target.value })}
                placeholder={'JWT verification with JWKS rotation\nSliding-window rate limiting'}
              />
            </Field>

            <Field label="Installation" hint="Shell commands" htmlFor="readme-install">
              <Textarea
                id="readme-install"
                rows={3}
                value={form.installation}
                onChange={(e) => set({ installation: e.target.value })}
                placeholder={'git clone …\nnpm install'}
                className="font-mono text-[12.5px]"
              />
            </Field>

            <Field label="Usage" htmlFor="readme-usage">
              <Textarea
                id="readme-usage"
                rows={2}
                value={form.usage}
                onChange={(e) => set({ usage: e.target.value })}
                placeholder="npm run dev"
                className="font-mono text-[12.5px]"
              />
            </Field>

            <Field label="Environment variables" hint="KEY=description, one per line" htmlFor="readme-env">
              <Textarea
                id="readme-env"
                rows={3}
                value={form.envVars}
                onChange={(e) => set({ envVars: e.target.value })}
                placeholder={'PORT=Port the server listens on\nREDIS_URL=Redis connection string'}
                className="font-mono text-[12.5px]"
              />
            </Field>

            <Field label="Contribution guidelines" htmlFor="readme-contributing">
              <Textarea
                id="readme-contributing"
                rows={2}
                value={form.contributing}
                onChange={(e) => set({ contributing: e.target.value })}
                placeholder="Branch from main, keep commits scoped…"
              />
            </Field>

            <div className="flex items-center gap-2 pt-1">
              <Button variant="ai" icon="sparkles" onClick={generate} isLoading={loading} fullWidth>
                Generate README with AI
              </Button>
              <Button variant="ghost" icon="refresh" onClick={() => setForm(EMPTY)} aria-label="Reset form" />
            </div>
          </div>
        </Card>

        {/* Output */}
        <Card className="min-w-0">
          <CardHeader
            title="README.md"
            description={result ? 'Review, edit, then copy it into your repo' : 'Output appears here'}
            action={
              result && (
                <SegmentedControl
                  size="sm"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'preview', label: 'Preview', icon: 'eye' },
                    { value: 'raw', label: 'Raw', icon: 'code' },
                  ]}
                />
              )
            }
          />

          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Spinner size={22} className="text-ai" />
              <p className="text-[13.5px] text-muted">Reading the project and drafting sections…</p>
            </div>
          )}

          {!loading && !result && (
            <div className="p-5">
              <EmptyState
                className="border-0"
                icon="book"
                title="No README yet"
                description="Fill in the form and generate. You can edit anything afterwards — nothing is written to the project automatically."
              />
            </div>
          )}

          {!loading && result && (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
                <Button size="sm" variant="secondary" icon="copy" onClick={() => {
                  navigator.clipboard?.writeText(result);
                  toast.success('README copied');
                }}>
                  Copy
                </Button>
                <Button size="sm" variant="secondary" icon="download" onClick={download}>
                  Download
                </Button>
                <Button size="sm" variant="secondary" icon={editing ? 'eye' : 'edit'} onClick={() => setEditing((e) => !e)}>
                  {editing ? 'Done editing' : 'Edit'}
                </Button>
                <Button size="sm" variant="ghost" icon="refresh" onClick={generate}>
                  Regenerate
                </Button>
              </div>

              <div className="p-5">
                {editing ? (
                  <Textarea
                    rows={24}
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="font-mono text-[12.5px]"
                  />
                ) : view === 'preview' ? (
                  <MarkdownPreview source={result} />
                ) : (
                  <CodeBlock code={result} filename="README.md" language="markdown" maxHeight={620} />
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-line px-5 py-3 text-[12px] text-faint">
                <Icon name="info" size={13} />
                Generated from a mock response. Connect <span className="font-mono text-muted">POST /ai/generate-readme</span> to switch it live.
              </div>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
