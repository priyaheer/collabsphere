import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Dropdown } from '../common/Dropdown.jsx';
import { IconButton } from '../common/Button.jsx';
import { NotificationsMenu } from './NotificationsMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { notificationAPI } from '../../services/api.js';

export function Topbar({ onOpenSearch, onOpenSidebar, onUnreadChange }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationAPI.list().then(setNotifications);
  }, []);

  useEffect(() => {
    onUnreadChange?.(notifications.filter((n) => !n.read).length);
  }, [notifications, onUnreadChange]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line px-4 cs-glass md:px-6">
      <IconButton icon="menu" label="Open menu" className="md:hidden" onClick={onOpenSidebar} />

      <button
        type="button"
        onClick={onOpenSearch}
        className="group flex h-9 flex-1 items-center gap-2.5 rounded-lg border border-line bg-base px-3 text-left transition-colors hover:border-lineStrong md:max-w-sm"
      >
        <Icon name="search" size={15} className="text-faint" />
        <span className="flex-1 truncate text-[13px] text-faint">Search everything</span>
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-faint md:block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Dropdown
          align="right"
          width="w-52"
          trigger={
            <button
              type="button"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] text-ink transition-colors hover:border-lineStrong sm:flex"
            >
              <Icon name="plus" size={15} />
              Create
              <Icon name="chevronDown" size={13} className="text-faint" />
            </button>
          }
          items={[
            { label: 'New project', icon: 'folder', onClick: () => navigate('/projects?new=1') },
            { label: 'New note', icon: 'note', onClick: () => navigate('/notes/new') },
            { label: 'Upload file', icon: 'upload', onClick: () => navigate('/files?upload=1') },
            { divider: true },
            { label: 'Generate README', icon: 'book', onClick: () => navigate('/readme') },
            { label: 'Ask the assistant', icon: 'sparkles', onClick: () => navigate('/ai') },
          ]}
        />

        <IconButton
          icon={theme === 'dark' ? 'sun' : 'moon'}
          label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          onClick={toggleTheme}
        />

        <Dropdown
          align="right"
          width="w-auto"
          trigger={
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <Icon name="bell" size={17} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
              )}
            </button>
          }
        >
          <NotificationsMenu
            items={notifications}
            onMarkAll={() => notificationAPI.markAllRead().then(setNotifications)}
            onRead={(id) => notificationAPI.markRead(id).then(setNotifications)}
          />
        </Dropdown>

        <Dropdown
          align="right"
          header={
            <div className="flex items-center gap-2.5">
              <Avatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">{user?.name}</p>
                <p className="truncate text-[11.5px] text-faint">{user?.email}</p>
              </div>
            </div>
          }
          trigger={
            <button type="button" className="ml-1 rounded-full transition-transform hover:scale-105" aria-label="Account">
              <Avatar user={user} size="sm" />
            </button>
          }
          items={[
            { label: 'Your profile', icon: 'user', onClick: () => navigate('/profile') },
            { label: 'Settings', icon: 'settings', onClick: () => navigate('/settings') },
            { label: 'Analytics', icon: 'chart', onClick: () => navigate('/analytics') },
            { divider: true },
            { label: 'Sign out', icon: 'logout', tone: 'danger', onClick: logout },
          ]}
        />
      </div>
    </header>
  );
}

export function TopbarBrandLink() {
  return (
    <Link to="/dashboard" className="text-[13px] text-muted hover:text-ink">
      Back to workspace
    </Link>
  );
}
