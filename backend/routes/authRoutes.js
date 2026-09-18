import express from "express";
import rateLimit from "express-rate-limit";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resendVerificationValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} from "../validators/authValidators.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stricter limiter on credential endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later.", errors: [] },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later.", errors: [] },
});

const emailActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many email requests. Please try again later.", errors: [] },
});

router.post("/register", authLimiter, registerValidator, register);
router.post("/login", loginLimiter, loginValidator, login);
router.post("/verify-email", authLimiter, verifyEmailValidator, verifyEmail);
router.post("/resend-verification", emailActionLimiter, resendVerificationValidator, resendVerification);
router.post("/forgot-password", emailActionLimiter, forgotPasswordValidator, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidator, resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
