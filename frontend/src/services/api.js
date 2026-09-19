const ENV = import.meta.env || {};

export const API_BASE_URL = ENV.VITE_API_URL || 'http://localhost:5000/api';
export const TOKEN_KEY = 'collabsphere.token';

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
    /* localStorage can be unavailable in private/embedded contexts. */
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
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
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
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(
      `Cannot reach the CollabSphere API at ${API_BASE_URL}. Make sure the backend server is running and VITE_API_URL is correct.`,
      0,
      { cause: err?.message }
    );
  }

  const payload = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const message = payload?.errors?.[0]?.message || payload?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, payload);
  }
  return payload;
}

const unwrap = (payload) => payload?.data ?? payload ?? {};
const unwrapList = (payload, key) => unwrap(payload)[key] ?? [];
const unwrapOne = (payload, key) => unwrap(payload)[key] ?? unwrap(payload);
const asArray = (value) => (Array.isArray(value) ? value : []);
const asId = (value) => (value && typeof value === 'object' ? value._id || value.id : value);
const titleCase = (value = '') => String(value).slice(0, 1).toUpperCase() + String(value).slice(1);
const toList = (value, separator = ',') =>
  (Array.isArray(value) ? value : String(value || '').split(separator))
    .map((item) => String(item).trim())
    .filter(Boolean);

function sortRows(rows, sort, dateKey = 'updatedAt') {
  const copy = [...rows];
  const sorters = {
    recent: (a, b) => new Date(b[dateKey] || b.createdAt || 0) - new Date(a[dateKey] || a.createdAt || 0),
    created: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    title: (a, b) => String(a.title || '').localeCompare(String(b.title || '')),
    name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
    size: (a, b) => (b.size || 0) - (a.size || 0),
    members: (a, b) => asArray(b.members).length - asArray(a.members).length,
  };
  return copy.sort(sorters[sort] || sorters.recent);
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    _id: user._id || user.id,
    name: user.name || user.username || user.email || 'Unknown user',
    username: user.username || String(user.email || '').split('@')[0] || 'user',
  };
}

function normalizeMember(member) {
  const user = normalizeUser(member?.user);
  const userId = asId(member?.user) || member?.userId;
  const role = String(member?.role || 'member').toLowerCase();
  return {
    ...member,
    user,
    userId,
    role: titleCase(role),
    joinedAt: member?.joinedAt,
  };
}

function detectAccent(id = '') {
  const colors = ['#6e8bff', '#39c5bb', '#f472b6', '#a177ff', '#4ade80', '#ffb86b'];
  return colors[String(id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
}

function normalizeProject(project) {
  if (!project) return null;
  const members = asArray(project.members).map(normalizeMember);
  const owner = normalizeUser(project.owner);
  const ownerId = asId(project.owner) || project.ownerId || members.find((m) => m.role === 'Owner')?.userId;
  const technologies = asArray(project.technologies || project.techStack);

  return {
    ...project,
    _id: project._id || project.id,
    updatedAt: project.updatedAt || project.createdAt,
    owner,
    ownerId,
    members,
    techStack: technologies,
    technologies,
    status: project.status || 'active',
    progress: project.progress ?? 0,
    starred: Boolean(project.starred),
    accent: project.accent || detectAccent(project._id || project.id),
    visibility: project.visibility || 'private',
    readme: project.readme || '',
    counts: {
      notes: project.counts?.notes ?? 0,
      files: project.counts?.files ?? 0,
      members: members.length,
      ...project.counts,
    },
  };
}

function normalizeNote(note) {
  if (!note) return null;
  const author = normalizeUser(note.author);
  return {
    ...note,
    _id: note._id || note.id,
    projectId: asId(note.project) || note.projectId,
    author,
    authorId: asId(note.author) || note.authorId,
    tags: asArray(note.tags),
    visibility: note.visibility || 'private',
  };
}

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

function normalizeFile(file, preview) {
  if (!file) return null;
  const name = file.name || file.originalName || file.fileName || 'Untitled file';
  const uploadedBy = normalizeUser(file.uploadedBy);
  return {
    ...file,
    _id: file._id || file.id,
    name,
    projectId: asId(file.project) || file.projectId,
    uploadedBy,
    uploadedById: asId(file.uploadedBy) || file.uploadedById,
    uploadedAt: file.uploadedAt || file.createdAt,
    type: file.type || detectFileType(name),
    content: preview?.kind === 'text' ? preview.content : file.content,
    preview,
    rawUrl: file.url ? `${API_BASE_URL.replace(/\/api$/, '')}${file.url}` : `${API_BASE_URL}/files/${file._id || file.id}/raw`,
  };
}

function normalizeActivity(item, project) {
  if (!item) return null;
  return {
    ...item,
    _id: item._id || item.id,
    type: String(item.type || '').toLowerCase(),
    actor: normalizeUser(item.user || item.actor),
    actorId: asId(item.user || item.actor),
    project: project || normalizeProject(item.project),
    projectId: asId(item.project) || project?._id,
    target: item.metadata?.noteId || item.metadata?.fileId || item.message,
    at: item.createdAt || item.at,
  };
}

function normalizeNotification(item) {
  if (!item) return null;
  const sender = normalizeUser(item.sender);
  const project = normalizeProject(item.project);
  return {
    ...item,
    _id: item._id || item.id,
    type: String(item.type || '').toLowerCase(),
    actor: sender,
    actorId: sender?._id,
    project,
    projectId: project?._id || asId(item.project),
    title: item.title || item.message,
    body: item.body || item.message,
    at: item.createdAt || item.at,
  };
}

function projectPayload(form = {}) {
  return {
    name: form.name,
    description: form.description || '',
    technologies: asArray(form.techStack || form.technologies),
    visibility: form.visibility || 'private',
    readme: form.readme || '',
  };
}

function notePayload(form = {}) {
  return { title: form.title, content: form.content || '' };
}

function rolePayload(role = 'member') {
  return String(role).toLowerCase();
}

async function listAllProjectRows(projectId, loader) {
  if (projectId) return loader(projectId);
  const projects = await projectAPI.list();
  const lists = await Promise.all(projects.map((project) => loader(project._id).catch(() => [])));
  return lists.flat();
}

function makeLabels(days) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });
}

