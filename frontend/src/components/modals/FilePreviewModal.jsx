import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';
import { CodeBlock } from '../common/CodeBlock.jsx';
import { formatBytes, formatDate } from '../../utils/format.js';
import { CODE_TYPES, FILE_TYPE_META } from '../cards/FileRow.jsx';

export function FilePreviewModal({ open, onClose, file, onExplain, onDownload }) {
  if (!file) return null;
  const meta = FILE_TYPE_META[file.type] || FILE_TYPE_META.other;
  const isCode = CODE_TYPES.includes(file.type) && file.content;
  const isImage = file.preview?.kind === 'image' || file.type === 'image';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={file.name}
      description={`${meta.label} · ${formatBytes(file.size)} · uploaded ${formatDate(file.uploadedAt)}`}
      footer={
        <>
          {isCode && (
            <Button variant="ai" icon="sparkles" onClick={() => onExplain?.(file)}>
              Explain code
            </Button>
          )}
          <Button variant="secondary" icon="download" onClick={() => onDownload?.(file)}>
            Download
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      {isCode ? (
        <CodeBlock code={file.content} filename={file.name} language={file.type} maxHeight={460} />
      ) : isImage ? (
        <div className="overflow-hidden rounded-xl border border-line bg-base">
          <img src={file.rawUrl} alt={file.name} className="max-h-[520px] w-full object-contain" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-16 text-center cs-grid">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface" style={{ color: meta.color }}>
            <Icon name={meta.icon} size={20} />
          </span>
          <p className="text-[14px] font-medium text-ink">No inline preview for {meta.label.toLowerCase()} files</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            Download the file to open it locally.
          </p>
        </div>
      )}
    </Modal>
  );
}
