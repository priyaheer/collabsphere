import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';
import { Logo } from '../common/Logo.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/projects', label: 'My projects', icon: 'folder' },
      { to: '/shared', label: 'Shared with me', icon: 'share' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/notes', label: 'Notes', icon: 'note' },
      { to: '/files', label: 'Files', icon: 'files' },
      { to: '/readme', label: 'README generator', icon: 'book' },
    ],
  },
  {
    label: 'Insight',
    items: [
      { to: '/ai', label: 'AI assistant', icon: 'sparkles', accent: true },
      { to: '/analytics', label: 'Analytics', icon: 'chart' },
      { to: '/team', label: 'Team', icon: 'users' },
    ],
  },
];

const BOTTOM_ITEMS = [
  { to: '/notifications', label: 'Notifications', icon: 'bell' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

function NavItem({ item, collapsed, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13.5px] font-medium transition-all duration-200',
          collapsed && 'justify-center px-0',
          isActive
            ? 'cs-gradient-fill text-white shadow-[0_8px_20px_-8px_var(--c-accent)]'
            : 'text-muted hover:bg-raised hover:text-ink hover:translate-x-0.5'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            name={item.icon}
            size={17}
            className={cn('shrink-0', item.accent && !isActive && 'text-ai')}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && item.badge ? (
            <span className="ml-auto rounded-md bg-accentSoft px-1.5 py-0.5 text-[11px] font-semibold text-accent">
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ collapsed = false, onToggle, onNavigate, unread = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const bottom = BOTTOM_ITEMS.map((i) =>
    i.to === '/notifications' && unread ? { ...i, badge: unread } : i
  );

  return (
    <aside
      className={cn(
        'cs-surface m-3 flex h-[calc(100%-24px)] flex-col rounded-2xl transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-[248px]'
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-line px-4', collapsed && 'justify-center px-0')}>
        <NavLink to="/dashboard" className="flex items-center" onClick={onNavigate}>
          <Logo showWord={!collapsed} size={26} />
        </NavLink>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-1.5 px-2.5 text-[11.5px] font-medium text-faint">{section.label}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-line px-3 py-3">
        {bottom.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>

      <div className={cn('flex items-center gap-2.5 border-t border-line p-3', collapsed && 'justify-center')}>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-left transition-colors hover:bg-raised"
        >
          <Avatar user={user} size="sm" />
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">{user?.name}</span>
              <span className="block truncate text-[11.5px] text-faint">@{user?.username}</span>
            </span>
          )}
        </button>
        {!collapsed && (
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-2 text-faint transition-colors hover:bg-raised hover:text-ink"
          >
            <Icon name="logout" size={16} />
          </button>
        )}
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="hidden items-center justify-center gap-2 border-t border-line py-2.5 text-[12.5px] text-faint transition-colors hover:text-ink lg:flex"
        >
          <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={14} />
          {!collapsed && 'Collapse'}
        </button>
      )}
    </aside>
  );
}
