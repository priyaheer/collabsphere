/**
 * Mock data set.
 * Everything here is fake but shaped exactly like the documents a
 * Node + Express + MongoDB backend would return, so swapping the service
 * layer over later touches no component.
 */

const now = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

export const hoursAgo = (n) => new Date(now - n * HOUR).toISOString();
export const daysAgo = (n) => new Date(now - n * DAY).toISOString();

export const USERS = [
  {
    _id: 'u_001',
    name: 'Aarav Mehta',
    username: 'aaravm',
    email: 'aarav@collabsphere.dev',
    avatar: null,
    role: 'Owner',
    bio: 'Platform engineer. I like small APIs, fast builds and documentation that stays true.',
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Kubernetes', 'Go'],
    location: 'Bengaluru, IN',
    website: 'https://aarav.dev',
    joinedAt: daysAgo(612),
    lastActive: hoursAgo(1),
  },
  {
    _id: 'u_002',
    name: 'Lena Fischer',
    username: 'lenaf',
    email: 'lena@collabsphere.dev',
    avatar: null,
    role: 'Admin',
    bio: 'Frontend lead. Design systems, accessibility, and shipping on Fridays anyway.',
    skills: ['React', 'Design systems', 'Accessibility', 'Vite'],
    location: 'Berlin, DE',
    website: 'https://lena.build',
    joinedAt: daysAgo(540),
    lastActive: hoursAgo(3),
  },
  {
    _id: 'u_003',
    name: 'Marcus Reed',
    username: 'mreed',
    email: 'marcus@collabsphere.dev',
    avatar: null,
    role: 'Member',
    bio: 'Data plumbing and dashboards. Ask me about query plans.',
    skills: ['Python', 'dbt', 'Airflow', 'SQL'],
    location: 'Austin, US',
    website: '',
    joinedAt: daysAgo(388),
    lastActive: hoursAgo(9),
  },
  {
    _id: 'u_004',
    name: 'Priya Raman',
    username: 'priyar',
    email: 'priya@collabsphere.dev',
    avatar: null,
    role: 'Member',
    bio: 'Mobile + API. Currently obsessed with offline-first sync.',
    skills: ['React Native', 'Swift', 'GraphQL'],
    location: 'Chennai, IN',
    website: '',
    joinedAt: daysAgo(275),
    lastActive: hoursAgo(26),
  },
  {
    _id: 'u_005',
    name: 'Tomas Novak',
    username: 'tnovak',
    email: 'tomas@collabsphere.dev',
    avatar: null,
    role: 'Member',
    bio: 'Infra and reliability. On-call apologist.',
    skills: ['Terraform', 'AWS', 'Observability'],
    location: 'Prague, CZ',
    website: '',
    joinedAt: daysAgo(198),
    lastActive: hoursAgo(50),
  },
  {
    _id: 'u_006',
    name: 'Sofia Alvarez',
    username: 'sofiaa',
    email: 'sofia@collabsphere.dev',
    avatar: null,
    role: 'Member',
    bio: 'QA automation. If it can break, it already has on my machine.',
    skills: ['Playwright', 'TypeScript', 'CI'],
    location: 'Madrid, ES',
    website: '',
    joinedAt: daysAgo(120),
    lastActive: hoursAgo(72),
  },
  {
    _id: 'u_007',
    name: 'Daniel Okafor',
    username: 'danok',
    email: 'daniel@collabsphere.dev',
    avatar: null,
    role: 'Member',
    bio: 'Backend. Writes migrations nobody fears.',
    skills: ['Node.js', 'MongoDB', 'Redis'],
    location: 'Lagos, NG',
    website: '',
    joinedAt: daysAgo(96),
    lastActive: hoursAgo(5),
  },
];

export const CURRENT_USER = USERS[0];

const member = (id, role, days) => ({ userId: id, role, joinedAt: daysAgo(days) });

