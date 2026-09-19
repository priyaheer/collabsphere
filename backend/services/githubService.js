import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

const GITHUB_API = "https://api.github.com";
const USER_AGENT = "CollabSphere-GitHub-Import";

export function parseRepositoryUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || "").trim());
  } catch {
    throw ApiError.badRequest("Enter a valid GitHub repository URL");
  }

  if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") {
    throw ApiError.badRequest("Repository URL must be an https://github.com/owner/repository URL");
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) throw ApiError.badRequest("Repository URL must include an owner and repository name");
  const [owner, rawName] = parts;
  const name = rawName.replace(/\.git$/, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(name)) {
    throw ApiError.badRequest("Repository URL contains an invalid owner or repository name");
  }
  return { owner, name };
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": USER_AGENT,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubRequest(path, options = {}, token) {
  let response;
  try {
    response = await fetch(`${GITHUB_API}${path}`, { ...options, headers: { ...githubHeaders(token), ...(options.headers || {}) } });
  } catch (error) {
    console.error("[github] network error:", error.message);
    throw ApiError.serviceUnavailable("GitHub could not be reached right now");
  }

  if (!response.ok) {
    if (response.status === 404) throw ApiError.notFound("Repository was not found or you do not have access to it");
    if (response.status === 401 || response.status === 403) throw ApiError.forbidden("GitHub denied access to this repository");
    if (response.status === 429) throw ApiError.tooManyRequests("GitHub rate limit reached. Try again later.");
    throw ApiError.serviceUnavailable(`GitHub returned an unexpected error (${response.status})`);
  }

  return response.json();
}

function repositoryPath({ owner, name }, suffix = "") {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}${suffix}`;
}

function mapRepository(repository) {
  return {
    owner: repository.owner.login,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description || "",
    htmlUrl: repository.html_url,
    defaultBranch: repository.default_branch,
    visibility: repository.visibility || (repository.private ? "private" : "public"),
    isPrivate: Boolean(repository.private),
    language: repository.language || null,
    topics: repository.topics || [],
    stars: repository.stargazers_count || 0,
    forks: repository.forks_count || 0,
  };
}

function mapTreeEntry(entry, prefix = "") {
  return {
    path: prefix ? `${prefix}/${entry.path}` : entry.path,
    mode: entry.mode || "",
    type: entry.type,
    sha: entry.sha,
    ...(entry.size === undefined ? {} : { size: entry.size }),
  };
}

async function getCompleteTree(repository, ref, token) {
  const root = await githubRequest(repositoryPath(repository, `/git/trees/${encodeURIComponent(ref)}?recursive=1`), {}, token);
  if (!root.truncated) return root.tree.map((entry) => mapTreeEntry(entry));

  const complete = [];
  const pending = [{ sha: ref, prefix: "" }];
  while (pending.length) {
    const current = pending.shift();
    const subtree = await githubRequest(repositoryPath(repository, `/git/trees/${encodeURIComponent(current.sha)}`), {}, token);
    for (const entry of subtree.tree) {
      const mapped = mapTreeEntry(entry, current.prefix);
      complete.push(mapped);
      if (entry.type === "tree") pending.push({ sha: entry.sha, prefix: mapped.path });
    }
  }
  return complete;
}

export async function importRepository(repositoryUrl, token) {
  const repository = parseRepositoryUrl(repositoryUrl);
  const metadata = await githubRequest(repositoryPath(repository), {}, token);
  const mapped = mapRepository(metadata);
  const tree = await getCompleteTree(repository, mapped.defaultBranch, token);
  return { ...mapped, tree };
}

export async function getFileContent(repository, path, ref, token) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  if (!cleanPath || cleanPath.includes("..")) throw ApiError.badRequest("A valid repository file path is required");
  const content = await githubRequest(repositoryPath(repository, `/contents/${cleanPath.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref || repository.defaultBranch)}`), {}, token);
  if (Array.isArray(content) || content.type !== "file") throw ApiError.badRequest("The selected repository entry is not a file");
  if (content.encoding !== "base64") throw ApiError.serviceUnavailable("GitHub returned an unsupported file encoding");
  return {
    path: content.path,
    name: content.name,
    sha: content.sha,
    size: content.size,
    htmlUrl: content.html_url,
    content: Buffer.from(content.content.replace(/\n/g, ""), "base64").toString("utf8"),
  };
}

export async function listCommits(repository, { page = 1, perPage = 30 } = {}, token) {
  const query = new URLSearchParams({ sha: repository.defaultBranch, page: String(page), per_page: String(Math.min(perPage, 100)) });
  const commits = await githubRequest(repositoryPath(repository, `/commits?${query}`), {}, token);
  return commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    htmlUrl: commit.html_url,
    author: commit.author ? { login: commit.author.login, avatarUrl: commit.author.avatar_url } : null,
    commitAuthor: commit.commit.author,
    committedAt: commit.commit.author?.date || commit.commit.committer?.date,
  }));
}

export async function getCommit(repository, sha, token) {
  if (!/^[a-f0-9]{7,40}$/i.test(String(sha || ""))) throw ApiError.badRequest("Invalid commit SHA");
  const commit = await githubRequest(repositoryPath(repository, `/commits/${encodeURIComponent(sha)}`), {}, token);
  return {
    sha: commit.sha,
    message: commit.commit.message,
    htmlUrl: commit.html_url,
    author: commit.author ? { login: commit.author.login, avatarUrl: commit.author.avatar_url } : null,
    commitAuthor: commit.commit.author,
    committer: commit.commit.committer,
    stats: commit.stats,
    files: (commit.files || []).map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch || null,
      rawUrl: file.raw_url,
    })),
  };
}
