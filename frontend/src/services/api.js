/**
 * ============================================================================
 *  CollabSphere API layer — the single seam between UI and backend
 * ============================================================================
 *
 *  No component talks to the network directly. Every screen calls one of the
 *  exported API objects below, so connecting the real Node + Express + MongoDB
 *  server later means editing this file only.
 *
 *  To go live:
 *    1. Set VITE_API_URL in .env            (e.g. http://localhost:5000/api)
 *    2. Set VITE_USE_MOCKS=false            (flips every method to `request()`)
 *    3. Delete the mock branch of any method once its endpoint exists.
 *
 *  Each method already shows the HTTP verb and path it expects, so the
 *  Express routes can be written straight from this file.
 */

import {
  USERS,
  CURRENT_USER,
  PROJECTS,
  NOTES,
  FILES,
  ACTIVITIES,
  NOTIFICATIONS,
  ANALYTICS,
  CONVERSATIONS,
  SESSIONS,
  SAMPLE_README,
  AI_SAMPLES,
} from '../data/mockData.js';

const ENV = import.meta.env || {};

export const API_BASE_URL = ENV.VITE_API_URL || 'http://localhost:5000/api';
export const USE_MOCKS = ENV.VITE_USE_MOCKS !== 'false';
export const TOKEN_KEY = 'collabsphere.token';

/* -------------------------------------------------------------------------- */
/*  Real HTTP client — already wired, simply unused while USE_MOCKS is true    */
/* -------------------------------------------------------------------------- */

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — session stays in memory */
  }
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const payload = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(payload?.message || `Request failed (${res.status})`, res.status, payload);
  }
  return payload;
}

/* -------------------------------------------------------------------------- */
/*  Mock backend — an in-memory store so created/edited items survive a session */
/* -------------------------------------------------------------------------- */

const clone = (value) => JSON.parse(JSON.stringify(value));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const latency = () => wait(320 + Math.random() * 380);

export const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const mockDb = {
  users: clone(USERS),
  projects: clone(PROJECTS),
  notes: clone(NOTES),
  files: clone(FILES),
  activities: clone(ACTIVITIES),
  notifications: clone(NOTIFICATIONS),
  conversations: clone(CONVERSATIONS),
  sessions: clone(SESSIONS),
  session: null,
};

const logActivity = (type, projectId, target, actorId = CURRENT_USER._id) => {
  mockDb.activities.unshift({
    _id: makeId('a'),
    type,
    actorId,
    projectId,
    target,
    at: new Date().toISOString(),
  });
};

/* -------------------------------------------------------------------------- */
/*  authAPI          →  POST /auth/*                                          */
/* -------------------------------------------------------------------------- */

