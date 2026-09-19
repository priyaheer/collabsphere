import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../components/common/Icon.jsx';
import { cn } from '../utils/cn.js';

const ToastCtx = createContext(null);

const TONES = {
  success: { icon: 'checkCircle', color: 'var(--c-ok)' },
  error: { icon: 'alert', color: 'var(--c-danger)' },
  info: { icon: 'info', color: 'var(--c-accent)' },
  ai: { icon: 'sparkles', color: 'var(--c-ai)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, { tone = 'info', description, duration = 3800 } = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list, { id, message, description, tone }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (m, o) => push(m, { ...o, tone: 'success' }),
      error: (m, o) => push(m, { ...o, tone: 'error' }),
      info: (m, o) => push(m, { ...o, tone: 'info' }),
      ai: (m, o) => push(m, { ...o, tone: 'ai' }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((t) => {
            const tone = TONES[t.tone] || TONES.info;
            return (
              <div
                key={t.id}
                role="status"
                className={cn(
                  'cs-modal-panel pointer-events-auto flex animate-slide-in-right items-start gap-3 rounded-xl border border-line p-3.5 shadow-lift'
                )}
              >
                <Icon name={tone.icon} size={17} className="mt-px shrink-0" style={{ color: tone.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium leading-snug text-ink">{t.message}</p>
                  {t.description && <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="shrink-0 rounded-md p-1 text-faint transition-colors hover:text-ink"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
