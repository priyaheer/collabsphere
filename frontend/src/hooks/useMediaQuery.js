import { useEffect, useState } from 'react';

/** Reactive media query — drives the sidebar/mobile-nav switch. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
}
