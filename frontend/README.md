# CollabSphere — frontend

An AI-powered developer collaboration workspace: projects, markdown documentation, files,
team management and an assistant that explains code and drafts READMEs.

**This repository is frontend only.** There is no Express server, no MongoDB, and no model
API call anywhere in the code. Every screen is driven by mock service functions that already
have the shape of the real endpoints, so connecting a backend later means editing one file.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm run build      # production bundle into dist/
npm run preview    # serve the production build locally
```

Optional environment file:

```bash
cp .env.example .env
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of your Express API | `http://localhost:5000/api` |
| `VITE_USE_MOCKS` | `true` uses mock data, `false` calls the real API | `true` |

**Demo login:** any email address with a password of six characters or more. The login form is
pre-filled with `aarav@collabsphere.dev`.

---

## Folder structure

```
collabsphere/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx                    # entry: Router + Theme/Toast/Auth providers
    ├── App.jsx                     # every route, plus the auth guard
    ├── index.css                   # design tokens, markdown styles, base layer
    │
    ├── components/
    │   ├── common/                 # design system primitives
    │   │   ├── Icon.jsx            # the whole inline SVG icon set
    │   │   ├── Logo.jsx
    │   │   ├── Button.jsx          # Button + IconButton
    │   │   ├── Input.jsx           # Field, Input, PasswordInput, Textarea, Select
    │   │   ├── Badge.jsx           # Badge, StatusBadge, VisibilityBadge
    │   │   ├── Avatar.jsx          # Avatar + AvatarGroup
    │   │   ├── Card.jsx            # Card + CardHeader
    │   │   ├── Modal.jsx           # portal modal with backdrop + Esc
    │   │   ├── ConfirmDialog.jsx   # destructive confirmations
    │   │   ├── Dropdown.jsx        # animated menu with outside-click close
    │   │   ├── Tabs.jsx
    │   │   ├── SegmentedControl.jsx
    │   │   ├── Switch.jsx
    │   │   ├── ProgressBar.jsx
    │   │   ├── Skeleton.jsx        # Skeleton, SkeletonText, SkeletonCard, SkeletonRow
    │   │   ├── EmptyState.jsx      # EmptyState + ErrorState
    │   │   ├── Tooltip.jsx
    │   │   ├── Spinner.jsx
    │   │   └── CodeBlock.jsx       # code viewer with line numbers + copy
    │   │
    │   ├── layout/
    │   │   ├── AppLayout.jsx       # the app shell (sidebar + topbar + mobile nav)
    │   │   ├── Sidebar.jsx         # collapsible, with nav sections
    │   │   ├── Topbar.jsx          # search, create menu, theme, notifications, account
    │   │   ├── MobileNav.jsx       # bottom bar under 768px
    │   │   ├── SearchOverlay.jsx   # ⌘K global search
    │   │   ├── NotificationsMenu.jsx
    │   │   ├── PageHeader.jsx
    │   │   └── AuthLayout.jsx      # split-screen frame for auth pages
    │   │
    │   ├── cards/
    │   │   ├── ProjectCard.jsx     # grid + list views, plus ProjectCardCompact
    │   │   ├── StatCard.jsx
    │   │   ├── ActivityFeed.jsx
    │   │   ├── NoteCard.jsx
    │   │   ├── FileRow.jsx         # also exports FILE_TYPE_META and FileIcon
    │   │   └── MemberRow.jsx
    │   │
    │   ├── charts/                 # hand-built SVG/DOM charts, no chart library
    │   │   ├── AreaChart.jsx       # also exports Sparkline
    │   │   ├── BarChart.jsx
    │   │   ├── DonutChart.jsx
    │   │   └── ChartCard.jsx
    │   │
    │   ├── editor/
    │   │   ├── MarkdownEditor.jsx  # split editor, fullscreen, word count
    │   │   ├── EditorToolbar.jsx
    │   │   └── MarkdownPreview.jsx
    │   │
    │   ├── ai/
    │   │   ├── AIMessage.jsx       # message bubbles + AIThinking loader
    │   │   ├── PromptSuggestions.jsx
    │   │   ├── ContextSelector.jsx # project / note / file context picker
    │   │   ├── AIUsageCard.jsx
    │   │   └── AIResultModal.jsx   # one panel for every assistant result
    │   │
    │   └── modals/
    │       ├── ProjectFormModal.jsx  # create and edit share one form
    │       ├── AddMemberModal.jsx
    │       ├── UploadModal.jsx       # drag & drop with per-file progress
    │       └── FilePreviewModal.jsx
    │
    ├── pages/
    │   ├── Landing.jsx             ├── Files.jsx
    │   ├── Login.jsx               ├── AIAssistant.jsx
    │   ├── Register.jsx            ├── ReadmeGenerator.jsx
    │   ├── ForgotPassword.jsx      ├── Analytics.jsx
    │   ├── ResetPassword.jsx       ├── Members.jsx
    │   ├── VerifyEmail.jsx         ├── Profile.jsx
    │   ├── Dashboard.jsx           ├── Settings.jsx
    │   ├── Projects.jsx            ├── Notifications.jsx
    │   ├── ProjectDetails.jsx      ├── SearchPage.jsx
    │   ├── Notes.jsx               ├── PublicProject.jsx
    │   ├── NoteEditor.jsx          └── NotFound.jsx
    │
    ├── services/
    │   └── api.js                  # ← the only file that talks to a backend
    │
    ├── context/
    │   ├── AuthContext.jsx         # session, login, register, logout
    │   ├── ThemeContext.jsx        # dark / light / system
    │   └── ToastContext.jsx        # toast queue + viewport
    │
    ├── hooks/
    │   ├── useAsync.js             # loading / data / error / refetch
    │   ├── useDebounce.js
    │   ├── useClickOutside.js
    │   ├── useLocalStorage.js
    │   ├── useMediaQuery.js
    │   └── useUsers.js             # cached user directory
    │
    ├── utils/
    │   ├── cn.js
    │   ├── format.js               # dates, bytes, relative time, initials
    │   └── markdown.js             # dependency-free markdown renderer
    │
    └── data/
        ├── mockData.js             # users, projects, notes, files, activity, analytics
        └── landingContent.js       # marketing copy
```

