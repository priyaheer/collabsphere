import React from 'react';

/**
 * A single inline SVG icon set.
 * Keeping icons in the repo (instead of an icon package) means no extra
 * dependency, no tree-shaking surprises, and one place to adjust stroke weight.
 */
const P = (d) => <path d={d} />;

const ICONS = {
  dashboard: <>{P('M3 3h7v7H3z')}{P('M14 3h7v7h-7z')}{P('M14 14h7v7h-7z')}{P('M3 14h7v7H3z')}</>,
  folder: P('M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'),
  share: <>{P('M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8')}{P('M16 6l-4-4-4 4')}{P('M12 2v13')}</>,
  note: <>{P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z')}{P('M14 2v6h6')}{P('M16 13H8')}{P('M16 17H8')}{P('M10 9H8')}</>,
  file: <>{P('M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z')}{P('M13 2v7h7')}</>,
  files: <>{P('M12 2L2 7l10 5 10-5-10-5z')}{P('M2 17l10 5 10-5')}{P('M2 12l10 5 10-5')}</>,
  sparkles: <>{P('M12 3l1.8 4.5L18.3 9.3l-4.5 1.8L12 15.6l-1.8-4.5L5.7 9.3l4.5-1.8z')}{P('M18.5 14.5l.85 2.15L21.5 17.5l-2.15.85L18.5 20.5l-.85-2.15L15.5 17.5l2.15-.85z')}</>,
  chart: <>{P('M12 20V10')}{P('M18 20V4')}{P('M6 20v-4')}</>,
  users: <>{P('M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2')}<circle cx="9.5" cy="7" r="4" />{P('M22 21v-2a4 4 0 0 0-3-3.87')}{P('M16 3.13a4 4 0 0 1 0 7.75')}</>,
  bell: <>{P('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9')}{P('M13.73 21a2 2 0 0 1-3.46 0')}</>,
  settings: <>{P('M4 21v-7')}{P('M4 10V3')}{P('M12 21v-9')}{P('M12 8V3')}{P('M20 21v-5')}{P('M20 12V3')}{P('M1 14h6')}{P('M9 8h6')}{P('M17 16h6')}</>,
  search: <><circle cx="11" cy="11" r="7.5" />{P('M21 21l-4.6-4.6')}</>,
  plus: <>{P('M12 5v14')}{P('M5 12h14')}</>,
  minus: P('M5 12h14'),
  chevronDown: P('M6 9l6 6 6-6'),
  chevronRight: P('M9 18l6-6-6-6'),
  chevronLeft: P('M15 18l-6-6 6-6'),
  chevronUp: P('M18 15l-6-6-6 6'),
  x: <>{P('M18 6L6 18')}{P('M6 6l12 12')}</>,
  check: P('M20 6L9 17l-5-5'),
  trash: <>{P('M3 6h18')}{P('M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2')}{P('M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6')}</>,
  edit: <>{P('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7')}{P('M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z')}</>,
  eye: <>{P('M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z')}<circle cx="12" cy="12" r="3" /></>,
  eyeOff: <>{P('M17.94 17.94A10.07 10.07 0 0 1 12 19.5c-6.5 0-10.5-7.5-10.5-7.5a18.45 18.45 0 0 1 5.06-5.94')}{P('M9.9 4.74A9.12 9.12 0 0 1 12 4.5c6.5 0 10.5 7.5 10.5 7.5a18.5 18.5 0 0 1-2.16 3.19')}{P('M14.12 14.12a3 3 0 1 1-4.24-4.24')}{P('M2 2l20 20')}</>,
  download: <>{P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4')}{P('M7 10l5 5 5-5')}{P('M12 15V3')}</>,
  upload: <>{P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4')}{P('M17 8l-5-5-5 5')}{P('M12 3v12')}</>,
  copy: <>{P('M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z')}{P('M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1')}</>,
  logout: <>{P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4')}{P('M16 17l5-5-5-5')}{P('M21 12H9')}</>,
  moon: P('M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'),
  sun: <><circle cx="12" cy="12" r="4.5" />{P('M12 1.5v2')}{P('M12 20.5v2')}{P('M4.2 4.2l1.4 1.4')}{P('M18.4 18.4l1.4 1.4')}{P('M1.5 12h2')}{P('M20.5 12h2')}{P('M4.2 19.8l1.4-1.4')}{P('M18.4 5.6l1.4-1.4')}</>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" />{P('M8 21h8')}{P('M12 17v4')}</>,
  menu: <>{P('M3 12h18')}{P('M3 6h18')}{P('M3 18h18')}</>,
  more: <><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /><circle cx="5" cy="12" r="1.4" /></>,
  star: P('M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4 7.3 13.93 2.6 9.35l6.5-.95z'),
  lock: <><rect x="3" y="11" width="18" height="10.5" rx="2" />{P('M7.5 11V7a4.5 4.5 0 0 1 9 0v4')}</>,
  globe: <><circle cx="12" cy="12" r="9.5" />{P('M2.5 12h19')}{P('M12 2.5a15 15 0 0 1 4 9.5 15 15 0 0 1-4 9.5 15 15 0 0 1-4-9.5 15 15 0 0 1 4-9.5z')}</>,
  arrowRight: <>{P('M5 12h14')}{P('M12 5l7 7-7 7')}</>,
  arrowLeft: <>{P('M19 12H5')}{P('M12 19l-7-7 7-7')}</>,
  arrowUpRight: <>{P('M7 17L17 7')}{P('M8 7h9v9')}</>,
  arrowDownRight: <>{P('M7 7l10 10')}{P('M17 8v9H8')}</>,
  refresh: <>{P('M22 4v6h-6')}{P('M2 20v-6h6')}{P('M4.5 9a8 8 0 0 1 13.2-3L22 10')}{P('M2 14l4.3 4A8 8 0 0 0 19.5 15')}</>,
  send: <>{P('M22 2L11 13')}{P('M22 2l-7 20-4-9-9-4z')}</>,
  code: <>{P('M16 18l6-6-6-6')}{P('M8 6l-6 6 6 6')}</>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />{P('M21 15l-5-5L5 21')}</>,
  filter: P('M22 3H2l8 9.46V19l4 2v-8.54z'),
  clock: <><circle cx="12" cy="12" r="9.5" />{P('M12 6.5V12l3.5 2')}</>,
  mail: <>{P('M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z')}{P('M22 6l-10 7L2 6')}</>,
  github: P('M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'),
  alert: <><circle cx="12" cy="12" r="9.5" />{P('M12 7.5v5')}{P('M12 16.2h.01')}</>,
  checkCircle: <>{P('M21.5 11.1V12a9.5 9.5 0 1 1-5.6-8.68')}{P('M22 4.5L12 14.5l-3-3')}</>,
  info: <><circle cx="12" cy="12" r="9.5" />{P('M12 16v-4.5')}{P('M12 8h.01')}</>,
  externalLink: <>{P('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')}{P('M15 3h6v6')}{P('M10 14L21 3')}</>,
  zap: P('M13 2L3 14h9l-1 8 10-12h-9z'),
  book: <>{P('M4 19.5A2.5 2.5 0 0 1 6.5 17H20')}{P('M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z')}</>,
  terminal: <>{P('M4 17l6-6-6-6')}{P('M12 19h8')}</>,
  shield: P('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
  user: <>{P('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2')}<circle cx="12" cy="7" r="4" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" />{P('M16 2.5v4')}{P('M8 2.5v4')}{P('M3 10.5h18')}</>,
  tag: <>{P('M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z')}<circle cx="7" cy="7" r="1.2" /></>,
  message: P('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'),
  panelLeft: <><rect x="3" y="3" width="18" height="18" rx="2" />{P('M9.5 3v18')}</>,
  maximize: <>{P('M8 3H5a2 2 0 0 0-2 2v3')}{P('M21 8V5a2 2 0 0 0-2-2h-3')}{P('M16 21h3a2 2 0 0 0 2-2v-3')}{P('M3 16v3a2 2 0 0 0 2 2h3')}</>,
  minimize: <>{P('M8 3v3a2 2 0 0 1-2 2H3')}{P('M21 8h-3a2 2 0 0 1-2-2V3')}{P('M3 16h3a2 2 0 0 1 2 2v3')}{P('M16 21v-3a2 2 0 0 1 2-2h3')}</>,
  list: <>{P('M8 6h13')}{P('M8 12h13')}{P('M8 18h13')}{P('M3.5 6h.01')}{P('M3.5 12h.01')}{P('M3.5 18h.01')}</>,
  grid: <>{P('M3 3h7v7H3z')}{P('M14 3h7v7h-7z')}{P('M14 14h7v7h-7z')}{P('M3 14h7v7H3z')}</>,
  link: <>{P('M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7')}{P('M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7')}</>,
  play: P('M6 3.5l13 8.5-13 8.5z'),
  inbox: <>{P('M22 12h-6l-2 3h-4l-2-3H2')}{P('M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z')}</>,
  trendingUp: <>{P('M23 6l-9.5 9.5-5-5L1 18')}{P('M17 6h6v6')}</>,
  branch: <>{P('M6 4v12')}<circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />{P('M18 9a9 9 0 0 1-9 9')}</>,
  cpu: <><rect x="4.5" y="4.5" width="15" height="15" rx="2.5" /><rect x="9" y="9" width="6" height="6" rx="1" />{P('M9 1.5v3')}{P('M15 1.5v3')}{P('M9 19.5v3')}{P('M15 19.5v3')}{P('M19.5 9h3')}{P('M19.5 15h3')}{P('M1.5 9h3')}{P('M1.5 15h3')}</>,
  bold: <>{P('M6 4h8a4 4 0 0 1 0 8H6z')}{P('M6 12h9a4 4 0 0 1 0 8H6z')}</>,
  italic: <>{P('M19 4h-9')}{P('M14 20H5')}{P('M15 4L9 20')}</>,
  heading: <>{P('M6 4v16')}{P('M18 4v16')}{P('M6 12h12')}</>,
  quote: <>{P('M3 21c3 0 7-1 7-8V5H3v7h4c0 4-1 5-4 5z')}{P('M14 21c3 0 7-1 7-8V5h-7v7h4c0 4-1 5-4 5z')}</>,
  table: <><rect x="3" y="3" width="18" height="18" rx="2" />{P('M3 9h18')}{P('M3 15h18')}{P('M9 3v18')}</>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" />{P('M10.8 12.2L21 2')}{P('M17 6l3 3')}</>,
  helpCircle: <><circle cx="12" cy="12" r="9.5" />{P('M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7')}{P('M12 17h.01')}</>,
};

export function Icon({ name, size = 18, className = '', strokeWidth = 1.75, filled = false, ...rest }) {
  const glyph = ICONS[name];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  );
}

export const iconNames = Object.keys(ICONS);
