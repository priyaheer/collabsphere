import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async service call and exposes the four states every screen needs:
 * loading, data, error and a manual refetch.
 */
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const mounted = useRef(true);
  const callback = useRef(fn);
  callback.current = fn;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callback.current(...args);
      if (mounted.current) setData(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(err);
      return undefined;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, refetch: run, setData };
}
