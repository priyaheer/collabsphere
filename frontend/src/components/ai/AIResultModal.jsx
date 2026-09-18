import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';
import { Spinner } from '../common/Spinner.jsx';
import { MarkdownPreview } from '../editor/MarkdownPreview.jsx';

/** One panel for every assistant result: explain, improve, document. */
export function AIResultModal({ open, onClose, title, subtitle, loading, result, onRegenerate, onApply, applyLabel = 'Apply to note' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={title}
      description={subtitle}
      footer={
        <>
          <Button variant="ghost" icon="refresh" onClick={onRegenerate} disabled={loading}>
            Regenerate
          </Button>
          <Button variant="secondary" icon={copied ? 'check' : 'copy'} onClick={copy} disabled={loading || !result}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {onApply && (
            <Button variant="primary" icon="check" onClick={() => onApply(result)} disabled={loading || !result}>
              {applyLabel}
            </Button>
          )}
        </>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <Spinner size={22} className="text-ai" />
          <p className="text-[13.5px] text-muted">Working through the content…</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2 text-[12px] text-muted">
            <Icon name="info" size={13} className="shrink-0 text-faint" />
            Generated from a mock response. Connect <span className="font-mono text-ink">/ai/*</span> to switch it live.
          </div>
          <MarkdownPreview source={result || ''} />
        </>
      )}
    </Modal>
  );
}
