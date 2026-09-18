import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Icon } from '../common/Icon.jsx';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: 'dashboard' },
  { to: '/projects', label: 'Projects', icon: 'folder' },
  { to: '/ai', label: 'Assistant', icon: 'sparkles' },
  { to: '/notes', label: 'Notes', icon: 'note' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line cs-glass pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors',
                isActive ? 'text-ink' : 'text-faint'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} size={19} className={isActive ? 'text-accent' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
