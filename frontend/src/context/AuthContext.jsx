import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, getToken, setToken } from '../services/api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | anonymous

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!getToken()) {
        setStatus('anonymous');
        return;
      }
      try {
        const me = await authAPI.me();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) setStatus('anonymous');
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: me } = await authAPI.login(credentials);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: me } = await authAPI.register(payload);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const logout = useCallback(async () => {
    await authAPI.logout();
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, status, login, register, logout, updateUser]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