export const authAPI = {
  /** POST /auth/login */
  async login({ email, password }) {
    if (!USE_MOCKS) return request('/auth/login', { method: 'POST', body: { email, password } });
    await latency();
    if (!email || !password) throw new ApiError('Enter your email and password.', 400);
    if (password.length < 6) throw new ApiError('That password does not match our records.', 401);
    const user = mockDb.users.find((u) => u.email === email) || clone(CURRENT_USER);
    setToken('mock.jwt.token');
    mockDb.session = user;
    return { user, token: 'mock.jwt.token' };
  },

  /** POST /auth/register */
  async register({ name, username, email }) {
    if (!USE_MOCKS) return request('/auth/register', { method: 'POST', body: arguments[0] });
    await latency();
    if (mockDb.users.some((u) => u.username === username)) {
      throw new ApiError('That username is taken.', 409, { field: 'username' });
    }
    const user = {
      ...clone(CURRENT_USER),
      _id: makeId('u'),
      name,
      username,
      email,
      joinedAt: new Date().toISOString(),
    };
    mockDb.users.push(user);
    setToken('mock.jwt.token');
    mockDb.session = user;
    return { user, token: 'mock.jwt.token' };
  },

  /** GET /auth/me */
  async me() {
    if (!USE_MOCKS) return request('/auth/me');
    await wait(180);
    return mockDb.session || clone(CURRENT_USER);
  },

  /** POST /auth/logout */
  async logout() {
    if (!USE_MOCKS) return request('/auth/logout', { method: 'POST' });
    await wait(150);
    setToken(null);
    mockDb.session = null;
    return { ok: true };
  },

  /** POST /auth/forgot-password */
  async forgotPassword({ email }) {
    if (!USE_MOCKS) return request('/auth/forgot-password', { method: 'POST', body: { email } });
    await latency();
    return { ok: true, email };
  },

  /** POST /auth/reset-password */
  async resetPassword({ token, password }) {
    if (!USE_MOCKS) return request('/auth/reset-password', { method: 'POST', body: { token, password } });
    await latency();
    return { ok: true };
  },

  /** POST /auth/verify-email */
  async verifyEmail({ code }) {
    if (!USE_MOCKS) return request('/auth/verify-email', { method: 'POST', body: { code } });
    await latency();
    if (String(code).length !== 6) throw new ApiError('That code is not valid. Check the six digits and try again.', 400);
    return { ok: true };
  },

  /** PATCH /auth/password */
  async changePassword({ current, next }) {
    if (!USE_MOCKS) return request('/auth/password', { method: 'PATCH', body: { current, next } });
    await latency();
    if (!current) throw new ApiError('Enter your current password.', 400);
    return { ok: true };
  },

  /** GET /auth/sessions */
  async sessions() {
    if (!USE_MOCKS) return request('/auth/sessions');
    await wait(240);
    return clone(mockDb.sessions);
  },

  /** DELETE /auth/sessions */
  async revokeSessions() {
    if (!USE_MOCKS) return request('/auth/sessions', { method: 'DELETE' });
    await latency();
    mockDb.sessions = mockDb.sessions.filter((s) => s.current);
    return clone(mockDb.sessions);
  },
};

/* -------------------------------------------------------------------------- */
/*  userAPI          →  /users/*                                              */
/* -------------------------------------------------------------------------- */

export const userAPI = {
  /** GET /users */
  async list(query = '') {
    if (!USE_MOCKS) return request(`/users?q=${encodeURIComponent(query)}`);
    await wait(220);
    const q = query.trim().toLowerCase();
    return clone(
      mockDb.users.filter(
        (u) => !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
      )
    );
  },

  /** GET /users/:id */
  async get(id) {
    if (!USE_MOCKS) return request(`/users/${id}`);
    await wait(200);
    return clone(mockDb.users.find((u) => u._id === id) || CURRENT_USER);
  },

  /** PATCH /users/me */
  async updateProfile(patch) {
    if (!USE_MOCKS) return request('/users/me', { method: 'PATCH', body: patch });
    await latency();
    const me = mockDb.users.find((u) => u._id === CURRENT_USER._id);
    Object.assign(me, patch);
    mockDb.session = me;
    return clone(me);
  },
};

/* -------------------------------------------------------------------------- */
/*  projectAPI       →  /projects/*                                           */
/* -------------------------------------------------------------------------- */

