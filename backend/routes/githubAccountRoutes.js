import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import { completeGitHubOAuth, disconnectGitHub, getGitHubConnection, getGitHubRepositories, startGitHubOAuth } from "../controllers/githubController.js";

const router = express.Router();

const githubLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 120,
	keyGenerator: (req) => req.user?._id?.toString() || req.ip,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many GitHub requests. Please try again shortly.", errors: [] },
});

router.get("/oauth/callback", completeGitHubOAuth);
router.use(protect, githubLimiter);
router.get("/connect", startGitHubOAuth);
router.get("/connection", getGitHubConnection);
router.get("/repositories", getGitHubRepositories);
router.delete("/connection", disconnectGitHub);

export default router;
