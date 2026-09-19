import express from "express";
import { uploadFile, getProjectFiles, getFile, getFileRaw, deleteFile } from "../controllers/fileController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { param } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";

const projectIdValidator = withValidation(param("projectId").isMongoId().withMessage("Invalid project id"));
const fileIdValidator = withValidation(param("id").isMongoId().withMessage("Invalid file id"));

// Mounted at /api/projects/:projectId/files
export const projectFilesRouter = express.Router({ mergeParams: true });
projectFilesRouter.post("/", protect, projectIdValidator, upload.single("file"), uploadFile);
projectFilesRouter.get("/", protect, projectIdValidator, getProjectFiles);

// Mounted at /api/files
export const fileRouter = express.Router();
fileRouter.get("/:id", optionalAuth, fileIdValidator, getFile);
fileRouter.get("/:id/raw", optionalAuth, fileIdValidator, getFileRaw);
fileRouter.delete("/:id", protect, fileIdValidator, deleteFile);

export default fileRouter;