function emptySeries(days) {
  return Array.from({ length: days }, () => 0);
}

function fileMix(files) {
  const counts = files.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function analyticsFromProjects(projects, analytics, range, files) {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const labels = makeLabels(days);
  const activity = emptySeries(days);
  const contributionMap = new Map();
  const totals = { notes: 0, files: 0, activeMembers: 0, activityEvents: 0, aiCalls: 0 };

  analytics.forEach(({ project, data }) => {
    totals.notes += data.totalNotes || 0;
    totals.files += data.totalFiles || 0;
    totals.activityEvents += data.totalActivity || 0;
    totals.activeMembers += data.totalMembers || 0;
    asArray(data.activityOverTime).forEach((point) => {
      const label = new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const index = labels.indexOf(label);
      if (index >= 0) activity[index] += point.count || 0;
    });
    asArray(data.memberContributions).forEach((row) => {
      const user = normalizeUser(row.user);
      if (!user?._id) return;
      const existing = contributionMap.get(user._id) || { userId: user._id, user, notes: 0, files: 0, activity: 0 };
      existing.notes += row.notes || 0;
      existing.files += row.files || 0;
      existing.activity += (row.notes || 0) + (row.files || 0);
      contributionMap.set(user._id, existing);
    });
    asArray(project.members).forEach((member) => {
      const user = normalizeUser(member.user);
      if (!user?._id || contributionMap.has(user._id)) return;
      contributionMap.set(user._id, { userId: user._id, user, notes: 0, files: 0, activity: 0 });
    });
  });

  const contributions = [...contributionMap.values()].map((row) => ({
    ...row,
    share: totals.activityEvents ? Math.round((row.activity / totals.activityEvents) * 100) : 0,
  }));

  return {
    totals,
    deltas: { notes: 0, files: 0, activeMembers: 0, activityEvents: 0, aiCalls: 0 },
    labels,
    activity,
    notesCreated: emptySeries(days),
    filesUploaded: emptySeries(days),
    aiUsage: emptySeries(days),
    weekLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weekActivity: emptySeries(7),
    fileMix: fileMix(files),
    contributions,
    projects,
  };
}

export const authAPI = {
  async login({ email, password }) {
    const data = unwrap(await request('/auth/login', { method: 'POST', body: { email, password } }));
    setToken(data.token);
    return { user: normalizeUser(data.user), token: data.token };
  },

  async register(payload) {
    const data = unwrap(await request('/auth/register', { method: 'POST', body: payload }));
    setToken(null);
    return { ...data, user: normalizeUser(data.user) };
  },

  async me() {
    return normalizeUser(unwrapOne(await request('/auth/me'), 'user'));
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
    }
    return { ok: true };
  },

  async forgotPassword({ email }) {
    return unwrap(await request('/auth/forgot-password', { method: 'POST', body: { email } }));
  },

  async verifyResetOtp({ email, otp }) {
    return unwrap(await request('/auth/verify-reset-otp', { method: 'POST', body: { email, otp } }));
  },

  async resetPassword({ email, password, confirm }) {
    return unwrap(await request('/auth/reset-password', { method: 'POST', body: { email, password, confirm } }));
  },

  async changePassword({ current, next }) {
    return unwrap(await request('/users/me/password', { method: 'PUT', body: { currentPassword: current, newPassword: next } }));
  },

};