export const projectAPI = {
  /** GET /projects?scope&q&status&sort */
  async list({ scope = 'all', q = '', status = 'all', visibility = 'all', sort = 'recent' } = {}) {
    if (!USE_MOCKS) {
      const params = new URLSearchParams({ scope, q, status, visibility, sort });
      return request(`/projects?${params}`);
    }
    await latency();
    let rows = clone(mockDb.projects);
    if (scope === 'mine') rows = rows.filter((p) => p.ownerId === CURRENT_USER._id);
    if (scope === 'shared') rows = rows.filter((p) => p.ownerId !== CURRENT_USER._id);
    if (scope === 'starred') rows = rows.filter((p) => p.starred);
    if (status !== 'all') rows = rows.filter((p) => p.status === status);
    if (visibility !== 'all') rows = rows.filter((p) => p.visibility === visibility);
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          p.techStack.some((t) => t.toLowerCase().includes(needle))
      );
    }
    const sorters = {
      recent: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      name: (a, b) => a.name.localeCompare(b.name),
      progress: (a, b) => b.progress - a.progress,
      members: (a, b) => b.members.length - a.members.length,
      created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    };
    return rows.sort(sorters[sort] || sorters.recent);
  },

  /** GET /projects/:id */
  async get(id) {
    if (!USE_MOCKS) return request(`/projects/${id}`);
    await wait(360);
    const project = mockDb.projects.find((p) => p._id === id);
    if (!project) throw new ApiError('That project does not exist, or you no longer have access.', 404);
    return clone(project);
  },

  /** GET /public/projects/:id */
  async getPublic(id) {
    if (!USE_MOCKS) return request(`/public/projects/${id}`);
    await wait(420);
    const project = mockDb.projects.find((p) => p._id === id);
    if (!project) throw new ApiError('No public project at this address.', 404);
    return clone(project);
  },

  /** POST /projects */
  async create(payload) {
    if (!USE_MOCKS) return request('/projects', { method: 'POST', body: payload });
    await latency();
    const project = {
      _id: makeId('p'),
      slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      ownerId: CURRENT_USER._id,
      members: [{ userId: CURRENT_USER._id, role: 'Owner', joinedAt: new Date().toISOString() }],
      status: 'active',
      progress: 0,
      starred: false,
      accent: '#6e8bff',
      counts: { notes: 0, files: 0, members: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      techStack: [],
      visibility: 'private',
      ...payload,
    };
    mockDb.projects.unshift(project);
    logActivity('project_created', project._id, project.name);
    return clone(project);
  },

  /** PATCH /projects/:id */
  async update(id, patch) {
    if (!USE_MOCKS) return request(`/projects/${id}`, { method: 'PATCH', body: patch });
    await latency();
    const project = mockDb.projects.find((p) => p._id === id);
    Object.assign(project, patch, { updatedAt: new Date().toISOString() });
    return clone(project);
  },

  /** DELETE /projects/:id */
  async remove(id) {
    if (!USE_MOCKS) return request(`/projects/${id}`, { method: 'DELETE' });
    await latency();
    mockDb.projects = mockDb.projects.filter((p) => p._id !== id);
    return { ok: true };
  },

  /** POST /projects/:id/star */
  async toggleStar(id) {
    if (!USE_MOCKS) return request(`/projects/${id}/star`, { method: 'POST' });
    await wait(140);
    const project = mockDb.projects.find((p) => p._id === id);
    project.starred = !project.starred;
    return clone(project);
  },

  /** GET /projects/:id/activity */
  async activity(projectId) {
    if (!USE_MOCKS) return request(`/projects/${projectId}/activity`);
    await wait(280);
    return clone(mockDb.activities.filter((a) => a.projectId === projectId));
  },
};

/* -------------------------------------------------------------------------- */
/*  notesAPI         →  /notes/*                                              */
/* -------------------------------------------------------------------------- */