---

## Routes

| Path | Screen | Access |
| --- | --- | --- |
| `/` | Landing page | public |
| `/public/project/:projectId` | Read-only project page | public |
| `/login`, `/register` | Authentication | public |
| `/forgot-password`, `/reset-password`, `/verify-email` | Password + verification flows | public |
| `/dashboard` | Workspace home | protected |
| `/projects`, `/shared` | Project lists | protected |
| `/projects/:projectId` | Project workspace (7 tabs) | protected |
| `/notes`, `/notes/new`, `/notes/:noteId` | Notes list and editor | protected |
| `/files` | File explorer | protected |
| `/ai` | AI assistant | protected |
| `/readme` | README generator | protected |
| `/analytics` | Analytics dashboard | protected |
| `/team` | People directory | protected |
| `/notifications`, `/search`, `/profile`, `/settings` | Account screens | protected |
| `*` | 404 | public |

Try `/public/project/p_002` — the "View demo" button on the landing page points there.

---

## Connecting your backend

Open **`src/services/api.js`**. It is the only module that knows a server exists.
Every method has two branches:

```js
async list(params) {
  if (!USE_MOCKS) return request('/projects?…');   // ← your Express route
  await latency();                                  // ← delete once live
  return mockRows;
}
```

To go live:

1. Set `VITE_API_URL` in `.env` to your API base (e.g. `http://localhost:5000/api`).
2. Set `VITE_USE_MOCKS=false`.
3. Delete the mock branch of each method once its endpoint exists.

`request()` already attaches `Authorization: Bearer <token>`, sends cookies, handles
`FormData` uploads and throws a typed `ApiError` with the server's message.

### Endpoints the UI expects

| Service object | Routes it calls |
| --- | --- |
| `authAPI` | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-email`, `PATCH /auth/password`, `GET /auth/sessions`, `DELETE /auth/sessions` |
| `userAPI` | `GET /users`, `GET /users/:id`, `PATCH /users/me` |
| `projectAPI` | `GET /projects`, `GET /projects/:id`, `GET /public/projects/:id`, `POST /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`, `POST /projects/:id/star`, `GET /projects/:id/activity` |
| `notesAPI` | `GET /notes`, `GET /notes/:id`, `POST /notes`, `PATCH /notes/:id`, `DELETE /notes/:id` |
| `fileAPI` | `GET /files`, `GET /files/:id`, `POST /files` (multipart), `DELETE /files/:id`, `GET /files/:id/download` |
| `memberAPI` | `GET /projects/:id/members`, `POST /projects/:id/members`, `PATCH /projects/:id/members/:userId`, `DELETE /projects/:id/members/:userId` |
| `analyticsAPI` | `GET /analytics`, `GET /analytics/dashboard` |
| `notificationAPI` | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| `activityAPI` | `GET /activity` |
| `searchAPI` | `GET /search?q=` |
| `geminiAPI` | `GET /ai/conversations`, `POST /ai/chat`, `POST /ai/explain-code`, `POST /ai/explain-note`, `POST /ai/improve-note`, `POST /ai/generate-readme`, `GET /ai/usage` |

The model is deliberately never called from the browser: `geminiAPI` posts to your Express
routes, and the API key stays on the server.

Mock documents use MongoDB-shaped fields (`_id`, `createdAt`, `updatedAt`), so Mongoose
documents can be returned as-is.

---

## Design system

| | |
| --- | --- |
| Surfaces | `--c-base` `#0b0e14`, `--c-surface` `#12161f`, `--c-raised` `#171d29` |
| Ink | `--c-ink` `#e7eaf2`, `--c-muted` `#99a3b8`, `--c-faint` `#6b7589` |
| Accent | `--c-accent` `#6e8bff` with `--c-violet` `#a177ff` |
| AI | `--c-ai` `#ffb86b` — reserved for assistant surfaces only, so AI actions are recognisable |
| Type | Space Grotesk (display), Inter (UI), JetBrains Mono (code) |

All colours are CSS variables in `src/index.css` and exposed to Tailwind in
`tailwind.config.js`, so light mode is a token swap rather than a second stylesheet.
Theme preference (dark / light / system) lives in `ThemeContext` and persists to
`localStorage`.

Every screen implements loading skeletons, empty states, error states with retry,
confirmation dialogs for destructive actions, toasts, and form validation.
`prefers-reduced-motion` is respected globally.

Breakpoints exercised: 1440 / 1024 / 768 / 480 / 375. The sidebar collapses to icons below
1280px, becomes a drawer below 768px, and a bottom bar appears on phones.

---

## What is intentionally not here

- No Express, MongoDB or Mongoose
- No model/API keys, and no network call to any AI provider
- No payment integration — the pricing section is UI only
- No chart, icon, or markdown dependency: those are implemented in `src/components/charts`,
  `src/components/common/Icon.jsx` and `src/utils/markdown.js`

Dependencies are exactly four: `react`, `react-dom`, `react-router-dom`, `tailwindcss`.