export const PROJECTS = [
  {
    _id: 'p_001',
    name: 'Atlas API Gateway',
    slug: 'atlas-api-gateway',
    description:
      'Edge gateway that handles auth, rate limiting and request shaping for every internal service.',
    techStack: ['Node.js', 'Fastify', 'Redis', 'Docker'],
    ownerId: 'u_001',
    members: [member('u_001', 'Owner', 300), member('u_005', 'Admin', 180), member('u_007', 'Member', 90)],
    visibility: 'private',
    status: 'active',
    progress: 72,
    createdAt: daysAgo(300),
    updatedAt: hoursAgo(4),
    counts: { notes: 14, files: 23, members: 3 },
    starred: true,
    accent: '#6e8bff',
  },
  {
    _id: 'p_002',
    name: 'Nimbus Design System',
    slug: 'nimbus-design-system',
    description:
      'Shared React component library with tokens, docs and visual regression coverage.',
    techStack: ['React', 'Vite', 'Tailwind', 'Storybook'],
    ownerId: 'u_002',
    members: [member('u_002', 'Owner', 260), member('u_001', 'Admin', 240), member('u_006', 'Member', 110)],
    visibility: 'public',
    status: 'active',
    progress: 88,
    createdAt: daysAgo(262),
    updatedAt: hoursAgo(11),
    counts: { notes: 22, files: 41, members: 3 },
    starred: true,
    accent: '#a177ff',
  },
  {
    _id: 'p_003',
    name: 'Orbit Analytics Pipeline',
    slug: 'orbit-analytics-pipeline',
    description:
      'Batch and streaming ingestion into the warehouse, with contract tests on every model.',
    techStack: ['Python', 'dbt', 'Airflow', 'Snowflake'],
    ownerId: 'u_003',
    members: [member('u_003', 'Owner', 210), member('u_001', 'Member', 150), member('u_005', 'Member', 60)],
    visibility: 'private',
    status: 'active',
    progress: 54,
    createdAt: daysAgo(210),
    updatedAt: daysAgo(2),
    counts: { notes: 9, files: 17, members: 3 },
    starred: false,
    accent: '#39c5bb',
  },
  {
    _id: 'p_004',
    name: 'Halo Mobile Client',
    slug: 'halo-mobile-client',
    description: 'Offline-first mobile client with background sync and conflict resolution.',
    techStack: ['React Native', 'TypeScript', 'SQLite'],
    ownerId: 'u_004',
    members: [member('u_004', 'Owner', 170), member('u_001', 'Member', 120)],
    visibility: 'private',
    status: 'active',
    progress: 41,
    createdAt: daysAgo(172),
    updatedAt: daysAgo(4),
    counts: { notes: 7, files: 12, members: 2 },
    starred: false,
    accent: '#ffb86b',
  },
  {
    _id: 'p_005',
    name: 'Sentinel Observability',
    slug: 'sentinel-observability',
    description: 'Tracing, metrics and alert routing for the whole platform, one config file.',
    techStack: ['Go', 'OpenTelemetry', 'Grafana'],
    ownerId: 'u_005',
    members: [member('u_005', 'Owner', 140), member('u_001', 'Admin', 130), member('u_003', 'Member', 40)],
    visibility: 'private',
    status: 'paused',
    progress: 33,
    createdAt: daysAgo(140),
    updatedAt: daysAgo(9),
    counts: { notes: 5, files: 8, members: 3 },
    starred: false,
    accent: '#f472b6',
  },
  {
    _id: 'p_006',
    name: 'Ledger Billing Service',
    slug: 'ledger-billing-service',
    description: 'Usage metering, invoices and dunning flows with an audited event log.',
    techStack: ['Node.js', 'MongoDB', 'Stripe'],
    ownerId: 'u_007',
    members: [member('u_007', 'Owner', 88), member('u_001', 'Member', 70), member('u_006', 'Member', 30)],
    visibility: 'private',
    status: 'active',
    progress: 61,
    createdAt: daysAgo(88),
    updatedAt: daysAgo(1),
    counts: { notes: 11, files: 19, members: 3 },
    starred: false,
    accent: '#4ade80',
  },
  {
    _id: 'p_007',
    name: 'Docs Portal',
    slug: 'docs-portal',
    description: 'Public documentation site generated from project notes and README files.',
    techStack: ['Astro', 'MDX', 'Algolia'],
    ownerId: 'u_002',
    members: [member('u_002', 'Owner', 64), member('u_001', 'Member', 50)],
    visibility: 'public',
    status: 'active',
    progress: 95,
    createdAt: daysAgo(64),
    updatedAt: hoursAgo(30),
    counts: { notes: 18, files: 6, members: 2 },
    starred: false,
    accent: '#6e8bff',
  },
  {
    _id: 'p_008',
    name: 'Onboarding Playbook',
    slug: 'onboarding-playbook',
    description: 'Everything a new engineer needs in week one, kept honest by the team.',
    techStack: ['Markdown'],
    ownerId: 'u_001',
    members: [member('u_001', 'Owner', 45), member('u_002', 'Member', 40), member('u_004', 'Member', 20)],
    visibility: 'public',
    status: 'archived',
    progress: 100,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(14),
    counts: { notes: 12, files: 3, members: 3 },
    starred: false,
    accent: '#a177ff',
  },
];