export const notesAPI = {
  /** GET /notes?projectId&q&tag&sort */
  async list({ projectId, q = '', tag = 'all', sort = 'recent' } = {}) {
    if (!USE_MOCKS) {
      const params = new URLSearchParams({ projectId: projectId || '', q, tag, sort });
      return request(`/notes?${params}`);
    }
    await latency();
    let rows = clone(mockDb.notes);
    if (projectId) rows = rows.filter((n) => n.projectId === projectId);
    if (tag !== 'all') rows = rows.filter((n) => n.tags.includes(tag));
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (n) => n.title.toLowerCase().includes(needle) || n.content.toLowerCase().includes(needle)
      );
    }
    const sorters = {
      recent: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      title: (a, b) => a.title.localeCompare(b.title),
      created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    };
    return rows.sort(sorters[sort] || sorters.recent);
  },

  /** GET /notes/:id */
  async get(id) {
    if (!USE_MOCKS) return request(`/notes/${id}`);
    await wait(300);
    const note = mockDb.notes.find((n) => n._id === id);
    if (!note) throw new ApiError('This note has been deleted or moved.', 404);
    return clone(note);
  },

  /** POST /notes */
  async create(payload) {
    if (!USE_MOCKS) return request('/notes', { method: 'POST', body: payload });
    await latency();
    const note = {
      _id: makeId('n'),
      authorId: CURRENT_USER._id,
      tags: [],
      visibility: 'private',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    };
    mockDb.notes.unshift(note);
    logActivity('note_created', note.projectId, note.title);
    return clone(note);
  },

  /** PATCH /notes/:id */
  async update(id, patch) {
    if (!USE_MOCKS) return request(`/notes/${id}`, { method: 'PATCH', body: patch });
    await wait(420);
    const note = mockDb.notes.find((n) => n._id === id);
    Object.assign(note, patch, { updatedAt: new Date().toISOString() });
    logActivity('note_updated', note.projectId, note.title);
    return clone(note);
  },

  /** DELETE /notes/:id */
  async remove(id) {
    if (!USE_MOCKS) return request(`/notes/${id}`, { method: 'DELETE' });
    await latency();
    mockDb.notes = mockDb.notes.filter((n) => n._id !== id);
    return { ok: true };
  },
};

/* -------------------------------------------------------------------------- */
/*  fileAPI          →  /files/*   (uploads go out as multipart/form-data)    */
/* -------------------------------------------------------------------------- */

export const fileAPI = {
  /** GET /files?projectId&q&type&sort */
  async list({ projectId, q = '', type = 'all', sort = 'recent' } = {}) {
    if (!USE_MOCKS) {
      const params = new URLSearchParams({ projectId: projectId || '', q, type, sort });
      return request(`/files?${params}`);
    }
    await latency();
    let rows = clone(mockDb.files);
    if (projectId) rows = rows.filter((f) => f.projectId === projectId);
    if (type !== 'all') rows = rows.filter((f) => f.type === type);
    if (q) rows = rows.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
    const sorters = {
      recent: (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt),
      name: (a, b) => a.name.localeCompare(b.name),
      size: (a, b) => b.size - a.size,
    };
    return rows.sort(sorters[sort] || sorters.recent);
  },

  /** GET /files/:id */
  async get(id) {
    if (!USE_MOCKS) return request(`/files/${id}`);
    await wait(260);
    return clone(mockDb.files.find((f) => f._id === id));
  },

  /**
   * POST /files  (multipart)
   * Real implementation:
   *   const form = new FormData();
   *   form.append('file', file); form.append('projectId', projectId);
   *   return request('/files', { method: 'POST', body: form });
   */
  async upload({ file, projectId, onProgress }) {
    if (!USE_MOCKS) {
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', projectId);
      return request('/files', { method: 'POST', body: form });
    }
    for (let p = 0; p <= 100; p += 20) {
      onProgress?.(p);
      await wait(120);
    }
    const record = {
      _id: makeId('f'),
      projectId,
      name: file.name,
      type: detectFileType(file.name),
      size: file.size,
      uploadedById: CURRENT_USER._id,
      uploadedAt: new Date().toISOString(),
      content: null,
    };
    mockDb.files.unshift(record);
    logActivity('file_uploaded', projectId, record.name);
    return clone(record);
  },

  /** DELETE /files/:id */
  async remove(id) {
    if (!USE_MOCKS) return request(`/files/${id}`, { method: 'DELETE' });
    await latency();
    mockDb.files = mockDb.files.filter((f) => f._id !== id);
    return { ok: true };
  },

  /** GET /files/:id/download  →  responds with a signed URL in production */
  async download(id) {
    if (!USE_MOCKS) return request(`/files/${id}/download`);
    await wait(200);
    return { url: `#/mock-download/${id}` };
  },
};