export const userAPI = {
  async get(id) {
    return normalizeUser(unwrapOne(await request(`/users/${id}`), 'user'));
  },

  async updateProfile(patch) {
    return normalizeUser(unwrapOne(await request('/users/me', { method: 'PUT', body: patch }), 'user'));
  },
};

export const projectAPI = {
  async list({ q = '', search = '', sort = 'recent', scope = 'all' } = {}) {
    const params = new URLSearchParams({ limit: '100', scope });
    const term = search || q;
    if (term) params.set('search', term);
    const rows = unwrapList(await request(`/projects?${params}`), 'projects').map(normalizeProject);
    return sortRows(rows, sort);
  },

  async get(id) {
    return normalizeProject(unwrapOne(await request(`/projects/${id}`), 'project'));
  },

  async getPublic(token) {
    const data = unwrap(await request(`/public/projects/${token}`));
    const project = normalizeProject({
      ...data.project,
      _id: data.project?._id || data.project?.id || id,
      visibility: 'public',
      members: asArray(data.contributors).map((user) => ({ user, role: 'member' })),
    });
    return {
      ...project,
      notes: asArray(data.notes).map((note) => normalizeNote({ ...note, project: project._id, visibility: 'public' })),
      files: asArray(data.files).map((file) => normalizeFile({ ...file, project: project._id })),
      contributors: asArray(data.contributors).map(normalizeUser),
    };
  },

  async create(payload) {
    return normalizeProject(unwrapOne(await request('/projects', { method: 'POST', body: projectPayload(payload) }), 'project'));
  },

  async update(id, patch) {
    return normalizeProject(unwrapOne(await request(`/projects/${id}`, { method: 'PUT', body: projectPayload(patch) }), 'project'));
  },

  async remove(id) {
    await request(`/projects/${id}`, { method: 'DELETE' });
    return { ok: true };
  },

  async toggleStar(id) {
    return this.get(id);
  },

  async activity(projectId) {
    const data = unwrap(await request(`/projects/${projectId}/analytics`));
    const project = await this.get(projectId).catch(() => null);
    return asArray(data.recentActivity).map((item) => normalizeActivity(item, project));
  },
};

export const githubAPI = {
  async connection() {
    const data = unwrap(await request('/github/connection'));
    return {
      ...data,
      connected: data.connected === true || data.githubConnected === true,
    };
  },

  async connect() {
    const data = unwrap(await request('/github/connect'));
    window.location.assign(data.url);
  },

  async repositories() {
    const data = unwrap(await request('/github/repositories'));
    return asArray(data.repositories || data);
  },

  async get(projectId) {
    return unwrapOne(await request(`/projects/${projectId}/github`), 'repository');
  },

  async import(projectId, url) {
    const body = typeof url === 'string' ? { url } : url;
    return unwrapOne(await request(`/projects/${projectId}/github/import`, { method: 'POST', body }), 'repository');
  },

  async sync(projectId) {
    return unwrapOne(await request(`/projects/${projectId}/github/sync`, { method: 'POST' }), 'repository');
  },

  async file(projectId, path, ref) {
    const params = new URLSearchParams({ path });
    if (ref) params.set('ref', ref);
    return unwrapOne(await request(`/projects/${projectId}/github/file?${params}`), 'file');
  },

  async commits(projectId, page = 1) {
    const data = unwrap(await request(`/projects/${projectId}/github/commits?page=${page}`));
    return asArray(data.commits);
  },

  async commit(projectId, sha) {
    return unwrapOne(await request(`/projects/${projectId}/github/commits/${sha}`), 'commit');
  },
};

