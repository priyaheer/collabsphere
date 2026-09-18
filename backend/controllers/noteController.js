import mongoose from "mongoose";
import Note from "../models/Note.js";
import Project from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta, getSort, escapeRegex } from "../utils/pagination.js";
import { loadProjectWithAccess, isProjectMember } from "../middleware/projectAccess.js";
import { logActivity } from "../services/activityService.js";
import { notifyProjectMembers } from "../services/notificationService.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";

const NOTE_SORT_FIELDS = ["createdAt", "updatedAt", "title"];

// Loads a note and enforces that the requester can access its parent project.
async function loadNoteWithAccess(noteId, user, minRole = "public") {
  if (!mongoose.Types.ObjectId.isValid(noteId)) throw ApiError.notFound("Note not found");
  const note = await Note.findById(noteId);
  if (!note) throw ApiError.notFound("Note not found");
  const { project, role } = await loadProjectWithAccess(note.project, user, minRole);
  return { note, project, role };
}

// POST /api/projects/:projectId/notes
export const createNote = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "member");
  const { title, content = "" } = req.body;

  const note = await Note.create({ title, content, project: project._id, author: req.user._id });

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "NOTE_CREATED",
    message: `${req.user.name} created the note "${note.title}"`,
    metadata: { noteId: note._id },
  });

  await notifyProjectMembers(project, {
    sender: req.user._id,
    type: "NOTE_UPDATED",
    message: `${req.user.name} added a new note "${note.title}" to "${project.name}"`,
    excludeUserId: req.user._id,
  });

  const populated = await note.populate("author", PUBLIC_USER_FIELDS);
  return sendCreated(res, "Note created successfully", { note: populated });
});

// GET /api/projects/:projectId/notes?search=&page=&limit=&sort=
export const getProjectNotes = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "public");
  const { search } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSort(req.query, NOTE_SORT_FIELDS, "-updatedAt");

  const filter = { project: project._id };
  if (search) filter.title = new RegExp(escapeRegex(search), "i");

  const [notes, total] = await Promise.all([
    Note.find(filter).sort(sort).skip(skip).limit(limit).populate("author", PUBLIC_USER_FIELDS),
    Note.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: "Notes fetched successfully",
    data: { notes },
    pagination: buildPaginationMeta({ page, limit }, total),
  });
});

// GET /api/notes/:id
export const getNote = asyncHandler(async (req, res) => {
  const { note } = await loadNoteWithAccess(req.params.id, req.user, "public");
  await note.populate("author", PUBLIC_USER_FIELDS);
  return sendSuccess(res, { message: "Note fetched successfully", data: { note } });
});

// PUT /api/notes/:id
export const updateNote = asyncHandler(async (req, res) => {
  const { note, project } = await loadNoteWithAccess(req.params.id, req.user, "member");
  const { title, content } = req.body;

  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  await note.save();

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "NOTE_UPDATED",
    message: `${req.user.name} updated the note "${note.title}"`,
    metadata: { noteId: note._id },
  });

  await note.populate("author", PUBLIC_USER_FIELDS);
  return sendSuccess(res, { message: "Note updated successfully", data: { note } });
});

// DELETE /api/notes/:id
export const deleteNote = asyncHandler(async (req, res) => {
  const { note, project, role } = await loadNoteWithAccess(req.params.id, req.user, "member");

  // Only the note's author, or a project admin/owner, may delete it.
  if (note.author.toString() !== req.user._id.toString() && !["admin", "owner"].includes(role)) {
    throw ApiError.forbidden("Only the note's author or a project admin can delete this note");
  }

  await note.deleteOne();

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "NOTE_DELETED",
    message: `${req.user.name} deleted the note "${note.title}"`,
  });

  return sendSuccess(res, { message: "Note deleted successfully" });
});
