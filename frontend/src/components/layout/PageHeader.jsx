import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';

export function PageHeader({ title, description, actions, breadcrumbs = [], className = '' }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1.5 text-[12.5px] text-faint">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                {i > 0 && <Icon name="chevronRight" size={12} />}
                {crumb.to ? (
                  <Link to={crumb.to} className="transition-colors hover:text-ink">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-muted">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[30px]">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
