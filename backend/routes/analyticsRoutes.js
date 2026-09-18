import express from "express";
import { param } from "express-validator";
import { getProjectAnalytics } from "../controllers/analyticsController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { withValidation } from "../middleware/validationMiddleware.js";

const router = express.Router();
const projectIdValidator = withValidation(param("projectId").isMongoId().withMessage("Invalid project id"));

// Mounted at /api/projects/:projectId/analytics
router.get("/", optionalAuth, projectIdValidator, getProjectAnalytics);

export default router;
