import express from "express";
import { createProject, getProjects, getProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { createProjectValidator, updateProjectValidator, projectIdParamValidator, listProjectsValidator } from "../validators/projectValidators.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createProjectValidator, createProject)
  .get(protect, listProjectsValidator, getProjects);

router.route("/:id")
  .get(optionalAuth, projectIdParamValidator, getProject) // supports public projects for logged-out users
  .put(protect, updateProjectValidator, updateProject)
  .delete(protect, projectIdParamValidator, deleteProject);

export default router;
