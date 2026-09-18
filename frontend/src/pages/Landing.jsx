import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn.js';
import { Icon } from '../components/common/Icon.jsx';
import { Logo, LogoMark } from '../components/common/Logo.jsx';
import { Button } from '../components/common/Button.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  AI_CAPABILITIES,
  FEATURES,
  FOOTER_LINKS,
  HOW_STEPS,
  LANDING_STATS,
  PLANS,
  TESTIMONIALS,
} from '../data/landingContent.js';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'AI', href: '#ai' },
  { label: 'Collaboration', href: '#collaboration' },
  { label: 'Pricing', href: '#pricing' },
];

function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-line cs-glass' : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5">
        <Link to="/" aria-label="CollabSphere home">
          <Logo size={26} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-lg px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Switch theme"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink sm:flex"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
          <Link to="/login" className="hidden px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-ink sm:block">
            Log in
          </Link>
          <Button to="/register" variant="primary" size="sm">
            Get started
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted md:hidden"
          >
            <Icon name={open ? 'x' : 'menu'} size={19} />
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-slide-up border-t border-line bg-surface px-5 py-3 md:hidden">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[14px] text-muted"
            >
              {l.label}
            </a>
          ))}
          <Link to="/login" className="block rounded-lg px-3 py-2.5 text-[14px] text-muted">
            Log in
          </Link>
        </div>
      )}
    </header>
  );
}