export const NOTES = [
  {
    _id: 'n_001',
    projectId: 'p_001',
    title: 'Rate limiting strategy',
    tags: ['architecture', 'decision'],
    authorId: 'u_001',
    visibility: 'public',
    createdAt: daysAgo(40),
    updatedAt: hoursAgo(5),
    content: `# Rate limiting strategy

We settled on a **sliding window counter** kept in Redis. It is cheaper than a true sliding log and far more accurate than a fixed window at the boundary.

## Why not a token bucket

A token bucket is kinder to bursty clients, but our abuse cases are steady, not bursty. The counter is simpler to reason about during an incident.

## Limits

| Tier | Requests / minute | Burst |
| --- | --- | --- |
| Anonymous | 60 | 10 |
| Authenticated | 600 | 60 |
| Service token | 6000 | 600 |

## Implementation

\`\`\`js
const key = \`rl:\${tier}:\${identity}:\${windowId}\`;
const count = await redis.incr(key);
if (count === 1) await redis.pexpire(key, windowMs);
if (count > limit) throw new TooManyRequests({ retryAfter });
\`\`\`

> Anything above the limit gets a \`429\` with \`Retry-After\`. We never drop silently — a silent drop costs an hour of debugging on the client side.`,
  },
  {
    _id: 'n_002',
    projectId: 'p_001',
    title: 'Auth token rotation runbook',
    tags: ['runbook', 'security'],
    authorId: 'u_005',
    visibility: 'private',
    createdAt: daysAgo(33),
    updatedAt: daysAgo(3),
    content: `# Auth token rotation runbook

Rotate signing keys every 90 days, or immediately after any suspected leak.

1. Generate the new key pair and publish the public key to the JWKS endpoint.
2. Keep both keys valid for one full token lifetime (24h).
3. Switch the signer to the new key.
4. Remove the old key from JWKS after 48h.

## Checks before you start

- [x] Confirm JWKS cache TTL is under an hour
- [x] Confirm every service reads keys from JWKS, not from env
- [ ] Announce in #platform-ops

If a client pins a key by \`kid\`, step 4 will break them. Search the audit log for pinned \`kid\` values first.`,
  },
  {
    _id: 'n_003',
    projectId: 'p_002',
    title: 'Component API conventions',
    tags: ['guidelines', 'frontend'],
    authorId: 'u_002',
    visibility: 'public',
    createdAt: daysAgo(58),
    updatedAt: hoursAgo(14),
    content: `# Component API conventions

Rules that keep the library predictable as it grows.

## Naming

- Boolean props read as statements: \`isLoading\`, \`isDisabled\`, not \`loading\` and \`disabled\` mixed.
- Variant props take a string union, never a boolean per variant.

## Composition over configuration

\`\`\`jsx
// Preferred
<Card>
  <Card.Header title="Members" />
  <Card.Body>{children}</Card.Body>
</Card>
\`\`\`

A component with more than eight props is usually two components wearing a coat.

## Accessibility floor

Every interactive element has a visible focus ring, a reachable label, and a hit area of at least 40px on touch.`,
  },
  {
    _id: 'n_004',
    projectId: 'p_002',
    title: 'Token migration to CSS variables',
    tags: ['tokens', 'migration'],
    authorId: 'u_006',
    visibility: 'private',
    createdAt: daysAgo(21),
    updatedAt: daysAgo(6),
    content: `# Token migration to CSS variables

Hard-coded hex values are gone from 41 of 46 components. The rest are in the chart package, which needs a palette scale rather than single tokens.

## Remaining work

- Chart palette scale (categorical, 8 steps)
- Legacy \`Alert\` still uses a shadow literal
- Docs site needs a token table generated from source`,
  },
  {
    _id: 'n_005',
    projectId: 'p_003',
    title: 'Warehouse model contracts',
    tags: ['data', 'testing'],
    authorId: 'u_003',
    visibility: 'private',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
    content: `# Warehouse model contracts

Every published model declares a contract: column names, types, and nullability. A breaking change fails CI rather than a dashboard at 8am.

\`\`\`yaml
models:
  - name: fct_project_activity
    contract: { enforced: true }
    columns:
      - name: project_id
        data_type: varchar
        constraints: [{ type: not_null }]
\`\`\``,
  },
  {
    _id: 'n_006',
    projectId: 'p_004',
    title: 'Offline sync conflict rules',
    tags: ['mobile', 'decision'],
    authorId: 'u_004',
    visibility: 'private',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(4),
    content: `# Offline sync conflict rules

Last-write-wins is wrong for our data because two devices often edit different fields of the same note.

We merge per field using a vector clock, and only escalate to the user when the *same* field diverges.`,
  },
  {
    _id: 'n_007',
    projectId: 'p_006',
    title: 'Invoice state machine',
    tags: ['billing', 'architecture'],
    authorId: 'u_007',
    visibility: 'private',
    createdAt: daysAgo(12),
    updatedAt: hoursAgo(20),
    content: `# Invoice state machine

States: \`draft\` → \`open\` → \`paid\` | \`uncollectible\` | \`void\`.

Transitions are append-only events. The invoice document stores the current state for reads, but the event log is the source of truth during a dispute.`,
  },
  {
    _id: 'n_008',
    projectId: 'p_007',
    title: 'Docs information architecture',
    tags: ['docs', 'structure'],
    authorId: 'u_002',
    visibility: 'public',
    createdAt: daysAgo(26),
    updatedAt: hoursAgo(31),
    content: `# Docs information architecture

Four top-level sections, no more: **Start**, **Guides**, **Reference**, **Changelog**.

Anything that does not fit is a sign the page belongs inside an existing guide, not beside it.`,
  },
  {
    _id: 'n_009',
    projectId: 'p_008',
    title: 'Week one checklist',
    tags: ['onboarding'],
    authorId: 'u_001',
    visibility: 'public',
    createdAt: daysAgo(44),
    updatedAt: daysAgo(14),
    content: `# Week one checklist

- Laptop, SSO, VPN, and repo access on day one
- Ship a one-line change to production by day three
- Pair with someone from another team by day five

The goal is a first deploy, not a full understanding.`,
  },
  {
    _id: 'n_010',
    projectId: 'p_001',
    title: 'Gateway incident 2024-11-02',
    tags: ['postmortem'],
    authorId: 'u_007',
    visibility: 'private',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(7),
    content: `# Gateway incident — 02 Nov

**Impact:** 6 minutes of elevated 502s on the public edge (peak 9% of requests).

**Cause:** a health check pointed at a path that a new router prefix no longer served, so healthy instances were drained.

**Fix:** health checks now use a dedicated \`/__health\` route registered outside the router.`,
  },
];

