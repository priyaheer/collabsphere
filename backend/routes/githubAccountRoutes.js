import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { completeGitHubOAuth, getGitHubConnection, getGitHubRepositories, startGitHubOAuth } from "../controllers/githubController.js";

const router = express.Router();

router.get("/oauth/callback", completeGitHubOAuth);
router.get("/connect", protect, startGitHubOAuth);
router.get("/connection", protect, getGitHubConnection);
router.get("/repositories", protect, getGitHubRepositories);

export default router;
