import Project from "../models/Project.js";
import User, { PUBLIC_USER_FIELDS } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { loadProjectWithAccess, isProjectOwner } from "../middleware/projectAccess.js";
import { logActivity } from "../services/activityService.js";
import { createNotification } from "../services/notificationService.js";
import { escapeRegex } from "../utils/pagination.js";

// GET /api/projects/:projectId/members
export const getMembers = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "public");
  await project.populate("members.user", PUBLIC_USER_FIELDS);
  return sendSuccess(res, { message: "Members fetched successfully", data: { members: project.members } });
});

// GET /api/projects/:projectId/members/search?q=
// Search registered users (to add as a member) who are not already on the project.
export const searchUsers = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "admin");
  const q = (req.query.q || "").trim();
  if (!q) return sendSuccess(res, { message: "Users fetched successfully", data: { users: [] } });

  const existingIds = (project.members || []).map((m) => m.user.toString());
  const regex = new RegExp(escapeRegex(q), "i");

  const users = await User.find({
    _id: { $nin: existingIds },
    $or: [{ username: regex }, { name: regex }, { email: regex }],
  })
    .select(`${PUBLIC_USER_FIELDS} email`)
    .limit(10);

  return sendSuccess(res, { message: "Users fetched successfully", data: { users } });
});

// POST /api/projects/:projectId/members
export const addMember = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "admin");
  const { userId, username, email, role = "member" } = req.body;

  if (role === "owner") throw ApiError.badRequest("A project can only have one owner");

  let user = null;
  if (userId) user = await User.findById(userId);
  else if (username) user = await User.findOne({ username: username.toLowerCase() });
  else if (email) user = await User.findOne({ email: email.toLowerCase() });
  else throw ApiError.badRequest("Provide a userId, username, or email to add a member");

  if (!user) throw ApiError.notFound("User not found");

  const alreadyMember = project.members.some((m) => m.user.toString() === user._id.toString());
  if (alreadyMember) throw ApiError.conflict("This user is already a member of the project");

  project.members.push({ user: user._id, role });
  await project.save();

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "MEMBER_ADDED",
    message: `${req.user.name} added ${user.name} to the project as ${role}`,
    metadata: { addedUser: user._id, role },
  });

  await createNotification({
    recipient: user._id,
    sender: req.user._id,
    project: project._id,
    type: "MEMBER_ADDED",
    message: `${req.user.name} added you to the project "${project.name}" as ${role}`,
  });

  await project.populate("members.user", PUBLIC_USER_FIELDS);
  return sendCreated(res, "Member added successfully", { members: project.members });
});

// PUT /api/projects/:projectId/members/:userId
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "admin");
  const { userId } = req.params;
  const { role } = req.body;

  if (role === "owner") throw ApiError.badRequest("Ownership cannot be transferred this way");
  if (isProjectOwner(project, userId)) throw ApiError.forbidden("Cannot change the owner's role");

  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member) throw ApiError.notFound("This user is not a member of the project");

  member.role = role;
  await project.save();

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "MEMBER_ROLE_CHANGED",
    message: `${req.user.name} changed a member's role to ${role}`,
    metadata: { targetUser: userId, role },
  });

  await createNotification({
    recipient: userId,
    sender: req.user._id,
    project: project._id,
    type: "ROLE_CHANGED",
    message: `Your role in "${project.name}" was changed to ${role}`,
  });

  await project.populate("members.user", PUBLIC_USER_FIELDS);
  return sendSuccess(res, { message: "Member role updated successfully", data: { members: project.members } });
});

// DELETE /api/projects/:projectId/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "admin");
  const { userId } = req.params;

  if (isProjectOwner(project, userId)) throw ApiError.forbidden("The project owner cannot be removed");

  const before = project.members.length;
  project.members = project.members.filter((m) => m.user.toString() !== userId);
  if (project.members.length === before) throw ApiError.notFound("This user is not a member of the project");

  await project.save();

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "MEMBER_REMOVED",
    message: `${req.user.name} removed a member from the project`,
    metadata: { removedUser: userId },
  });

  await createNotification({
    recipient: userId,
    sender: req.user._id,
    project: project._id,
    type: "MEMBER_REMOVED",
    message: `You were removed from the project "${project.name}"`,
  });

  return sendSuccess(res, { message: "Member removed successfully" });
});