export const FILES = [
  {
    _id: 'f_001',
    projectId: 'p_001',
    name: 'rateLimiter.js',
    type: 'javascript',
    size: 4821,
    uploadedById: 'u_001',
    uploadedAt: hoursAgo(6),
    content: `import { redis } from './redis.js';

const WINDOW_MS = 60_000;

/**
 * Sliding window counter. One INCR per request, one PEXPIRE per window.
 */
export async function consume({ identity, tier, limit }) {
  const windowId = Math.floor(Date.now() / WINDOW_MS);
  const key = \`rl:\${tier}:\${identity}:\${windowId}\`;

  const count = await redis.incr(key);
  if (count === 1) await redis.pexpire(key, WINDOW_MS);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter: count > limit ? Math.ceil(WINDOW_MS / 1000) : 0,
  };
}`,
  },
  {
    _id: 'f_002',
    projectId: 'p_001',
    name: 'gateway.config.json',
    type: 'json',
    size: 1204,
    uploadedById: 'u_005',
    uploadedAt: daysAgo(3),
    content: `{
  "listen": { "port": 8080, "host": "0.0.0.0" },
  "upstreams": {
    "projects": "http://projects.internal:4001",
    "notes": "http://notes.internal:4002",
    "files": "http://files.internal:4003"
  },
  "rateLimits": { "anonymous": 60, "authenticated": 600, "service": 6000 },
  "timeouts": { "connectMs": 400, "readMs": 8000 }
}`,
  },
  {
    _id: 'f_003',
    projectId: 'p_001',
    name: 'architecture.md',
    type: 'markdown',
    size: 3312,
    uploadedById: 'u_001',
    uploadedAt: daysAgo(12),
    content: `# Gateway architecture\n\nRequests enter through the edge load balancer, pass auth, then rate limiting, then routing.`,
  },
  {
    _id: 'f_004',
    projectId: 'p_002',
    name: 'Button.jsx',
    type: 'javascript',
    size: 2410,
    uploadedById: 'u_002',
    uploadedAt: hoursAgo(20),
    content: `export function Button({ variant = 'primary', size = 'md', ...props }) {
  return <button className={styles(variant, size)} {...props} />;
}`,
  },
  {
    _id: 'f_005',
    projectId: 'p_002',
    name: 'tokens.css',
    type: 'css',
    size: 1876,
    uploadedById: 'u_006',
    uploadedAt: daysAgo(5),
    content: `:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --radius-md: 12px;
}`,
  },
  {
    _id: 'f_006',
    projectId: 'p_002',
    name: 'nimbus-cover.png',
    type: 'image',
    size: 482311,
    uploadedById: 'u_002',
    uploadedAt: daysAgo(9),
    content: null,
  },
  {
    _id: 'f_007',
    projectId: 'p_003',
    name: 'transform_activity.py',
    type: 'python',
    size: 5120,
    uploadedById: 'u_003',
    uploadedAt: daysAgo(2),
    content: `import pandas as pd


def transform(events: pd.DataFrame) -> pd.DataFrame:
    """Collapse raw events into a daily activity fact table."""
    daily = (
        events
        .assign(day=events["ts"].dt.floor("D"))
        .groupby(["project_id", "day"], as_index=False)
        .agg(events=("id", "count"), actors=("user_id", "nunique"))
    )
    return daily.sort_values(["project_id", "day"])`,
  },
  {
    _id: 'f_008',
    projectId: 'p_003',
    name: 'warehouse-schema.pdf',
    type: 'pdf',
    size: 1248320,
    uploadedById: 'u_003',
    uploadedAt: daysAgo(16),
    content: null,
  },
  {
    _id: 'f_009',
    projectId: 'p_004',
    name: 'syncEngine.ts',
    type: 'javascript',
    size: 8842,
    uploadedById: 'u_004',
    uploadedAt: daysAgo(4),
    content: `export class SyncEngine {
  constructor(private queue: MutationQueue, private clock: VectorClock) {}

  async push() {
    const batch = await this.queue.take(50);
    if (!batch.length) return { pushed: 0 };
    const res = await api.post('/sync', { batch, clock: this.clock.snapshot() });
    this.clock.merge(res.clock);
    return { pushed: batch.length };
  }
}`,
  },
  {
    _id: 'f_010',
    projectId: 'p_006',
    name: 'invoice.model.js',
    type: 'javascript',
    size: 3204,
    uploadedById: 'u_007',
    uploadedAt: hoursAgo(26),
    content: `import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
  state: { type: String, enum: ['draft', 'open', 'paid', 'void', 'uncollectible'], default: 'draft' },
  lines: [{ description: String, quantity: Number, unitAmount: Number }],
  total: Number,
}, { timestamps: true });

export default mongoose.model('Invoice', InvoiceSchema);`,
  },
  {
    _id: 'f_011',
    projectId: 'p_006',
    name: 'pricing.json',
    type: 'json',
    size: 918,
    uploadedById: 'u_007',
    uploadedAt: daysAgo(6),
    content: `{ "plans": [{ "id": "team", "seat": 1200 }, { "id": "scale", "seat": 2400 }] }`,
  },
  {
    _id: 'f_012',
    projectId: 'p_007',
    name: 'index.html',
    type: 'html',
    size: 2240,
    uploadedById: 'u_002',
    uploadedAt: daysAgo(7),
    content: `<!doctype html>
<html lang="en">
  <head><title>Docs Portal</title></head>
  <body><div id="app"></div></body>
</html>`,
  },
  {
    _id: 'f_013',
    projectId: 'p_007',
    name: 'search-index.json',
    type: 'json',
    size: 88210,
    uploadedById: 'u_001',
    uploadedAt: daysAgo(11),
    content: `{ "documents": 412, "generatedAt": "2025-02-04T09:12:00.000Z" }`,
  },
  {
    _id: 'f_014',
    projectId: 'p_005',
    name: 'otel-collector.yaml',
    type: 'other',
    size: 2104,
    uploadedById: 'u_005',
    uploadedAt: daysAgo(18),
    content: `receivers:
  otlp:
    protocols: { grpc: {}, http: {} }
exporters:
  prometheus: { endpoint: "0.0.0.0:8889" }`,
  },
];

