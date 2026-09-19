/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--c-base)',
        modal: 'var(--c-modal)',
        surface: 'var(--c-surface)',
        raised: 'var(--c-raised)',
        line: 'var(--c-line)',
        lineStrong: 'var(--c-line-strong)',
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        faint: 'var(--c-faint)',
        accent: 'var(--c-accent)',
        accentSoft: 'var(--c-accent-soft)',
        violet: 'var(--c-violet)',
        ai: 'var(--c-ai)',
        ok: 'var(--c-ok)',
        warn: 'var(--c-warn)',
        danger: 'var(--c-danger)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { xl: '14px', '2xl': '20px', '3xl': '26px' },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.18), 0 8px 24px -12px rgba(0,0,0,.35)',
        lift: '0 18px 40px -20px rgba(4,2,10,.8)',
        glow: '0 0 0 1px var(--c-accent-soft), 0 16px 44px -16px var(--c-accent), 0 16px 44px -16px var(--c-violet)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in': { from: { opacity: 0, transform: 'translateY(6px) scale(.985)' }, to: { opacity: 1, transform: 'none' } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        'slide-in-right': { from: { opacity: 0, transform: 'translateX(14px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-dot': { '0%,100%': { opacity: 0.35 }, '50%': { opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out both',
        'scale-in': 'scale-in .16s cubic-bezier(.2,.8,.3,1) both',
        'slide-up': 'slide-up .28s cubic-bezier(.2,.8,.3,1) both',
        'slide-in-right': 'slide-in-right .22s cubic-bezier(.2,.8,.3,1) both',
        'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
