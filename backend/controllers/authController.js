import User from "../models/User.js";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { generateToken, tokenCookieOptions } from "../utils/generateToken.js";
import { sendPasswordResetOtpEmail } from "../services/emailService.js";

const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const PASSWORD_RESET_OTP_MINUTES = 10;
const PASSWORD_RESET_OTP_ATTEMPTS = 5;
const PASSWORD_RESET_RESEND_COOLDOWN_MS = 60 * 1000;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function baseUsername(name, email) {
  const localPart = email.split("@")[0];
  const source = localPart || name || "user";
  return source.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 24) || "user";
}

async function generateUniqueUsername(name, email) {
  const base = baseUsername(name, email);
  let candidate = base;
  let suffix = 0;
  while (await User.exists({ username: candidate })) {
    suffix += 1;
    candidate = `${base.slice(0, 24)}${suffix}`;
  }
  return candidate.slice(0, 30);
}

async function sendAuthToken(res, user) {
  const token = generateToken(user._id);
  res.cookie("token", token, tokenCookieOptions);
  return sendSuccess(res, { message: "Logged in successfully", data: { user, token } });
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw ApiError.conflict("An account already exists for this Gmail address. Log in instead.");
  }

  const username = await generateUniqueUsername(name, normalizedEmail);
  const user = new User({ name, username, email: normalizedEmail, password });
  await user.save();

  return sendCreated(res, "Account created successfully", { user });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+password +loginFailedAttempts +loginLockedUntil");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
    throw ApiError.tooManyRequests("Too many failed login attempts. Please try again later.");
  }

  if (!(await user.comparePassword(password))) {
    user.loginFailedAttempts = (user.loginFailedAttempts || 0) + 1;
    if (user.loginFailedAttempts >= MAX_LOGIN_FAILURES) {
      user.loginLockedUntil = new Date(Date.now() + LOGIN_LOCK_MS);
    }
    await user.save({ validateBeforeSave: false });
    throw ApiError.unauthorized("Invalid email or password");
  }

  user.loginFailedAttempts = 0;
  user.loginLockedUntil = undefined;
  await user.save({ validateBeforeSave: false });
  return sendAuthToken(res, user);
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email }).select(
    "+passwordResetOtpHash +passwordResetOtpAttempts +passwordResetOtpSentAt"
  );

  if (user) {
    if (user.passwordResetOtpSentAt && Date.now() - user.passwordResetOtpSentAt.getTime() < PASSWORD_RESET_RESEND_COOLDOWN_MS) {
      throw ApiError.tooManyRequests("Please wait before requesting another reset code.");
    }

    const otp = generateOtp();
    user.passwordResetOtpHash = hashOtp(otp);
    user.passwordResetOtpExpiresAt = new Date(Date.now() + PASSWORD_RESET_OTP_MINUTES * 60 * 1000);
    user.passwordResetOtpAttempts = 0;
    user.passwordResetOtpSentAt = new Date();
    user.passwordResetVerifiedAt = undefined;
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetOtpEmail(user, otp);
  }

  return sendSuccess(res, {
    message: "If an account exists for that email, a password reset code has been sent.",
  });
});

// POST /api/auth/verify-reset-otp
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email }).select(
    "+passwordResetOtpHash +passwordResetOtpAttempts"
  );

  if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt || user.passwordResetOtpExpiresAt < new Date()) {
    throw ApiError.badRequest("That reset code is invalid or expired.");
  }

  if ((user.passwordResetOtpAttempts || 0) >= PASSWORD_RESET_OTP_ATTEMPTS) {
    throw ApiError.tooManyRequests("Too many incorrect reset code attempts. Request a new code.");
  }

  if (hashOtp(req.body.otp) !== user.passwordResetOtpHash) {
    user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
    await user.save({ validateBeforeSave: false });
    throw ApiError.badRequest("That reset code is incorrect.");
  }

  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpiresAt = undefined;
  user.passwordResetOtpAttempts = 0;
  user.passwordResetVerifiedAt = new Date();
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, { message: "Reset code verified." });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email }).select("+passwordResetVerifiedAt");
  const resetWindow = user?.passwordResetVerifiedAt && Date.now() - user.passwordResetVerifiedAt.getTime() < PASSWORD_RESET_OTP_MINUTES * 60 * 1000;

  if (!user || !resetWindow) {
    throw ApiError.badRequest("Verify the reset code before setting a new password.");
  }

  user.password = req.body.password;
  user.passwordChangedAt = new Date();
  user.passwordResetVerifiedAt = undefined;
  user.loginFailedAttempts = 0;
  user.loginLockedUntil = undefined;
  await user.save();

  return sendSuccess(res, { message: "Password changed successfully." });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: "Current user", data: { user: req.user } });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", { ...tokenCookieOptions, maxAge: undefined });
  return sendSuccess(res, { message: "Logged out successfully" });
});