/* The hero's memorable moment: a real-looking workspace, built from divs. */
function HeroPreview() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-16 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(45% 45% at 60% 35%, var(--c-accent-soft), transparent 70%), radial-gradient(40% 40% at 30% 70%, rgba(161,119,255,.14), transparent 70%)',
        }}
      />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="flex gap-1.5">
            {['#ff6b6b', '#fbbf24', '#4ade80'].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c, opacity: 0.65 }} />
            ))}
          </span>
          <span className="ml-2 rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-faint">
            collabsphere.dev/projects/atlas-api-gateway
          </span>
        </div>

        <div className="flex">
          <div className="hidden w-[140px] shrink-0 flex-col gap-1 border-r border-line p-3 sm:flex">
            {[
              { icon: 'dashboard', label: 'Dashboard' },
              { icon: 'folder', label: 'Projects', active: true },
              { icon: 'note', label: 'Notes' },
              { icon: 'files', label: 'Files' },
              { icon: 'sparkles', label: 'Assistant' },
              { icon: 'chart', label: 'Analytics' },
            ].map((item) => (
              <span
                key={item.label}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-[11.5px]',
                  item.active ? 'bg-raised text-ink' : 'text-faint'
                )}
              >
                <Icon name={item.icon} size={13} />
                {item.label}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-[15px] font-semibold text-ink">Atlas API Gateway</p>
                <p className="mt-0.5 text-[11.5px] text-faint">3 members · updated 4 hours ago</p>
              </div>
              <span className="rounded-md border border-line px-2 py-1 text-[11px] text-ai">
                README generated
              </span>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {[
                { label: 'Notes', value: '14' },
                { label: 'Files', value: '23' },
                { label: 'Progress', value: '72%' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-line p-2.5">
                  <p className="text-[10.5px] text-faint">{s.label}</p>
                  <p className="mt-1 font-display text-[18px] font-semibold text-ink tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-line">
              <div className="flex items-center gap-2 border-b border-line px-3 py-2">
                <Icon name="code" size={12} className="text-faint" />
                <span className="font-mono text-[11px] text-muted">rateLimiter.js</span>
                <span className="ml-auto flex items-center gap-1 text-[10.5px] text-ai">
                  <Icon name="sparkles" size={11} />
                  Explain
                </span>
              </div>
              <pre className="overflow-hidden p-3 font-mono text-[10.5px] leading-[1.7] text-muted">
{`const count = await redis.incr(key);
if (count === 1) await redis.pexpire(key, WINDOW_MS);
return { allowed: count <= limit };`}
              </pre>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-line px-3 py-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-ai">
                <Icon name="sparkles" size={12} />
              </span>
              <p className="truncate text-[11.5px] text-muted">
                Two round trips leave the key without a TTL if the process dies…
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, body, align = 'left' }) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <p className="mb-2.5 text-[13px] font-medium text-accent">{eyebrow}</p>}
      <h2 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink sm:text-[36px]">
        {title}
      </h2>
      {body && <p className="mt-4 text-[15px] leading-relaxed text-muted">{body}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-base">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 cs-grid opacity-70" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{ background: 'radial-gradient(60% 100% at 50% 0%, var(--c-accent-soft), transparent 70%)' }}
        />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:pb-24">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              Code explanation and README drafts now in every project
            </span>

            <h1 className="mt-6 font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[56px]">
              Your project documents itself
              <span className="block text-muted">while you build it</span>
            </h1>

            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-muted">
              CollabSphere keeps projects, markdown docs, files and people in one workspace, with an assistant
              that explains code and writes the README you keep postponing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/register" variant="primary" size="lg" icon="arrowRight">
                Get started
              </Button>
              <Button to="/public/project/p_002" variant="outline" size="lg" icon="play">
                View demo
              </Button>
            </div>

            <p className="mt-5 flex items-center gap-2 text-[12.5px] text-faint">
              <Icon name="check" size={13} className="text-ok" />
              Free for solo work. No card required.
            </p>
          </div>

          <div className="animate-slide-up lg:-mr-10" style={{ animationDelay: '120ms' }}>
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-line py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading
            eyebrow="What you get"
            title="Everything a project needs to stay understandable"
            body="Six things engineers do every week, kept in one place instead of four."
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="group bg-surface p-6 transition-colors hover:bg-raised">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors group-hover:text-accent">
                  <Icon name={feature.icon} size={18} />
                </span>
                <h3 className="mt-5 font-display text-[16px] font-semibold tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, so it is numbered */}
      <section className="border-b border-line py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading eyebrow="How it works" title="Four steps from empty workspace to a public doc page" />

          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((step, i) => (
              <li key={step.title} className="relative border-t border-line pt-5">
                <span className="absolute -top-px left-0 h-px w-10 bg-accent" />
                <span className="font-mono text-[12px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display text-[16px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="relative border-b border-line py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="The assistant"
              title="It reads the project, not just your prompt"
              body="Point it at a project, a note or a single file. Answers come back grounded in what is actually there, and nothing is saved until you accept it."
            />
            <ul className="mt-8 space-y-3">
              {AI_CAPABILITIES.map((cap) => (
                <li key={cap.label} className="flex gap-3">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-ai" />
                  <span>
                    <span className="text-[14px] font-medium text-ink">{cap.label}</span>
                    <span className="ml-2 text-[13.5px] text-muted">{cap.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
            <span className="absolute inset-x-0 top-0 h-px cs-hairline-ai" />
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <Icon name="sparkles" size={15} className="text-ai" />
              <span className="text-[13px] text-muted">Context</span>
              <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[11.5px] text-ink">
                rateLimiter.js
              </span>
            </div>
            <div className="space-y-4 p-5">
              <p className="ml-auto w-fit max-w-[80%] rounded-xl border border-line bg-raised px-3.5 py-2.5 text-[13.5px] text-ink">
                Find possible issues in this file.
              </p>
              <div className="rounded-xl border border-line p-4">
                <p className="text-[13.5px] leading-relaxed text-muted">
                  Three things worth fixing, ordered by blast radius.
                </p>
                <ol className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-muted">
                  <li>
                    <span className="font-medium text-ink">No fail-open path</span> — if Redis is unreachable every
                    request throws and the gateway returns 500.
                  </li>
                  <li>
                    <span className="font-medium text-ink">Non-atomic expiry</span> — a crash between{' '}
                    <code className="rounded bg-accentSoft px-1 font-mono text-[12px] text-ink">INCR</code> and{' '}
                    <code className="rounded bg-accentSoft px-1 font-mono text-[12px] text-ink">PEXPIRE</code> leaves a
                    key without a TTL.
                  </li>
                  <li>
                    <span className="font-medium text-ink">Boundary bursts</span> — a client can send twice the limit
                    across two adjacent windows.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration */}
      <section id="collaboration" className="border-b border-line py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 lg:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift lg:order-1">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-[13.5px] font-semibold text-ink">Members</span>
              <span className="rounded-md border border-line px-2 py-0.5 text-[11.5px] text-muted">3 people</span>
            </div>
            {[
              { name: 'Aarav Mehta', handle: 'aaravm', role: 'Owner', tint: '#6e8bff' },
              { name: 'Lena Fischer', handle: 'lenaf', role: 'Admin', tint: '#a177ff' },
              { name: 'Daniel Okafor', handle: 'danok', role: 'Member', tint: '#39c5bb' },
            ].map((m) => (
              <div key={m.handle} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                  style={{ background: `linear-gradient(140deg, ${m.tint}, ${m.tint}99)` }}
                >
                  {m.name.split(' ').map((p) => p[0]).join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-ink">{m.name}</span>
                  <span className="block text-[11.5px] text-faint">@{m.handle}</span>
                </span>
                <span className="rounded-md border border-line px-2 py-0.5 text-[11.5px] text-muted">{m.role}</span>
              </div>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Collaboration"
              title="Roles that match how teams actually work"
              body="Owners set direction, admins manage people and settings, members write and ship. Every change lands in an activity feed so nobody has to ask what moved."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: 'users', title: 'Shared with me', body: 'Projects you were added to sit in their own list.' },
                { icon: 'clock', title: 'Activity feed', body: 'Notes, uploads, joins and generated docs in one stream.' },
                { icon: 'globe', title: 'Public pages', body: 'Publish a read-only project page at a stable URL.' },
                { icon: 'chart', title: 'Contribution view', body: 'See who wrote what, without a performance ranking.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-line p-4">
                  <Icon name={item.icon} size={16} className="text-muted" />
                  <h3 className="mt-3 text-[14px] font-medium text-ink">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line py-14">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-[32px] font-semibold tracking-[-0.03em] text-ink tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1 text-[13px] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-line py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading eyebrow="In use" title="What teams say after a month" />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
                <blockquote className="flex-1 text-[14px] leading-relaxed text-ink">{t.quote}</blockquote>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <p className="text-[13.5px] font-medium text-ink">{t.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-line py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title="Priced per person, not per project"
            body="Billing is not wired up in this build — the plans below show the shape of it."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6',
                  plan.featured ? 'border-accent bg-surface shadow-glow' : 'border-line bg-surface'
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-0.5 text-[11.5px] font-medium text-white">
                    Most teams pick this
                  </span>
                )}
                <h3 className="font-display text-[17px] font-semibold text-ink">{plan.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{plan.summary}</p>
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-[34px] font-semibold tracking-[-0.03em] text-ink">
                    {plan.price}
                  </span>
                  <span className="text-[12.5px] text-faint">{plan.cadence}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] text-muted">
                      <Icon name="check" size={15} className="mt-0.5 shrink-0 text-ok" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  to="/register"
                  variant={plan.featured ? 'primary' : 'secondary'}
                  fullWidth
                  className="mt-6"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-b border-line py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 cs-grid opacity-60" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 80% at 50% 100%, var(--c-accent-soft), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-2xl px-5 text-center">
          <LogoMark size={40} className="mx-auto" />
          <h2 className="mt-6 font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[38px]">
            Start with one project you keep re-explaining
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            Create it, drop in the files, and let the assistant draft the README. Ten minutes, and the next person
            will not have to ask you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button to="/register" variant="primary" size="lg" icon="arrowRight">
              Create your workspace
            </Button>
            <Button to="/login" variant="ghost" size="lg">
              Log in
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <Logo size={26} />
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
                A collaboration workspace for engineering teams who would rather write documentation once.
              </p>
              <div className="mt-5 flex items-center gap-2">
                {['github', 'message', 'mail'].map((icon) => (
                  <a
                    key={icon}
                    href="#"
                    aria-label={icon}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-ink"
                  >
                    <Icon name={icon} size={16} />
                  </a>
                ))}
              </div>
            </div>

            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[13px] font-medium text-ink">{group.title}</h3>
                <ul className="mt-3.5 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-[13px] cs-link">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12.5px] text-faint">© {new Date().getFullYear()} CollabSphere. Frontend demo build.</p>
            <p className="text-[12.5px] text-faint">Mock data throughout — no backend is connected.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
