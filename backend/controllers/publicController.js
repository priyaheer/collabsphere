import mongoose from "mongoose";
import Project from "../models/Project.js";
import Note from "../models/Note.js";
import File from "../models/File.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess } from "../utils/apiResponse.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";

// GET /api/public/projects/:id
// No authentication required. Only projects with visibility="public" are
// accessible here, and only safe, non-sensitive fields are ever returned.
//
// Note: the current Note/File schemas don't have a per-item visibility flag,
// so once a project is public, its notes and files are treated as public too
// (similar to an open-source repo). Adding per-note/per-file visibility would
// be a reasonable future enhancement (see final delivery notes).
export const getPublicProject = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw ApiError.notFound("Project not found");

  const project = await Project.findOne({ _id: req.params.id, visibility: "public" })
    .select("name description technologies owner readme members createdAt")
    .populate("owner", PUBLIC_USER_FIELDS)
    .populate("members.user", PUBLIC_USER_FIELDS);

  if (!project) throw ApiError.notFound("This project is not available or is private");

  const [notes, files] = await Promise.all([
    Note.find({ project: project._id }).select("title content createdAt updatedAt author").populate("author", PUBLIC_USER_FIELDS),
    File.find({ project: project._id }).select("originalName url mimeType size extension createdAt uploadedBy").populate("uploadedBy", PUBLIC_USER_FIELDS),
  ]);

  const contributors = (project.members || []).map((m) => m.user).filter(Boolean);

  return sendSuccess(res, {
    message: "Public project fetched successfully",
    data: {
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        technologies: project.technologies,
        owner: project.owner,
        readme: project.readme,
        createdAt: project.createdAt,
      },
      notes,
      files,
      contributors,
    },
  });
});
