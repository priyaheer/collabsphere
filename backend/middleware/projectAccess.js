import mongoose from "mongoose";
import Project from "../models/Project.js";
import { ApiError } from "../utils/apiResponse.js";

const ROLE_RANK = { member: 1, admin: 2, owner: 3 };

export function getMemberRole(project, userId) {
  if (!userId) return null;
  const id = userId.toString();
  if (project.owner && project.owner.toString() === id) return "owner";
  const entry = (project.members || []).find((m) => {
    const memberId = m.user?._id ? m.user._id : m.user;
    return memberId && memberId.toString() === id;
  });
  return entry ? entry.role : null;
}

export const isProjectOwner = (project, userId) => getMemberRole(project, userId) === "owner";
export const isProjectAdmin = (project, userId) => (ROLE_RANK[getMemberRole(project, userId)] || 0) >= ROLE_RANK.admin;
export const isProjectMember = (project, userId) => (ROLE_RANK[getMemberRole(project, userId)] || 0) >= ROLE_RANK.member;

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Loads a project and enforces a minimum role. `minRole` can be:
//   "public" -> anyone if the project is public, otherwise a member
//   "member" | "admin" | "owner"
export async function loadProjectWithAccess(projectId, user, minRole = "member") {
  if (!isValidObjectId(projectId)) throw ApiError.notFound("Project not found");
  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound("Project not found");

  const role = getMemberRole(project, user?._id);
  const rank = ROLE_RANK[role] || 0;

  if (minRole === "public") {
    if (project.visibility === "public" || rank >= ROLE_RANK.member) return { project, role };
    throw ApiError.forbidden("This project is private");
  }
  if (rank < ROLE_RANK[minRole]) {
    if (rank === 0) throw ApiError.forbidden("You are not a member of this project");
    throw ApiError.forbidden(`This action requires the ${minRole} role`);
  }
  return { project, role };
}
