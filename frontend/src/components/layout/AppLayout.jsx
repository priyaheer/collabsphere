import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { MobileNav } from './MobileNav.jsx';
import { SearchOverlay } from './SearchOverlay.jsx';
import { cn } from '../../utils/cn.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * Application shell: fixed sidebar on desktop, drawer on mobile, bottom bar
 * on phones. Every authenticated page renders inside it.
 */
export function AppLayout({ children, fullBleed = false }) {
  const [collapsed, setCollapsed] = useLocalStorage('collabsphere.sidebarCollapsed', false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const isTablet = useMediaQuery('(max-width: 1279px)');

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleUnread = useCallback((n) => setUnread(n), []);
  const sidebarCollapsed = isTablet ? true : collapsed;

  return (
    <div className="flex min-h-screen bg-base">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={isTablet ? undefined : () => setCollapsed((c) => !c)}
          unread={unread}
        />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[110] md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative h-full w-[260px] animate-slide-in-right">
            <Sidebar collapsed={false} onNavigate={() => setDrawerOpen(false)} unread={unread} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenSidebar={() => setDrawerOpen(true)}
          onUnreadChange={handleUnread}
        />
        <main
          className={cn(
            'flex-1 animate-fade-in pb-20 md:pb-0',
            fullBleed ? '' : 'mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 lg:px-8 lg:py-8'
          )}
        >
          {children}
        </main>
        <MobileNav />
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