export function detectFileType(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx', 'mjs'].includes(ext)) return 'javascript';
  if (['py'].includes(ext)) return 'python';
  if (['html', 'htm'].includes(ext)) return 'html';
  if (['css', 'scss'].includes(ext)) return 'css';
  if (['json'].includes(ext)) return 'json';
  if (['md', 'mdx'].includes(ext)) return 'markdown';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  return 'other';
}

/* -------------------------------------------------------------------------- */
/*  memberAPI        →  /projects/:id/members/*                               */
/* -------------------------------------------------------------------------- */

export const memberAPI = {
  /** GET /projects/:id/members */
  async list(projectId) {
    if (!USE_MOCKS) return request(`/projects/${projectId}/members`);
    await wait(320);
    const project = mockDb.projects.find((p) => p._id === projectId);
    return clone(
      project.members.map((m) => ({
        ...m,
        user: mockDb.users.find((u) => u._id === m.userId),
      }))
    );
  },

  /** POST /projects/:id/members */
  async add(projectId, { userId, role = 'Member' }) {
    if (!USE_MOCKS) return request(`/projects/${projectId}/members`, { method: 'POST', body: { userId, role } });
    await latency();
    const project = mockDb.projects.find((p) => p._id === projectId);
    if (project.members.some((m) => m.userId === userId)) {
      throw new ApiError('They are already on this project.', 409);
    }
    project.members.push({ userId, role, joinedAt: new Date().toISOString() });
    project.counts.members = project.members.length;
    logActivity('member_joined', projectId, project.name, userId);
    return clone(project.members);
  },

  /** PATCH /projects/:id/members/:userId */
  async updateRole(projectId, userId, role) {
    if (!USE_MOCKS) return request(`/projects/${projectId}/members/${userId}`, { method: 'PATCH', body: { role } });
    await wait(280);
    const project = mockDb.projects.find((p) => p._id === projectId);
    const m = project.members.find((x) => x.userId === userId);
    m.role = role;
    return clone(project.members);
  },

  /** DELETE /projects/:id/members/:userId */
  async remove(projectId, userId) {
    if (!USE_MOCKS) return request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
    await latency();
    const project = mockDb.projects.find((p) => p._id === projectId);
    project.members = project.members.filter((m) => m.userId !== userId);
    project.counts.members = project.members.length;
    return clone(project.members);
  },
};

/* -------------------------------------------------------------------------- */
/*  analyticsAPI     →  /analytics/*                                          */
/* -------------------------------------------------------------------------- */

export const analyticsAPI = {
  /** GET /analytics?range=30d&projectId= */
  async overview({ range = '30d', projectId } = {}) {
    if (!USE_MOCKS) {
      const params = new URLSearchParams({ range, projectId: projectId || '' });
      return request(`/analytics?${params}`);
    }
    await wait(560);
    const points = range === '7d' ? 7 : range === '90d' ? 30 : 30;
    const data = clone(ANALYTICS);
    if (range === '7d') {
      data.labels = data.labels.slice(-7);
      data.activity = data.activity.slice(-7);
      data.notesCreated = data.notesCreated.slice(-7);
      data.filesUploaded = data.filesUploaded.slice(-7);
      data.aiUsage = data.aiUsage.slice(-7);
    }
    data.contributions = data.contributions.map((c) => ({
      ...c,
      user: mockDb.users.find((u) => u._id === c.userId),
    }));
    data.points = points;
    return data;
  },

  /** GET /analytics/dashboard — the five stat cards on the dashboard */
  async summary() {
    if (!USE_MOCKS) return request('/analytics/dashboard');
    await wait(300);
    const mine = mockDb.projects;
    return {
      projects: { value: mine.length, delta: 8.3 },
      active: { value: mine.filter((p) => p.status === 'active').length, delta: 4.1 },
      members: { value: mockDb.users.length, delta: 16.7 },
      files: { value: mockDb.files.length, delta: 9.2 },
      notes: { value: mockDb.notes.length, delta: 12.4 },
    };
  },
};

