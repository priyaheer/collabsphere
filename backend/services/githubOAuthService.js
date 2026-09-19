import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_URL = "https://api.github.com";
const STATE_PURPOSE = "github-oauth";

function encryptionKey() {
  if (!env.GITHUB_TOKEN_ENCRYPTION_KEY) {
    throw ApiError.serviceUnavailable("GitHub token encryption is not configured on this server");
  }
  return crypto.createHash("sha256").update(env.GITHUB_TOKEN_ENCRYPTION_KEY).digest();
}

export function encryptGitHubToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptGitHubToken(value) {
  if (!value) return null;
  try {
    const [iv, authTag, encrypted] = value.split(".");
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(authTag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    throw ApiError.serviceUnavailable("Stored GitHub credentials could not be decrypted");
  }
}

export function createOAuthState(userId) {
  return jwt.sign({ sub: userId.toString(), purpose: STATE_PURPOSE, nonce: crypto.randomBytes(16).toString("hex") }, env.JWT_SECRET, { expiresIn: "10m" });
}

export function verifyOAuthState(state) {
  const payload = jwt.verify(state, env.JWT_SECRET);
  if (payload.purpose !== STATE_PURPOSE || !payload.sub) throw ApiError.badRequest("Invalid GitHub OAuth state");
  return payload;
}

export function getGitHubAuthorizeUrl(state) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CALLBACK_URL) {
    throw ApiError.serviceUnavailable("GitHub OAuth is not configured on this server");
  }
  const query = new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, redirect_uri: env.GITHUB_CALLBACK_URL, scope: "repo read:user", state });
  return `${GITHUB_AUTHORIZE_URL}?${query}`;
}

async function oauthRequest(url, options) {
  let response;
  try {
    response = await fetch(url, { ...options, headers: { Accept: "application/json", "Content-Type": "application/json", ...(options.headers || {}) } });
  } catch {
    throw ApiError.serviceUnavailable("GitHub OAuth could not be reached right now");
  }
  if (!response.ok) throw ApiError.serviceUnavailable("GitHub OAuth request failed");
  return response.json();
}

export async function exchangeCode(code) {
  const data = await oauthRequest(GITHUB_TOKEN_URL, {
    method: "POST",
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: env.GITHUB_CALLBACK_URL }),
  });
  if (!data.access_token) throw ApiError.badRequest("GitHub authorization was not completed");
  return data.access_token;
}

export async function getGitHubUser(token) {
  const response = await fetch(`${GITHUB_API_URL}/user`, { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "CollabSphere-GitHub-OAuth" } });
  if (!response.ok) throw ApiError.forbidden("GitHub could not verify this account");
  return response.json();
}

export async function listGitHubRepositories(token) {
  const repositories = [];
  for (let page = 1; page <= 10; page += 1) {
    const query = new URLSearchParams({ affiliation: "owner,collaborator,organization_member", per_page: "100", page: String(page), sort: "updated" });
    const response = await fetch(`${GITHUB_API_URL}/user/repos?${query}`, {
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "CollabSphere-GitHub-OAuth" },
    });
    if (!response.ok) throw ApiError.forbidden("GitHub could not load your repositories");
    const batch = await response.json();
    repositories.push(...batch);
    if (batch.length < 100) break;
  }
  return repositories.map((repository) => ({
    id: repository.id,
    fullName: repository.full_name,
    name: repository.name,
    owner: repository.owner.login,
    description: repository.description || "",
    htmlUrl: repository.html_url,
    defaultBranch: repository.default_branch,
    visibility: repository.visibility || (repository.private ? "private" : "public"),
    isPrivate: Boolean(repository.private),
    language: repository.language || null,
    topics: repository.topics || [],
    stars: repository.stargazers_count || 0,
    updatedAt: repository.updated_at,
  }));
}