export const ACTIVITIES = [
  { _id: 'a_01', type: 'readme_generated', actorId: 'u_001', projectId: 'p_001', target: 'README.md', at: hoursAgo(2) },
  { _id: 'a_02', type: 'file_uploaded', actorId: 'u_001', projectId: 'p_001', target: 'rateLimiter.js', at: hoursAgo(6) },
  { _id: 'a_03', type: 'note_updated', actorId: 'u_002', projectId: 'p_002', target: 'Component API conventions', at: hoursAgo(14) },
  { _id: 'a_04', type: 'member_joined', actorId: 'u_007', projectId: 'p_006', target: 'Ledger Billing Service', at: hoursAgo(26) },
  { _id: 'a_05', type: 'note_created', actorId: 'u_007', projectId: 'p_006', target: 'Invoice state machine', at: hoursAgo(20) },
  { _id: 'a_06', type: 'project_published', actorId: 'u_002', projectId: 'p_007', target: 'Docs Portal', at: hoursAgo(31) },
  { _id: 'a_07', type: 'file_uploaded', actorId: 'u_003', projectId: 'p_003', target: 'transform_activity.py', at: daysAgo(2) },
  { _id: 'a_08', type: 'note_updated', actorId: 'u_005', projectId: 'p_001', target: 'Auth token rotation runbook', at: daysAgo(3) },
  { _id: 'a_09', type: 'project_created', actorId: 'u_007', projectId: 'p_006', target: 'Ledger Billing Service', at: daysAgo(88) },
  { _id: 'a_10', type: 'member_joined', actorId: 'u_006', projectId: 'p_002', target: 'Nimbus Design System', at: daysAgo(110) },
  { _id: 'a_11', type: 'file_uploaded', actorId: 'u_004', projectId: 'p_004', target: 'syncEngine.ts', at: daysAgo(4) },
  { _id: 'a_12', type: 'note_created', actorId: 'u_003', projectId: 'p_003', target: 'Warehouse model contracts', at: daysAgo(30) },
];