/* -------------------------------------------------------------------------- */
/*  notificationAPI  →  /notifications/*                                      */
/* -------------------------------------------------------------------------- */

export const notificationAPI = {
  /** GET /notifications */
  async list() {
    if (!USE_MOCKS) return request('/notifications');
    await wait(260);
    return clone(mockDb.notifications);
  },

  /** PATCH /notifications/:id/read */
  async markRead(id) {
    if (!USE_MOCKS) return request(`/notifications/${id}/read`, { method: 'PATCH' });
    await wait(120);
    const item = mockDb.notifications.find((n) => n._id === id);
    if (item) item.read = true;
    return clone(mockDb.notifications);
  },

  /** PATCH /notifications/read-all */
  async markAllRead() {
    if (!USE_MOCKS) return request('/notifications/read-all', { method: 'PATCH' });
    await wait(200);
    mockDb.notifications = mockDb.notifications.map((n) => ({ ...n, read: true }));
    return clone(mockDb.notifications);
  },
};

/* -------------------------------------------------------------------------- */
/*  activityAPI + searchAPI                                                    */
/* -------------------------------------------------------------------------- */

export const activityAPI = {
  /** GET /activity?limit= */
  async recent(limit = 8) {
    if (!USE_MOCKS) return request(`/activity?limit=${limit}`);
    await wait(280);
    return clone(mockDb.activities.slice(0, limit)).map((a) => ({
      ...a,
      actor: mockDb.users.find((u) => u._id === a.actorId),
      project: mockDb.projects.find((p) => p._id === a.projectId),
    }));
  },
};

export const searchAPI = {
  /** GET /search?q= — one endpoint, results grouped by kind */
  async query(q) {
    if (!USE_MOCKS) return request(`/search?q=${encodeURIComponent(q)}`);
    await wait(240);
    const needle = q.trim().toLowerCase();
    if (!needle) return { projects: [], notes: [], files: [], members: [] };
    return {
      projects: clone(mockDb.projects.filter((p) => p.name.toLowerCase().includes(needle))).slice(0, 5),
      notes: clone(mockDb.notes.filter((n) => n.title.toLowerCase().includes(needle))).slice(0, 5),
      files: clone(mockDb.files.filter((f) => f.name.toLowerCase().includes(needle))).slice(0, 5),
      members: clone(
        mockDb.users.filter(
          (u) => u.name.toLowerCase().includes(needle) || u.username.toLowerCase().includes(needle)
        )
      ).slice(0, 5),
    };
  },
};

/* -------------------------------------------------------------------------- */
/*  geminiAPI        →  /ai/*                                                 */
/* -------------------------------------------------------------------------- */
/*  The model is never called from the browser. These methods post to your     */
/*  Express routes, which hold the API key and call the model server-side.     */
/* -------------------------------------------------------------------------- */

const pickSample = (prompt = '') => {
  const p = prompt.toLowerCase();
  if (p.includes('readme')) return SAMPLE_README;
  if (p.includes('issue') || p.includes('bug') || p.includes('wrong')) return AI_SAMPLES.findIssues;
  if (p.includes('improve') || p.includes('rewrite')) return AI_SAMPLES.improveNote;
  if (p.includes('document')) return AI_SAMPLES.generateDocs;
  if (p.includes('explain') && p.includes('note')) return AI_SAMPLES.explainNote;
  if (p.includes('explain') || p.includes('code')) return AI_SAMPLES.explainCode;
  return AI_SAMPLES.generic;
};

