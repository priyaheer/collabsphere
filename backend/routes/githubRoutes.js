import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGitHubCommit,
  getGitHubCommits,
  getGitHubFile,
  getGitHubRepository,
  importGitHubRepository,
  syncGitHubRepository,
} from "../controllers/githubController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);
router.post("/import", importGitHubRepository);
router.post("/sync", syncGitHubRepository);
router.get("/file", getGitHubFile);
router.get("/commits", getGitHubCommits);
router.get("/commits/:sha", getGitHubCommit);
router.get("/", getGitHubRepository);

export default router;
