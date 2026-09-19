import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Icon } from './Icon.jsx';
import { Spinner } from './Spinner.jsx';

const VARIANTS = {
  primary:
    'cs-gradient-fill text-white border border-transparent hover:brightness-110 hover:-translate-y-px active:translate-y-0 active:brightness-95 shadow-[0_8px_24px_-10px_var(--c-accent)] hover:shadow-[0_12px_32px_-10px_var(--c-violet)]',
  secondary:
    'bg-raised text-ink border border-line hover:border-lineStrong hover:bg-surface hover:-translate-y-px',
  ghost: 'bg-transparent text-muted border border-transparent hover:text-ink hover:bg-raised',
  outline: 'bg-transparent text-ink border border-lineStrong hover:bg-raised hover:border-[var(--c-accent)]',
  danger: 'bg-danger text-white border border-transparent hover:brightness-110',
  /* Reserved for anything the assistant does, so AI actions are recognisable. */
  ai: 'text-ink border border-line bg-raised hover:border-lineStrong relative overflow-hidden',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
};

export function Button({
  as,
  to,
  href,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium select-none whitespace-nowrap',
    'transition-[transform,background-color,border-color,filter,box-shadow] duration-150',
    'active:translate-y-px disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  );

  const inner = (
    <>
      {variant === 'ai' && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px cs-hairline-ai" />
      )}
      {isLoading ? <Spinner size={size === 'sm' ? 13 : 15} /> : icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && !isLoading && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {inner}
      </a>
    );
  }

  const Tag = as || 'button';
  return (
    <Tag className={classes} disabled={disabled || isLoading} {...props}>
      {inner}
    </Tag>
  );
}

export function IconButton({ icon, label, size = 'md', variant = 'ghost', className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        variant === 'ghost' && 'text-muted hover:text-ink hover:bg-raised',
        variant === 'outline' && 'text-muted border border-line hover:text-ink hover:border-lineStrong',
        variant === 'danger' && 'text-danger hover:bg-raised',
        className
      )}
      {...props}
    >
      <Icon name={icon} size={size === 'sm' ? 15 : 17} />
    </button>
  );
}
