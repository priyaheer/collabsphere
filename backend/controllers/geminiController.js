import { asyncHandler } from "../utils/asyncHandler.js";
import { explainContent, generateDocs, generateReadme } from "../services/geminiService.js";
import { logActivity } from "../services/activityService.js";

// POST /api/gemini/explain
// Response shape matches the spec exactly: { success, result }
export const explain = asyncHandler(async (req, res) => {
  const { content, type } = req.body;
  const result = await explainContent({ content, type });
  return res.status(200).json({ success: true, result });
});

// POST /api/gemini/docs
// Response shape matches the spec exactly: { success, result }
export const docs = asyncHandler(async (req, res) => {
  const { code, language } = req.body;
  const result = await generateDocs({ code, language });
  return res.status(200).json({ success: true, result });
});

// POST /api/gemini/readme
// Response shape matches the spec exactly: { success, readme }
export const readme = asyncHandler(async (req, res) => {
  const payload = req.body;
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
