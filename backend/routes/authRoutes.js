import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { registerValidator, loginValidator } from "../validators/authValidators.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stricter limiter on credential endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later.", errors: [] },
});

router.post("/register", authLimiter, registerValidator, register);
router.post("/login", authLimiter, loginValidator, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
