/**
 * Tiny classname joiner. Falsy values are dropped so conditional classes
 * can be written inline without leaving stray spaces in the DOM.
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
