import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiResponse.js";
import { explainContent, generateDocs, generateReadme } from "../services/geminiService.js";
import { logActivity } from "../services/activityService.js";
import Note from "../models/Note.js";
import { loadProjectWithAccess } from "../middleware/projectAccess.js";

async function resolveNoteContent(noteId, user) {
  if (!noteId) return null;
  const note = await Note.findById(noteId);
  if (!note) throw ApiError.notFound("Note not found");
  await loadProjectWithAccess(note.project, user, "member");
  return note.content;
}

// POST /api/ai/explain (also available as /api/gemini/explain for compatibility)
// Response shape matches the spec exactly: { success, result }
export const explain = asyncHandler(async (req, res) => {
  const { content, type, noteId } = req.body;
  const noteContent = type === "note" ? await resolveNoteContent(noteId, req.user) : null;
  const result = await explainContent({ content: noteContent ?? content, type });
  return res.status(200).json({ success: true, result });
});

// POST /api/ai/docs (also available as /api/gemini/docs for compatibility)
// Response shape matches the spec exactly: { success, result }
export const docs = asyncHandler(async (req, res) => {
  const { code, language, noteId } = req.body;
  const noteContent = language === "markdown" ? await resolveNoteContent(noteId, req.user) : null;
  const result = await generateDocs({ code: noteContent ?? code, language });
  return res.status(200).json({ success: true, result });
});

// POST /api/ai/readme (also available as /api/gemini/readme for compatibility)
// Response shape matches the spec exactly: { success, readme }
export const readme = asyncHandler(async (req, res) => {
  const payload = req.body;
  if (payload.projectId) {
    await loadProjectWithAccess(payload.projectId, req.user, "member");
  }
  const generated = await generateReadme(payload);

  if (payload.projectId) {
    await logActivity({
      user: req.user._id,
      project: payload.projectId,
      type: "README_GENERATED",
      message: `${req.user.name} generated a README with AI`,
    }).catch(() => {});
  }

  return res.status(200).json({ success: true, readme: generated });
});
