import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'collabsphere.theme';
const ThemeCtx = createContext(null);

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : true;
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readStoredTheme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
    try {
      localStorage.setItem(THEME_KEY, preference);
    } catch {
      /* storage unavailable — theme lasts for this session only */
    }
  }, [preference, resolved]);

  const value = useMemo(
    () => ({
      preference,
      theme: resolved,
      setTheme: setPreference,
      toggleTheme: () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
    }),
    [preference, resolved]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
