import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo.jsx';
import { Icon } from '../common/Icon.jsx';

const HIGHLIGHTS = [
  'Markdown docs with a live preview',
  'Code explanation grounded in your files',
  'READMEs drafted from the project itself',
];

/** Shared frame for login, register and the password flows. */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/" className="inline-flex w-fit items-center">
          <Logo size={26} />
        </Link>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-7 text-center text-[13.5px] text-muted">{footer}</div>}
        </div>

        <p className="text-center text-[12px] text-faint lg:text-left">
          Frontend demo — authentication is mocked until the API is connected.
        </p>
      </div>

      <div className="relative hidden overflow-hidden border-l border-line lg:block">
        <div className="absolute inset-0 cs-grid" />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(60% 60% at 70% 20%, var(--c-accent-soft), transparent 70%)' }}
        />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md font-display text-[24px] font-medium leading-[1.35] tracking-[-0.02em] text-ink">
            “The README is generated from what is actually in the repo, so it stops drifting from the truth.”
          </blockquote>
          <p className="mt-5 text-[13.5px] text-muted">Ijeoma Nwosu · Engineering manager, Fieldwire</p>

          <ul className="mt-10 space-y-2.5 border-t border-line pt-8">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-[13.5px] text-muted">
                <Icon name="check" size={15} className="text-ok" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
