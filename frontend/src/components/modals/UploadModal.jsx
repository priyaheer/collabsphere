import React, { useRef, useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';
import { Select } from '../common/Input.jsx';
import { ProgressBar } from '../common/ProgressBar.jsx';
import { cn } from '../../utils/cn.js';
import { formatBytes } from '../../utils/format.js';
import { detectFileType } from '../../services/api.js';
import { FileIcon } from '../cards/FileRow.jsx';

export function UploadModal({ open, onClose, onUpload, projects = [], defaultProjectId }) {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState([]);
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?._id || '');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const items = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      name: file.name,
      size: file.size,
      type: detectFileType(file.name),
      progress: 0,
    }));
    setQueue((q) => [...q, ...items]);
  };

  const start = async () => {
    setUploading(true);
    try {
      for (const item of queue) {
        // eslint-disable-next-line no-await-in-loop
        await onUpload({
          file: item.file,
          projectId,
          onProgress: (p) =>
            setQueue((q) => q.map((entry) => (entry.id === item.id ? { ...entry, progress: p } : entry))),
        });
      }
      setQueue([]);
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload files"
      description="Code, documentation, images and PDFs up to 25 MB each."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" icon="upload" onClick={start} disabled={!queue.length || !projectId} isLoading={uploading}>
            Upload {queue.length ? `${queue.length} file${queue.length > 1 ? 's' : ''}` : ''}
          </Button>
        </>
      }
    >
      {projects.length > 0 && (
        <div className="mb-4">
          <label htmlFor="upload-project" className="mb-1.5 block text-[13px] font-medium text-muted">
            Destination project
          </label>
          <Select
            id="upload-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projects.map((p) => ({ value: p._id, label: p.name }))}
          />
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors cs-grid',
          dragging ? 'border-accent bg-accentSoft' : 'border-line hover:border-lineStrong'
        )}
      >
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-faint">
          <Icon name="upload" size={19} />
        </span>
        <p className="text-[14px] font-medium text-ink">Drop files here</p>
        <p className="mt-1 text-[13px] text-muted">or click to browse your computer</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {queue.length > 0 && (
        <ul className="mt-4 space-y-2">
          {queue.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border border-line p-2.5">
              <FileIcon type={item.type} size={15} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[12.5px] text-ink">{item.name}</p>
                <p className="text-[11.5px] text-faint tabular-nums">{formatBytes(item.size)}</p>
                {item.progress > 0 && <ProgressBar value={item.progress} height={3} className="mt-1.5" />}
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={() => setQueue((q) => q.filter((entry) => entry.id !== item.id))}
                  className="rounded-md p-1.5 text-faint transition-colors hover:text-danger"
                  aria-label={`Remove ${item.name}`}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
