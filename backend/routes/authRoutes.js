import express from "express";
import rateLimit from "express-rate-limit";
import {
  getMe,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyResetOtp,
} from "../controllers/authController.js";
import {
  loginValidator,
  forgotPasswordValidator,
  registerValidator,
  resetPasswordValidator,
  verifyResetOtpValidator,
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
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later.", errors: [] },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset attempts. Please try again later.", errors: [] },
});

router.post("/register", authLimiter, registerValidator, register);
router.post("/login", loginLimiter, loginValidator, login);
router.post("/forgot-password", passwordResetLimiter, forgotPasswordValidator, forgotPassword);
router.post("/verify-reset-otp", passwordResetLimiter, verifyResetOtpValidator, verifyResetOtp);
router.post("/reset-password", passwordResetLimiter, resetPasswordValidator, resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