export const NOTIFICATIONS = [
  {
    _id: 'nt_01',
    type: 'member_added',
    title: 'Daniel Okafor added you to Ledger Billing Service',
    body: 'You now have Member access to the billing project.',
    projectId: 'p_006',
    actorId: 'u_007',
    read: false,
    at: hoursAgo(2),
  },
  {
    _id: 'nt_02',
    type: 'readme',
    title: 'README generated for Atlas API Gateway',
    body: 'The assistant drafted a README from your notes and file tree. Review before publishing.',
    projectId: 'p_001',
    actorId: 'u_001',
    read: false,
    at: hoursAgo(3),
  },
  {
    _id: 'nt_03',
    type: 'file',
    title: 'Lena Fischer uploaded 3 files to Nimbus Design System',
    body: 'tokens.css, Button.jsx, nimbus-cover.png',
    projectId: 'p_002',
    actorId: 'u_002',
    read: false,
    at: hoursAgo(14),
  },
  {
    _id: 'nt_04',
    type: 'note',
    title: 'Component API conventions was updated',
    body: 'Lena Fischer edited the accessibility section.',
    projectId: 'p_002',
    actorId: 'u_002',
    read: true,
    at: hoursAgo(20),
  },
  {
    _id: 'nt_05',
    type: 'visibility',
    title: 'Docs Portal is now public',
    body: 'Anyone with the link can read the README and public notes.',
    projectId: 'p_007',
    actorId: 'u_002',
    read: true,
    at: hoursAgo(31),
  },
  {
    _id: 'nt_06',
    type: 'mention',
    title: 'Marcus Reed mentioned you in Warehouse model contracts',
    body: '“@aaravm can you confirm the contract on fct_project_activity?”',
    projectId: 'p_003',
    actorId: 'u_003',
    read: true,
    at: daysAgo(2),
  },
  {
    _id: 'nt_07',
    type: 'member_added',
    title: 'Sofia Alvarez joined Nimbus Design System',
    body: 'Invited by Lena Fischer as Member.',
    projectId: 'p_002',
    actorId: 'u_006',
    read: true,
    at: daysAgo(4),
  },
  {
    _id: 'nt_08',
    type: 'file',
    title: 'New upload in Orbit Analytics Pipeline',
    body: 'transform_activity.py · 5.0 KB',
    projectId: 'p_003',
    actorId: 'u_003',
    read: true,
    at: daysAgo(2),
  },
];

const series = (length, base, variance, seedStart = 3) => {
  let seed = seedStart;
  return Array.from({ length }, (_, i) => {
    seed = (seed * 9301 + 49297) % 233280;
    const noise = (seed / 233280 - 0.5) * variance;
    const trend = (i / length) * variance * 0.9;
    return Math.max(0, Math.round(base + trend + noise));
  });
};

