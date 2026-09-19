import GitHubRepository from "../models/GitHubRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess } from "../utils/apiResponse.js";
import { loadProjectWithAccess } from "../middleware/projectAccess.js";
import { getCommit, getFileContent, importRepository, listCommits, parseRepositoryUrl } from "../services/githubService.js";
import { createOAuthState, decryptGitHubToken, encryptGitHubToken, exchangeCode, getGitHubAuthorizeUrl, getGitHubUser, listGitHubRepositories, verifyOAuthState } from "../services/githubOAuthService.js";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { logActivity } from "../services/activityService.js";

async function getUserToken(userId, required = true) {
  const user = await User.findById(userId).select("+githubAccessToken");
  const token = decryptGitHubToken(user?.githubAccessToken);
  if (!token && required) throw ApiError.forbidden("Connect your GitHub account before using GitHub repositories");
  return token;
}

async function clearGitHubConnection(userId) {
  await User.findByIdAndUpdate(userId, {
    $unset: { githubId: 1, githubLogin: 1, githubAvatarUrl: 1, githubAccessToken: 1, githubConnectedAt: 1 },
  });
}

async function withGitHubToken(userId, operation) {
  const token = await getUserToken(userId);
  try {
    return await operation(token);
  } catch (error) {
    if (error.githubAuth) await clearGitHubConnection(userId);
    throw error;
  }
}

export const startGitHubOAuth = asyncHandler(async (req, res) => {
  const state = createOAuthState(req.user._id);
  return sendSuccess(res, { data: { url: getGitHubAuthorizeUrl(state) } });
});

export const completeGitHubOAuth = asyncHandler(async (req, res) => {
  let redirect = `${env.CLIENT_URL}/settings?github=error`;
  try {
    if (req.query.error) throw ApiError.badRequest("GitHub authorization was cancelled");
    const state = verifyOAuthState(req.query.state);
    const token = await exchangeCode(req.query.code);
    const githubUser = await getGitHubUser(token);
    await User.findByIdAndUpdate(state.sub, {
      githubId: String(githubUser.id),
      githubLogin: githubUser.login,
      githubAvatarUrl: githubUser.avatar_url || "",
      githubAccessToken: encryptGitHubToken(token),
      githubConnectedAt: new Date(),
    });
    redirect = `${env.CLIENT_URL}/settings?github=connected`;
  } catch (error) {
    redirect = `${env.CLIENT_URL}/settings?github=error`;
  }
  return res.redirect(redirect);
});

export const getGitHubConnection = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("githubId githubLogin githubAvatarUrl githubConnectedAt +githubAccessToken");
  const connected = Boolean(user?.githubAccessToken);
  return sendSuccess(res, {
    data: {
      connected,
      login: user?.githubLogin || "",
      avatarUrl: user?.githubAvatarUrl || "",
      connectedAt: user?.githubConnectedAt || null,
    },
  });
});

export const getGitHubRepositories = asyncHandler(async (req, res) => {
  const repositories = await withGitHubToken(req.user._id, listGitHubRepositories);
  return sendSuccess(res, { data: { repositories } });
});

export const disconnectGitHub = asyncHandler(async (req, res) => {
  await clearGitHubConnection(req.user._id);
  return sendSuccess(res, { message: "GitHub account disconnected" });
});

function toRepositoryData(repository) {
  return {
    ...repository.toJSON(),
    tree: repository.tree || [],
  };
}

async function requireRepository(projectId, user) {
  await loadProjectWithAccess(projectId, user, "member");
  const repository = await GitHubRepository.findOne({ project: projectId });
  if (!repository) throw ApiError.notFound("No GitHub repository has been imported for this project");
  return repository;
}

export const importGitHubRepository = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "admin");
  const { url, fullName } = req.body || {};
  const repositoryUrl = url || (fullName ? `https://github.com/${fullName}` : "");
  const parsed = parseRepositoryUrl(repositoryUrl);
  const imported = await withGitHubToken(req.user._id, (token) => importRepository(repositoryUrl, token));
  const repository = await GitHubRepository.findOneAndUpdate(
    { project: project._id },
    {
      project: project._id,
      connectedBy: req.user._id,
      ...imported,
      lastCommitSha: "",
      importedAt: new Date(),
      syncedAt: new Date(),
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "GITHUB_REPOSITORY_IMPORTED",
    message: `${req.user.name} imported the GitHub repository "${repository.fullName}"`,
    metadata: { repository: repository.fullName },
  });
  return sendSuccess(res, {
    message: `Imported ${parsed.owner}/${parsed.name} from GitHub`,
    data: { repository: toRepositoryData(repository) },
  });
});

export const getGitHubRepository = asyncHandler(async (req, res) => {
  const repository = await requireRepository(req.params.projectId, req.user);
  return sendSuccess(res, { data: { repository: toRepositoryData(repository) } });
});

export const syncGitHubRepository = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "admin");
  const current = await GitHubRepository.findOne({ project: project._id });
  if (!current) throw ApiError.notFound("No GitHub repository has been imported for this project");
  const imported = await withGitHubToken(req.user._id, (token) => importRepository(`https://github.com/${current.fullName}`, token));
  const repository = await GitHubRepository.findOneAndUpdate(
    { project: project._id },
    { ...imported, syncedAt: new Date() },
    { new: true, runValidators: true }
  );
  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "GITHUB_REPOSITORY_SYNCED",
    message: `${req.user.name} synced the GitHub repository "${repository.fullName}"`,
    metadata: { repository: repository.fullName },
  });
  return sendSuccess(res, { message: "GitHub repository synced", data: { repository: toRepositoryData(repository) } });
});

export const getGitHubFile = asyncHandler(async (req, res) => {
  const repository = await requireRepository(req.params.projectId, req.user);
  const file = await withGitHubToken(req.user._id, (token) => getFileContent(repository, req.query.path, req.query.ref, token));
  return sendSuccess(res, { data: { file } });
});

export const getGitHubCommits = asyncHandler(async (req, res) => {
  const repository = await requireRepository(req.params.projectId, req.user);
  const commits = await withGitHubToken(req.user._id, (token) => listCommits(repository, {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 30,
  }, token));
  return sendSuccess(res, { data: { commits } });
});

export const getGitHubCommit = asyncHandler(async (req, res) => {
  const repository = await requireRepository(req.params.projectId, req.user);
  const commit = await withGitHubToken(req.user._id, (token) => getCommit(repository, req.params.sha, token));
  return sendSuccess(res, { data: { commit } });
});
