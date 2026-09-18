/** Display helpers shared across the app. Pure functions, no React. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(value, opts = {}) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const base = `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  if (!opts.withTime) return base;
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${base} · ${((h + 11) % 12) + 1}:${m} ${suffix}`;
}

export function timeAgo(value) {
  const d = value instanceof Date ? value : new Date(value);
  const seconds = Math.round((Date.now() - d.getTime()) / 1000);
  if (Number.isNaN(seconds)) return '—';
  if (seconds < 45) return 'just now';
  const steps = [
    [60, 'minute', 60],
    [3600, 'hour', 3600],
    [86400, 'day', 86400],
    [604800, 'week', 604800],
    [2629800, 'month', 2629800],
  ];
  for (const [limit, label, div] of steps) {
    if (seconds < limit * 60 && seconds >= limit) {
      const n = Math.floor(seconds / div);
      return `${n} ${label}${n > 1 ? 's' : ''} ago`;
    }
  }
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2629800) return `${Math.floor(seconds / 604800)} weeks ago`;
  const months = Math.floor(seconds / 2629800);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function formatNumber(n) {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Deterministic colour pick so an avatar keeps the same tint everywhere. */
export function avatarTint(seed = '') {
  const tints = ['#6e8bff', '#a177ff', '#39c5bb', '#ffb86b', '#f472b6', '#4ade80'];
  let sum = 0;
  for (let i = 0; i < seed.length; i += 1) sum += seed.charCodeAt(i);
  return tints[sum % tints.length];
}

export function pluralize(n, word, plural) {
  return `${n} ${n === 1 ? word : plural || `${word}s`}`;
}