const dayLabels = (count) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(now - (count - 1 - i) * DAY);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

export const ANALYTICS = {
  totals: { notes: 98, files: 129, activeMembers: 7, activityEvents: 1846, aiCalls: 312 },
  deltas: { notes: 12.4, files: 8.1, activeMembers: 0, activityEvents: 19.2, aiCalls: 31.7 },
  labels: dayLabels(30),
  activity: series(30, 22, 34, 11),
  notesCreated: series(30, 2, 7, 29),
  filesUploaded: series(30, 3, 9, 41),
  aiUsage: series(30, 4, 12, 57),
  weekLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  weekActivity: [48, 62, 71, 55, 83, 21, 14],
  fileMix: [
    { label: 'JavaScript', value: 44, color: '#6e8bff' },
    { label: 'Markdown', value: 27, color: '#a177ff' },
    { label: 'Python', value: 18, color: '#39c5bb' },
    { label: 'Images', value: 12, color: '#ffb86b' },
    { label: 'Other', value: 28, color: '#6b7589' },
  ],
  contributions: [
    { userId: 'u_001', notes: 28, files: 34, activity: 412, share: 26 },
    { userId: 'u_002', notes: 31, files: 41, activity: 388, share: 24 },
    { userId: 'u_003', notes: 14, files: 19, activity: 241, share: 16 },
    { userId: 'u_007', notes: 12, files: 17, activity: 198, share: 13 },
    { userId: 'u_005', notes: 7, files: 9, activity: 144, share: 11 },
    { userId: 'u_004', notes: 6, files: 9, activity: 121, share: 10 },
  ],
};

export const SESSIONS = [
  { _id: 's_1', device: 'MacBook Pro · Chrome 131', location: 'Bengaluru, IN', ip: '103.21.44.9', current: true, at: hoursAgo(1) },
  { _id: 's_2', device: 'iPhone 15 · CollabSphere iOS', location: 'Bengaluru, IN', ip: '103.21.44.9', current: false, at: hoursAgo(9) },
  { _id: 's_3', device: 'Ubuntu 24.04 · Firefox 132', location: 'Pune, IN', ip: '49.36.180.212', current: false, at: daysAgo(4) },
];

export const CONVERSATIONS = [
  {
    _id: 'c_001',
    title: 'Explain the rate limiter',
    context: { type: 'file', id: 'f_001', label: 'rateLimiter.js' },
    updatedAt: hoursAgo(2),
    messages: [
      { id: 'm1', role: 'user', content: 'Explain what rateLimiter.js does and where it could go wrong.', at: hoursAgo(2) },
      {
        id: 'm2',
        role: 'assistant',
        at: hoursAgo(2),
        content: `**What it does**

\`consume()\` implements a fixed-size sliding window counter. For each request it derives a window id from the current minute, increments a Redis key for that window, and sets an expiry the first time the key appears.

**Where it can go wrong**

1. \`INCR\` and \`PEXPIRE\` are two round trips. If the process dies between them the key never expires and that identity is blocked until the key is evicted. Combine them in a Lua script or use \`SET key 0 PX ms NX\` first.
2. Window boundaries allow a burst of up to \`2 × limit\` across two adjacent windows.
3. There is no fail-open path. If Redis is unreachable the call throws and every request 500s.

\`\`\`js
const script = \`
  local c = redis.call('INCR', KEYS[1])
  if c == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
  return c
\`;
\`\`\``,
      },
    ],
  },
  {
    _id: 'c_002',
    title: 'README for Atlas API Gateway',
    context: { type: 'project', id: 'p_001', label: 'Atlas API Gateway' },
    updatedAt: hoursAgo(3),
    messages: [
      { id: 'm1', role: 'user', content: 'Generate a README for this project from the notes and file tree.', at: hoursAgo(3) },
      { id: 'm2', role: 'assistant', content: 'Drafted a README with install, configuration and deployment sections. Open the README tab to review it.', at: hoursAgo(3) },
    ],
  },
  {
    _id: 'c_003',
    title: 'Tighten the invoice state machine',
    context: { type: 'note', id: 'n_007', label: 'Invoice state machine' },
    updatedAt: daysAgo(1),
    messages: [
      { id: 'm1', role: 'user', content: 'Review this note for gaps.', at: daysAgo(1) },
      { id: 'm2', role: 'assistant', content: 'Two gaps: there is no transition out of `uncollectible`, and refunds are not represented at all. Consider a `credited` terminal state.', at: daysAgo(1) },
    ],
  },
];