export const notesAPI = {
  async list({ projectId, q = '', tag = 'all', sort = 'recent' } = {}) {
    const rows = await listAllProjectRows(projectId, async (id) => {
      const params = new URLSearchParams({ limit: '100' });
      if (q) params.set('search', q);
      return unwrapList(await request(`/projects/${id}/notes?${params}`), 'notes').map(normalizeNote);
    });
    const filtered = tag === 'all' ? rows : rows.filter((note) => note.tags.includes(tag));
    return sortRows(filtered, sort);
  },

  async get(id) {
    return normalizeNote(unwrapOne(await request(`/notes/${id}`), 'note'));
  },

  async create(payload) {
    const projectId = payload.projectId || asId(payload.project);
    if (!projectId) throw new ApiError('Choose a project before saving the note.', 400);
    return normalizeNote(unwrapOne(await request(`/projects/${projectId}/notes`, { method: 'POST', body: notePayload(payload) }), 'note'));
  },

  async update(id, patch) {
    return normalizeNote(unwrapOne(await request(`/notes/${id}`, { method: 'PUT', body: notePayload(patch) }), 'note'));
  },

  async remove(id) {
    await request(`/notes/${id}`, { method: 'DELETE' });
    return { ok: true };
  },
};

export const fileAPI = {
  async list({ projectId, q = '', type = 'all', sort = 'recent' } = {}) {
    const rows = await listAllProjectRows(projectId, async (id) => {
      const params = new URLSearchParams({ limit: '100' });
      if (q) params.set('search', q);
      return unwrapList(await request(`/projects/${id}/files?${params}`), 'files').map((file) => normalizeFile(file));
    });
    const filtered = type === 'all' ? rows : rows.filter((file) => file.type === type);
    return sortRows(filtered, sort, 'uploadedAt');
  },

  async get(id) {
    const data = unwrap(await request(`/files/${id}`));
    return normalizeFile(data.file, data.preview);
  },

  async upload({ file, projectId }) {
    if (!projectId) throw new ApiError('Choose a project before uploading.', 400);
    const form = new FormData();
    form.append('file', file);
    return normalizeFile(unwrapOne(await request(`/projects/${projectId}/files`, { method: 'POST', body: form }), 'file'));
  },

  async remove(id) {
    await request(`/files/${id}`, { method: 'DELETE' });
    return { ok: true };
  },

  async download(id) {
    return { url: `${API_BASE_URL}/files/${id}/raw` };
  },
};

export const memberAPI = {
  async list(projectId) {
    return unwrapList(await request(`/projects/${projectId}/members`), 'members').map(normalizeMember);
  },

  async search(projectId, q) {
    if (!q?.trim()) return [];
    return unwrapList(await request(`/projects/${projectId}/members/search?${new URLSearchParams({ q })}`), 'users').map(normalizeUser);
  },

  async add(projectId, { userId, username, email, role = 'member' }) {
    const data = unwrap(await request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: { userId, username, email, role: rolePayload(role) },
    }));
    return asArray(data.members).map(normalizeMember);
  },

  async updateRole(projectId, userId, role) {
    const data = unwrap(await request(`/projects/${projectId}/members/${userId}`, {
      method: 'PUT',
      body: { role: rolePayload(role) },
    }));
    return asArray(data.members).map(normalizeMember);
  },

  async remove(projectId, userId) {
    await request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
    return { ok: true };
  },
};

