import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Input, Select } from '../components/common/Input.jsx';
import { SkeletonRow } from '../components/common/Skeleton.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { FileRow, FILE_TYPE_META } from '../components/cards/FileRow.jsx';
import { UploadModal } from '../components/modals/UploadModal.jsx';
import { FilePreviewModal } from '../components/modals/FilePreviewModal.jsx';
import { AIResultModal } from '../components/ai/AIResultModal.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useToast } from '../context/ToastContext.jsx';
import { cn } from '../utils/cn.js';
import { formatBytes } from '../utils/format.js';
import { fileAPI, geminiAPI, projectAPI } from '../services/api.js';

const TYPE_FILTERS = ['all', 'javascript', 'python', 'html', 'css', 'json', 'markdown', 'image', 'pdf', 'other'];

export default function Files() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [projectId, setProjectId] = useState('');
  const [sort, setSort] = useState('recent');
  const [uploadOpen, setUploadOpen] = useState(params.get('upload') === '1');
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [ai, setAi] = useState({ open: false, loading: false, result: null, title: '' });

  const debounced = useDebounce(query, 250);
  const toast = useToast();

  const files = useAsync(
    () => fileAPI.list({ q: debounced, type, sort, projectId: projectId || undefined }),
    [debounced, type, sort, projectId]
  );
  const projects = useAsync(() => projectAPI.list(), []);

  useEffect(() => {
    if (params.get('upload') === '1') {
      setUploadOpen(true);
      params.delete('upload');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    const fileId = params.get('file');
    if (!fileId) return;
    fileAPI.get(fileId).then(setPreview).catch((error) => toast.error(error.message || 'Could not open file.'));
  }, [params, toast]);

  const rows = files.data || [];
  const totalSize = rows.reduce((sum, f) => sum + f.size, 0);
  const filtersActive = Boolean(query || type !== 'all' || projectId);

  const explain = async (file) => {
    setPreview(null);
    setAi({ open: true, loading: true, result: null, title: `Explaining ${file.name}` });
    try {
      const res = await geminiAPI.explainCode({ fileId: file._id });
      setAi({ open: true, loading: false, result: res.content, title: `Explaining ${file.name}` });
    } catch (error) {
      setAi({ open: false, loading: false, result: null, title: '' });
      toast.error(error.message || 'AI could not explain this file.');
    }
  };

  const previewFile = async (file) => {
    setPreview(await fileAPI.get(file._id));
  };

  const downloadFile = async (file) => {
    const { url } = await fileAPI.download(file._id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Files"
        description="Source files, schemas and documents from every project you can see."
        actions={
          <Button variant="primary" icon="upload" onClick={() => setUploadOpen(true)}>
            Upload file
          </Button>
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          setUploadOpen(true);
        }}
        onClick={() => setUploadOpen(true)}
        className={cn(
          'mb-5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 transition-colors cs-grid',
          dragging ? 'border-accent bg-accentSoft' : 'border-line hover:border-lineStrong'
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-faint">
          <Icon name="upload" size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium text-ink">Drop files anywhere on this panel</span>
          <span className="block text-[12.5px] text-muted">Code, markdown, images and PDFs up to 25 MB each</span>
        </span>
        <Icon name="plus" size={16} className="text-faint" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <Input icon="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search filenames" />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-auto min-w-[150px]"
            options={[{ value: '', label: 'All projects' }, ...(projects.data || []).map((p) => ({ value: p._id, label: p.name }))]}
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-auto min-w-[140px] sm:ml-auto"
            options={[
              { value: 'recent', label: 'Newest first' },
              { value: 'name', label: 'Name A–Z' },
              { value: 'size', label: 'Largest first' },
            ]}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors',
              type === t ? 'border-accent bg-accentSoft text-accent' : 'border-line text-muted hover:text-ink'
            )}
          >
            {t === 'all' ? 'All types' : FILE_TYPE_META[t].label}
          </button>
        ))}
      </div>

      {files.error && <ErrorState onRetry={files.refetch} />}

      <Card className="overflow-hidden">
        {files.loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

        {!files.loading && !files.error && rows.length === 0 && (
          <EmptyState
            className="border-0"
            icon={filtersActive ? 'search' : 'upload'}
            title={filtersActive ? 'No files match those filters' : 'Upload your first file'}
            description={
              filtersActive
                ? 'Try a different filename, or clear the type filter.'
                : 'Drop in the code, schemas and documents this project depends on.'
            }
            action={
              filtersActive ? (
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={() => {
                    setQuery('');
                    setType('all');
                    setProjectId('');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button variant="primary" icon="upload" onClick={() => setUploadOpen(true)}>
                  Upload file
                </Button>
              )
            }
          />
        )}

        {!files.loading &&
          rows.map((file) => (
            <FileRow
              key={file._id}
              file={file}
              onPreview={previewFile}
              onDelete={setDeleting}
              onExplain={explain}
              onDownload={downloadFile}
            />
          ))}
      </Card>

      {!files.loading && rows.length > 0 && (
        <p className="mt-4 text-[12.5px] text-faint">
          {rows.length} file{rows.length === 1 ? '' : 's'} · {formatBytes(totalSize)} total
        </p>
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projects={projects.data || []}
        onUpload={async (payload) => {
          await fileAPI.upload(payload);
          toast.success('File uploaded');
          files.refetch();
        }}
      />

      <FilePreviewModal
        open={Boolean(preview)}
        file={preview}
        onClose={() => setPreview(null)}
        onExplain={explain}
        onDownload={downloadFile}
      />

      <AIResultModal
        open={ai.open}
        loading={ai.loading}
        result={ai.result}
        title={ai.title}
        subtitle="Explanation generated from the file contents"
        onRegenerate={() => {}}
        onClose={() => setAi({ open: false, loading: false, result: null, title: '' })}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        message="The file is removed for everyone on the project."
        confirmLabel="Delete file"
        onConfirm={async () => {
          await fileAPI.remove(deleting._id);
          toast.success('File deleted');
          files.refetch();
        }}
      />
    </AppLayout>
  );
}