export const SAMPLE_README = `# Atlas API Gateway

Edge gateway for the CollabSphere platform. Handles authentication, rate limiting, request shaping and routing to internal services.

## Features

- JWT verification with JWKS rotation
- Sliding-window rate limiting backed by Redis
- Per-route timeouts and circuit breaking
- Structured request logs with trace propagation

## Installation

\`\`\`bash
git clone https://github.com/collabsphere/atlas-gateway.git
cd atlas-gateway
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev      # start with hot reload on :8080
npm run test     # unit + contract tests
npm run build    # production bundle
\`\`\`

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| \`PORT\` | Port the gateway listens on | \`8080\` |
| \`REDIS_URL\` | Redis connection string | — |
| \`JWKS_URL\` | Public key set for token verification | — |
| \`LOG_LEVEL\` | \`debug\` \\| \`info\` \\| \`warn\` | \`info\` |

## Contributing

Branch from \`main\`, keep commits scoped, and include a test for anything that touches routing. Run \`npm run lint\` before opening a pull request.

## License

MIT`;

export const AI_SAMPLES = {
  explainCode: `**Summary**

This module exports a single async function that decides whether a request is allowed through. It keeps one counter per identity per one-minute window in Redis.

**Line by line**

- \`windowId\` buckets the clock into fixed minutes, so every caller within the same minute shares one key.
- \`redis.incr\` both creates and increments the counter, which avoids a read-then-write race.
- The expiry is only set on the first increment, so the key lives exactly one window.

**Suggestions**

1. Move the increment and expiry into one Lua script so a crash cannot leave a key without a TTL.
2. Return \`remaining\` in a response header so clients can back off before they are rejected.
3. Decide on fail-open or fail-closed behaviour when Redis is down, and write it down in the runbook.`,
  explainNote: `**In one line:** the team chose a sliding window counter for rate limiting because incidents are easier to reason about than with a token bucket.

**What the note establishes**

- The mechanism (Redis counter keyed by tier, identity and window)
- The limits per tier, including burst allowances
- The contract with clients: a 429 with \`Retry-After\`, never a silent drop

**What a reader still has to guess**

- What happens when Redis is unavailable
- Whether limits are per-instance or global
- Who to contact for a limit increase`,
  improveNote: `Here is a tightened version of the note.

## Suggested edits

1. Lead with the decision, then the reasoning. A reader scanning during an incident needs the limit table first.
2. Replace "cheaper" with the measured number — one \`INCR\` per request versus one sorted-set write plus trim.
3. Add a "When Redis is down" section. Every reviewer asked the same question.
4. Move the code sample below the table; it is reference, not narrative.

## Rewritten opening

> We rate limit with a sliding window counter in Redis. Anonymous callers get 60 requests per minute, authenticated callers 600, service tokens 6000. Anything over the limit receives a 429 with \`Retry-After\`.`,
  findIssues: `Three things worth fixing, ordered by blast radius.

1. **No fail-open path** — if Redis is unreachable every request throws and the gateway returns 500. Decide the behaviour explicitly and cover it with a test.
2. **Non-atomic expiry** — \`INCR\` then \`PEXPIRE\` is two round trips. A crash between them leaves a key without a TTL.
3. **Boundary bursts** — a client can send \`limit\` requests at the end of one window and \`limit\` again at the start of the next.

Nothing here is a security issue, but the first one is an availability issue and should be scheduled.`,
  generateDocs: `# API reference

## \`consume(options)\`

Records one request against an identity's quota and reports whether it is allowed.

### Parameters

| Name | Type | Description |
| --- | --- | --- |
| \`identity\` | \`string\` | Stable caller id — user id, API key or client IP. |
| \`tier\` | \`string\` | Quota tier: \`anonymous\`, \`authenticated\` or \`service\`. |
| \`limit\` | \`number\` | Requests permitted inside the current window. |

### Returns

\`Promise<{ allowed: boolean, remaining: number, retryAfter: number }>\`

### Throws

Propagates any Redis connection error. Callers decide whether to fail open.`,
  generic: `Here is what I found.

The pattern you are describing is common in multi-tenant systems, and the trade-off usually comes down to how much state you are willing to keep per caller. Start with the simplest mechanism that you can explain during an incident, measure it, and only add complexity when the measurement says you need it.

Tell me which project, note or file to look at and I can be specific rather than general.`,
};
