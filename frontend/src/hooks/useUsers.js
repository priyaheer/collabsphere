import { useEffect, useMemo, useState } from 'react';
import { userAPI } from '../services/api.js';

/**
 * The directory is small and read-mostly, so it is fetched once and shared.
 * Swap the cache for a query library later without touching callers.
 */
let cache = null;
let inflight = null;

export function useUsers() {
  const [users, setUsers] = useState(cache || []);

  useEffect(() => {
    if (cache) return;
    inflight = inflight || userAPI.list();
    let active = true;
    inflight.then((rows) => {
      cache = rows;
      if (active) setUsers(rows);
    });
    // eslint-disable-next-line consistent-return
    return () => {
      active = false;
    };
  }, []);

  const byId = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u._id] = u;
    });
    return map;
  }, [users]);

  return { users, byId, getUser: (id) => byId[id] };
}
