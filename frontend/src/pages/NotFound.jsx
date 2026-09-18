import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';

const SUGGESTIONS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/projects', label: 'Projects', icon: 'folder' },
  { to: '/notes', label: 'Notes', icon: 'note' },
  { to: '/ai', label: 'AI assistant', icon: 'sparkles' },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="absolute inset-0 cs-grid opacity-70" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(45% 45% at 50% 40%, var(--c-accent-soft), transparent 70%)' }}
      />

      <div className="relative">
        <Link to="/" className="inline-flex">
          <Logo size={28} />
        </Link>

        <p className="mt-12 font-mono text-[13px] text-faint">404</p>
        <h1 className="mt-3 font-display text-[34px] font-semibold tracking-[-0.03em] text-ink sm:text-[44px]">
          This page does not exist
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          The link may be out of date, or the project it pointed to was deleted or made private.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" icon="arrowLeft" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button variant="secondary" to="/dashboard">
            Open dashboard
          </Button>
        </div>

        <div className="mx-auto mt-12 max-w-md border-t border-line pt-8">
          <p className="mb-3 text-[12.5px] text-faint">Or jump to</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-muted transition-colors hover:border-lineStrong hover:text-ink"
              >
                <Icon name={s.icon} size={14} />
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
