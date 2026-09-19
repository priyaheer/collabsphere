import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import {
  getGitHubCommit,
  getGitHubCommits,
  getGitHubFile,
  getGitHubRepository,
  importGitHubRepository,
  syncGitHubRepository,
} from "../controllers/githubController.js";

const router = express.Router({ mergeParams: true });

const githubLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many GitHub requests. Please try again shortly.", errors: [] },
});

router.use(protect, githubLimiter);
router.post("/import", importGitHubRepository);
router.post("/sync", syncGitHubRepository);
router.get("/file", getGitHubFile);
router.get("/commits", getGitHubCommits);
router.get("/commits/:sha", getGitHubCommit);
router.get("/", getGitHubRepository);

export default router;
