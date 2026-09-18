import express from "express";
import { param } from "express-validator";
import { getProjectAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { withValidation } from "../middleware/validationMiddleware.js";

const router = express.Router({ mergeParams: true });
const projectIdValidator = withValidation(param("projectId").isMongoId().withMessage("Invalid project id"));

// Mounted at /api/projects/:projectId/analytics
router.get("/", protect, projectIdValidator, getProjectAnalytics);

export default router;