export const analyticsAPI = {
  async overview({ range = '30d', projectId } = {}) {
    if (projectId) {
      const data = unwrap(await request(`/projects/${projectId}/analytics`));
      const labels = makeLabels(30);
      const activity = emptySeries(30);
      asArray(data.activityOverTime).forEach((point) => {
        const index = labels.indexOf(new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        if (index >= 0) activity[index] = point.count || 0;
      });
      return {
        totals: {
          notes: data.totalNotes || 0,
          files: data.totalFiles || 0,
          activeMembers: data.totalMembers || 0,
          activityEvents: data.totalActivity || 0,
          aiCalls: 0,
        },
        deltas: { notes: 0, files: 0, activeMembers: 0, activityEvents: 0, aiCalls: 0 },
        labels,
        activity,
        notesCreated: emptySeries(30),
        filesUploaded: emptySeries(30),
        aiUsage: emptySeries(30),
        weekLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        weekActivity: emptySeries(7),
        fileMix: [],
        contributions: asArray(data.memberContributions).map((row) => ({
          userId: asId(row.user),
          user: normalizeUser(row.user),
          notes: row.notes || 0,
          files: row.files || 0,
          activity: (row.notes || 0) + (row.files || 0),
          share: 0,
        })),
        recentActivity: asArray(data.recentActivity).map(normalizeActivity),
      };
    }

    const [projects, files] = await Promise.all([projectAPI.list(), fileAPI.list()]);
    const analytics = await Promise.all(
      projects.map((project) =>
        request(`/projects/${project._id}/analytics`)
          .then((payload) => ({ project, data: unwrap(payload) }))
          .catch(() => ({ project, data: {} }))
      )
    );
    return analyticsFromProjects(projects, analytics, range, files);
  },

  async summary() {
    const [projects, notes, files] = await Promise.all([projectAPI.list(), notesAPI.list(), fileAPI.list()]);
    const uniqueMembers = new Set(projects.flatMap((project) => project.members.map((member) => member.userId).filter(Boolean)));
    return {
      projects: { value: projects.length, delta: 0 },
      active: { value: projects.filter((project) => project.status === 'active').length, delta: 0 },
      members: { value: uniqueMembers.size, delta: 0 },
      files: { value: files.length, delta: 0 },
      notes: { value: notes.length, delta: 0 },
    };
  },
};

export const notificationAPI = {
  async list() {
    return unwrapList(await request('/notifications?limit=100'), 'notifications').map(normalizeNotification);
  },

  async markRead(id) {
    await request(`/notifications/${id}/read`, { method: 'PATCH' });
    return this.list();
  },

  async markAllRead() {
    await request('/notifications/read-all', { method: 'PATCH' });
    return this.list();
  },

  async remove(id) {
    await request(`/notifications/${id}`, { method: 'DELETE' });
    return this.list();
  },
};

export const activityAPI = {
  async recent(limit = 8) {
    const projects = await projectAPI.list();
    const rows = await Promise.all(projects.map((project) => projectAPI.activity(project._id).catch(() => [])));
    return rows.flat().sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).slice(0, limit);
  },
};

export const searchAPI = {
  async query(q) {
    const data = unwrap(await request(`/search?${new URLSearchParams({ q })}`));
    return {
      projects: asArray(data.projects).map(normalizeProject),
      notes: asArray(data.notes).map((note) => normalizeNote(note)),
      files: asArray(data.files).map((file) => normalizeFile(file)),
      members: [],
    };
  },
};

export const geminiAPI = {
  async chat({ prompt, context }) {
    const result = unwrap(await request('/ai/explain', {
      method: 'POST',
      body: { content: prompt, type: context?.type === 'file' ? 'code' : 'note' },
    })).result;
    return { id: `ai_${Date.now()}`, role: 'assistant', at: new Date().toISOString(), content: result };
  },

  async explainCode({ fileId, code }) {
    let content = code;
    if (!content && fileId) {
      const file = await fileAPI.get(fileId);
      content = file.content || `${file.name}\n${file.mimeType || ''}`;
    }
    const result = unwrap(await request('/ai/explain', { method: 'POST', body: { content: content || '', type: 'code' } })).result;
    return { content: result };
  },

  async explainNote({ noteId, content }) {
    let source = content;
    if (!source && noteId && noteId !== 'draft') source = (await notesAPI.get(noteId)).content;
    const result = unwrap(await request('/ai/explain', { method: 'POST', body: { content: source || '', type: 'note', noteId: noteId !== 'draft' ? noteId : undefined } })).result;
    return { content: result };
  },

  async improveNote({ noteId, content }) {
    let source = content;
    if (!source && noteId && noteId !== 'draft') source = (await notesAPI.get(noteId)).content;
    const result = unwrap(await request('/ai/docs', { method: 'POST', body: { code: source || '', language: 'markdown', noteId: noteId !== 'draft' ? noteId : undefined } })).result;
    return { content: result };
  },

  async generateReadme(form) {
    const technologies = toList(form.technologies || form.techStack)
      .map((item) => item.trim())
      .filter(Boolean);
    const features = toList(form.features, '\n')
      .map((item) => item.trim().replace(/^[-*]\s*/, ''))
      .filter(Boolean);
    const data = unwrap(await request('/ai/readme', {
      method: 'POST',
      body: {
        ...form,
        projectName: form.projectName || form.name,
        technologies,
        features,
      },
    }));
    return { content: data.readme || data.result || '' };
  },

};

export const aiAPI = geminiAPI;

export default {
  authAPI,
  userAPI,
  projectAPI,
  githubAPI,
  notesAPI,
  fileAPI,
  memberAPI,
  analyticsAPI,
  notificationAPI,
  activityAPI,
  searchAPI,
  geminiAPI,
  aiAPI,
};
