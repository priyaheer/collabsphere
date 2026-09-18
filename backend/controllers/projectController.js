import Project, { PROJECT_VISIBILITY } from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta, getSort, escapeRegex } from "../utils/pagination.js";
import { loadProjectWithAccess, isProjectOwner, isProjectAdmin } from "../middleware/projectAccess.js";
import { logActivity } from "../services/activityService.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import { notifyProjectMembers } from "../services/notificationService.js";
import crypto from "crypto";

const OWNER_FIELDS = PUBLIC_USER_FIELDS;
const MEMBER_SORT_FIELDS = ["createdAt", "updatedAt", "name"];

function generatePublicToken() {
  return crypto.randomBytes(24).toString("hex");
}

// POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const { name, description = "", technologies = [], visibility = "private", readme = "" } = req.body;

  const project = await Project.create({
    name,
    description,
    technologies,
    visibility,
    publicToken: visibility === "public" ? generatePublicToken() : undefined,
    readme,
    owner: req.user._id,
    members: [{ user: req.user._id, role: "owner" }],
  });

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "PROJECT_CREATED",
    message: `${req.user.name} created the project "${project.name}"`,
  });
  const populated = await Project.findById(project._id).select("+publicToken").populate("owner", OWNER_FIELDS).populate("members.user", OWNER_FIELDS);
  return sendCreated(res, "Project created successfully", { project: populated });
});

// GET /api/projects?search=&page=&limit=&sort=
export const getProjects = asyncHandler(async (req, res) => {
  const { search, scope = "all" } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSort(req.query, MEMBER_SORT_FIELDS);

  const filter = scope === "mine"
    ? { owner: req.user._id }
    : scope === "shared"
      ? { "members.user": req.user._id, owner: { $ne: req.user._id } }
      : { $or: [{ owner: req.user._id }, { "members.user": req.user._id }] };

  const query = search
    ? { $and: [filter, { $or: [{ name: new RegExp(escapeRegex(search), "i") }, { technologies: new RegExp(escapeRegex(search), "i") }] }] }
    : filter;

  const [projects, total] = await Promise.all([
    Project.find(query).sort(sort).skip(skip).limit(limit).populate("owner", OWNER_FIELDS),
    Project.countDocuments(query),
  ]);

  return sendSuccess(res, {
    message: "Projects fetched successfully",
    data: { projects },
    pagination: buildPaginationMeta({ page, limit }, total),
  });
});

// GET /api/projects/:id
export const getProject = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.id, req.user, "public");
  await project.populate({ path: "owner", select: OWNER_FIELDS });
  await project.populate([
    { path: "owner", select: OWNER_FIELDS },
    { path: "members.user", select: OWNER_FIELDS },
  ]);
  return sendSuccess(res, { message: "Project fetched successfully", data: { project } });
});

// PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.id, req.user, "admin");

  const { name, description, technologies, visibility, readme } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (technologies !== undefined) project.technologies = technologies;
  if (readme !== undefined) project.readme = readme;
  if (visibility !== undefined) {
    if (!isProjectOwner(project, req.user._id) && !isProjectAdmin(project, req.user._id)) {
      throw ApiError.forbidden("Only an owner or admin can change project visibility");
    }
    if (!PROJECT_VISIBILITY.includes(visibility)) throw ApiError.badRequest("Invalid visibility value");
    project.visibility = visibility;
    project.publicToken = visibility === "public" ? project.publicToken || generatePublicToken() : undefined;
  }

  await project.save();
  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "PROJECT_UPDATED",
    message: `${req.user.name} updated project settings`,
  });
  await notifyProjectMembers(project, {
    sender: req.user._id,
    type: "PROJECT_UPDATED",
    message: `${req.user.name} updated the project "${project.name}"`,
    excludeUserId: req.user._id,
  });

  await project.populate([
    { path: "owner", select: OWNER_FIELDS },
    { path: "members.user", select: OWNER_FIELDS },
  ]);
  return sendSuccess(res, { message: "Project updated successfully", data: { project } });
});

// DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.id, req.user, "owner");
  await project.deleteOne();
  return sendSuccess(res, { message: "Project deleted successfully" });
});
