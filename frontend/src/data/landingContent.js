/** Copy and content for the marketing page. Kept out of the JSX so it reads like a doc. */

export const FEATURES = [
  {
    icon: 'folder',
    title: 'Projects that hold everything',
    body: 'One place for the repo notes, the file tree, the people and the decisions. No more hunting across four tools for the reason behind a change.',
  },
  {
    icon: 'note',
    title: 'Markdown documentation',
    body: 'Write in markdown with a live preview beside you. Tables, code fences and callouts render exactly as they will for the next reader.',
  },
  {
    icon: 'files',
    title: 'File management',
    body: 'Drag in source files, schemas, diagrams and PDFs. Code opens in a reader with line numbers instead of downloading to your desktop.',
  },
  {
    icon: 'code',
    title: 'Code explanation',
    body: 'Select a file and get a plain-language walkthrough, including the parts that will surprise a new maintainer.',
  },
  {
    icon: 'book',
    title: 'README generation',
    body: 'Turn a project, its stack and its notes into a README with install, usage and environment sections already filled in.',
  },
  {
    icon: 'sparkles',
    title: 'Documentation drafts',
    body: 'Ask for API reference from a file, or a tightened version of a note. You review the diff before anything is saved.',
  },
];

export const HOW_STEPS = [
  {
    title: 'Create a project',
    body: 'Name it, describe it in a sentence, add the stack. Private by default, public when you are ready.',
  },
  {
    title: 'Bring your team and your files',
    body: 'Invite people as members or admins, then drop in the code and documents the project already depends on.',
  },
  {
    title: 'Document as you build',
    body: 'Write notes in markdown while the work is fresh. The assistant fills the gaps you would otherwise leave for later.',
  },
  {
    title: 'Publish what others need',
    body: 'Flip a project public and its README and marked notes become a clean read-only page you can link anywhere.',
  },
];

export const AI_CAPABILITIES = [
  { label: 'Explain a file', detail: 'Line-by-line walkthrough with the risky parts called out.' },
  { label: 'Find possible issues', detail: 'Ordered by blast radius, not by line number.' },
  { label: 'Generate a README', detail: 'Install, usage, environment variables and contribution notes.' },
  { label: 'Draft API reference', detail: 'Parameters, return shape and thrown errors as a table.' },
  { label: 'Improve a note', detail: 'Keeps your meaning, tightens the structure.' },
  { label: 'Summarise a project', detail: 'What it does, who owns it, what changed this week.' },
];

export const LANDING_STATS = [
  { value: '12,400', label: 'Projects documented' },
  { value: '68,000', label: 'Notes written' },
  { value: '31 min', label: 'Median time saved per README' },
  { value: '99.98%', label: 'Uptime over 90 days' },
];

export const TESTIMONIALS = [
  {
    quote:
      'Our onboarding doc used to be a Google Doc nobody trusted. Now the project carries its own documentation, and the README is generated from what is actually in the repo.',
    name: 'Ijeoma Nwosu',
    role: 'Engineering manager, Fieldwire',
  },
  {
    quote:
      'The code explanation is the part I did not expect to use daily. I paste in a service I have never touched and get a map before I start reading.',
    name: 'Ben Halvorsen',
    role: 'Staff engineer, Northline',
  },
  {
    quote:
      'We publish four internal libraries as public project pages. One link, always current, no static site to rebuild.',
    name: 'Mira Castellanos',
    role: 'Platform lead, Aurio',
  },
];

export const PLANS = [
  {
    name: 'Solo',
    price: '$0',
    cadence: 'forever',
    summary: 'For one engineer keeping their side projects honest.',
    features: ['3 projects', 'Unlimited notes and files', '50 assistant requests a month', 'Public project pages'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Team',
    price: '$12',
    cadence: 'per member / month',
    summary: 'For teams who want one source of truth per project.',
    features: [
      'Unlimited projects and members',
      'Roles: owner, admin, member',
      '1,000 assistant requests a month',
      'Project analytics and contribution reports',
      'Priority support',
    ],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    cadence: 'annual',
    summary: 'For organisations with compliance and residency requirements.',
    features: ['SSO and SCIM', 'Audit log export', 'Self-hosted file storage', 'Dedicated environment', 'Named support engineer'],
    cta: 'Talk to us',
    featured: false,
  },
];

export const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'AI capabilities', href: '#ai' },
      { label: 'Collaboration', href: '#collaboration' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API reference', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];