export const geminiAPI = {
  /** GET /ai/conversations */
  async conversations() {
    if (!USE_MOCKS) return request('/ai/conversations');
    await wait(240);
    return clone(mockDb.conversations);
  },

  /** POST /ai/chat  { prompt, context, history } */
  async chat({ prompt, context, history = [] }) {
    if (!USE_MOCKS) return request('/ai/chat', { method: 'POST', body: { prompt, context, history } });
    await wait(900 + Math.random() * 700);
    return {
      id: makeId('m'),
      role: 'assistant',
      at: new Date().toISOString(),
      content: pickSample(prompt),
      usage: { promptTokens: 420, completionTokens: 610 },
    };
  },

  /** POST /ai/explain-code  { fileId, code } */
  async explainCode({ fileId }) {
    if (!USE_MOCKS) return request('/ai/explain-code', { method: 'POST', body: { fileId } });
    await wait(1100);
    return { content: AI_SAMPLES.explainCode };
  },

  /** POST /ai/explain-note  { noteId } */
  async explainNote({ noteId }) {
    if (!USE_MOCKS) return request('/ai/explain-note', { method: 'POST', body: { noteId } });
    await wait(1000);
    return { content: AI_SAMPLES.explainNote };
  },

  /** POST /ai/improve-note  { noteId, content } */
  async improveNote({ noteId }) {
    if (!USE_MOCKS) return request('/ai/improve-note', { method: 'POST', body: { noteId } });
    await wait(1200);
    return { content: AI_SAMPLES.improveNote };
  },

  /** POST /ai/generate-readme  { projectId, ...form } */
  async generateReadme(form) {
    if (!USE_MOCKS) return request('/ai/generate-readme', { method: 'POST', body: form });
    await wait(1600);
    return { content: buildReadme(form) };
  },

  /** GET /ai/usage */
  async usage() {
    if (!USE_MOCKS) return request('/ai/usage');
    await wait(200);
    return { used: 312, limit: 1000, resetsAt: 'in 13 days', model: 'server-side model', status: 'operational' };
  },
};

/** Assembles a README from the generator form. Replaced by the model response later. */
function buildReadme(form = {}) {
  const {
    name = 'Untitled project',
    description = '',
    techStack = [],
    features = '',
    installation = '',
    usage = '',
    envVars = '',
    contributing = '',
  } = form;

  const list = (block) =>
    String(block)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => `- ${l.replace(/^[-*]\s*/, '')}`)
      .join('\n');

  const fence = '```';
  const stack = Array.isArray(techStack) ? techStack : String(techStack).split(',').map((s) => s.trim());

  return [
    `# ${name}`,
    '',
    description || 'A CollabSphere project.',
    '',
    stack.filter(Boolean).length ? `**Built with:** ${stack.filter(Boolean).join(' · ')}` : '',
    '',
    '## Features',
    '',
    features ? list(features) : '- Documented in project notes',
    '',
    '## Installation',
    '',
    `${fence}bash`,
    installation || `git clone <repository-url>\ncd ${String(name).toLowerCase().replace(/\s+/g, '-')}\nnpm install`,
    fence,
    '',
    '## Usage',
    '',
    `${fence}bash`,
    usage || 'npm run dev',
    fence,
    '',
    envVars ? '## Environment variables\n' : '',
    envVars
      ? `| Variable | Description |\n| --- | --- |\n${String(envVars)
          .split('\n')
          .filter(Boolean)
          .map((line) => {
            const [key, ...rest] = line.split('=');
            return `| \`${key.trim()}\` | ${rest.join('=').trim() || 'Required'} |`;
          })
          .join('\n')}\n`
      : '',
    '## Contributing',
    '',
    contributing || 'Branch from `main`, keep commits scoped, and open a pull request with a short summary of the change.',
    '',
    '## License',
    '',
    'MIT',
  ]
    .filter((part) => part !== '')
    .join('\n');
}

export default {
  authAPI,
  userAPI,
  projectAPI,
  notesAPI,
  fileAPI,
  memberAPI,
  analyticsAPI,
  notificationAPI,
  activityAPI,
  searchAPI,
  geminiAPI,
};
