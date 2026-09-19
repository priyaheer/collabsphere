import mongoose from "mongoose";
import path from "path";
import File from "../models/File.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta, getSort, escapeRegex } from "../utils/pagination.js";
import { loadProjectWithAccess } from "../middleware/projectAccess.js";
import { logActivity } from "../services/activityService.js";
import { notifyProjectMembers } from "../services/notificationService.js";
import { storage, isInsideUploadDir } from "../services/storageService.js";
import { extensionOf, mimeForExtension, TEXT_EXTENSIONS, IMAGE_EXTENSIONS } from "../middleware/uploadMiddleware.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";

const FILE_SORT_FIELDS = ["createdAt", "originalName", "size"];
const MAX_PREVIEW_BYTES = 200 * 1024; // 200KB - enough for a text preview, keeps responses small

async function loadFileWithAccess(fileId, user, minRole = "public") {
  if (!mongoose.Types.ObjectId.isValid(fileId)) throw ApiError.notFound("File not found");
  const file = await File.findById(fileId).select("+path");
  if (!file) throw ApiError.notFound("File not found");
  const { project, role } = await loadProjectWithAccess(file.project, user, minRole);
  return { file, project, role };
}

// POST /api/projects/:projectId/files
export const uploadFile = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "member");
  if (!req.file) throw ApiError.badRequest("No file was uploaded");

  const ext = extensionOf(req.file.originalname);
  const { path: storedPath, storage: storageName } = await storage.save(req.file);
  let file;
  try {
    file = await File.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: storedPath,
      storage: storageName,
      url: `/api/files/${req.file.filename}`,
      mimeType: mimeForExtension(ext),
      size: req.file.size,
      extension: ext,
      project: project._id,
      uploadedBy: req.user._id,
    });

    file.url = `/api/files/${file._id}/raw`;
    await file.save();
  } catch (error) {
    await storage.remove({ path: storedPath });
    throw error;
  }

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "FILE_UPLOADED",
    message: `${req.user.name} uploaded the file "${file.originalName}"`,
    metadata: { fileId: file._id },
  });

  await notifyProjectMembers(project, {
    sender: req.user._id,
    type: "FILE_UPLOADED",
    message: `${req.user.name} uploaded "${file.originalName}" to "${project.name}"`,
    excludeUserId: req.user._id,
  });

  const populated = await File.findById(file._id).populate("uploadedBy", PUBLIC_USER_FIELDS);
  return sendCreated(res, "File uploaded successfully", { file: populated });
});

// GET /api/projects/:projectId/files?search=&page=&limit=&sort=
export const getProjectFiles = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "public");
  const { search } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSort(req.query, FILE_SORT_FIELDS, "-createdAt");

  const filter = { project: project._id };
  if (search) filter.originalName = new RegExp(escapeRegex(search), "i");

  const [files, total] = await Promise.all([
    File.find(filter).sort(sort).skip(skip).limit(limit).populate("uploadedBy", PUBLIC_USER_FIELDS),
    File.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: "Files fetched successfully",
    data: { files },
    pagination: buildPaginationMeta({ page, limit }, total),
  });
});

// GET /api/files/:id - metadata, plus a safe inline preview for text files.
export const getFile = asyncHandler(async (req, res) => {
  const { file } = await loadFileWithAccess(req.params.id, req.user, "public");
  const populated = await File.findById(file._id).populate("uploadedBy", PUBLIC_USER_FIELDS);

  const payload = { file: populated };

  if (TEXT_EXTENSIONS.includes(file.extension)) {
    if (!isInsideUploadDir(file.path)) throw ApiError.forbidden("Invalid file location");
    try {
      payload.preview = { kind: "text", content: await storage.readText(file, MAX_PREVIEW_BYTES) };
    } catch {
      payload.preview = { kind: "unavailable" };
    }
  } else if (IMAGE_EXTENSIONS.includes(file.extension)) {
    payload.preview = { kind: "image", url: file.url };
  } else {
    payload.preview = { kind: "metadata" };
  }

  return sendSuccess(res, { message: "File fetched successfully", data: payload });
});

// GET /api/files/:id/raw - streams the actual file bytes (auth + membership enforced).
export const getFileRaw = asyncHandler(async (req, res) => {
  const { file } = await loadFileWithAccess(req.params.id, req.user, "public");

  if (!isInsideUploadDir(file.path)) throw ApiError.forbidden("Invalid file location");

  res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Disposition", [".html", ".svg"].includes(file.extension)
    ? `attachment; filename="${encodeURIComponent(path.basename(file.originalName))}"`
    : `inline; filename="${encodeURIComponent(path.basename(file.originalName))}"`);
  // Uploaded content is served but never executed - Content-Disposition/Content-Type
  // above ensure the browser treats it as data, not as a script to run.
  const stream = storage.createReadStream(file);
  stream.on("error", () => {
    if (!res.headersSent) res.status(404).json({ success: false, message: "File not found on disk", errors: [] });
  });
  stream.pipe(res);
});

// DELETE /api/files/:id
export const deleteFile = asyncHandler(async (req, res) => {
  const { file, project, role } = await loadFileWithAccess(req.params.id, req.user, "member");

  if (file.uploadedBy.toString() !== req.user._id.toString() && !["admin", "owner"].includes(role)) {
    throw ApiError.forbidden("Only the uploader or a project admin can delete this file");
  }

  await storage.remove(file);
  await file.deleteOne();

  await logActivity({
    user: req.user._id,
    project: project._id,
    type: "FILE_DELETED",
    message: `${req.user.name} deleted the file "${file.originalName}"`,
  });

  return sendSuccess(res, { message: "File deleted successfully" });
});
