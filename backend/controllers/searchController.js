import Project from "../models/Project.js";
import Note from "../models/Note.js";
import File from "../models/File.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { escapeRegex } from "../utils/pagination.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";

// GET /api/search?q=
export const searchWorkspace = asyncHandler(async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (!query) return sendSuccess(res, { data: { projects: [], notes: [], files: [] } });

  const regex = new RegExp(escapeRegex(query), "i");
  const visibleProjects = { $or: [{ owner: req.user._id }, { "members.user": req.user._id }, { visibility: "public" }] };
  const [projects, projectIds] = await Promise.all([
    Project.find({ $and: [visibleProjects, { $or: [{ name: regex }, { description: regex }, { technologies: regex }] }] })
      .select("name description technologies visibility createdAt updatedAt")
      .sort("-updatedAt")
      .limit(20),
    Project.find(visibleProjects).select("_id"),
  ]);

  const ids = projectIds.map((project) => project._id);
  const [notes, files] = await Promise.all([
    Note.find({ project: { $in: ids }, $or: [{ title: regex }, { content: regex }] })
      .select("title content project author createdAt updatedAt")
      .populate("project", "name")
      .populate("author", PUBLIC_USER_FIELDS)
      .sort("-updatedAt")
      .limit(20),
    File.find({ project: { $in: ids }, originalName: regex })
      .select("originalName mimeType size extension project uploadedBy createdAt")
      .populate("project", "name")
      .populate("uploadedBy", PUBLIC_USER_FIELDS)
      .sort("-createdAt")
      .limit(20),
  ]);

  return sendSuccess(res, {
    message: "Search results fetched successfully",
    data: {
      projects,
      notes,
      files,
    },
  });
});