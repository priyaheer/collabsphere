import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';

/**
 * Destructive confirmation. The action keeps its own verb, so the button that
 * says "Delete project" produces a toast that says "Project deleted".
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
}) {
  const [working, setWorking] = useState(false);

  const handleConfirm = async () => {
    setWorking(true);
    try {
      await onConfirm?.();
      onClose?.();
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={null}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={working}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} isLoading={working}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--c-raised)', color: tone === 'danger' ? 'var(--c-danger)' : 'var(--c-accent)' }}
        >
          <Icon name="alert" size={19} />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
          {message && <p className="mt-1.5 text-sm leading-relaxed text-muted">{message}</p>}
        </div>
      </div>
    </Modal>
  );
}
