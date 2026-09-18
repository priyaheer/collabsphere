import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { generateToken, tokenCookieOptions } from "../utils/generateToken.js";
import { generateSecureToken, hashToken, isExpired, minutesFromNow } from "../utils/authTokens.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService.js";

const VERIFICATION_MINUTES = 20;
const RESET_MINUTES = 30;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const GENERIC_RESET_MESSAGE = "If an account exists for that email, a password reset link has been sent.";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
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

function assignVerificationChallenge(user) {
  const token = generateSecureToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpiresAt = minutesFromNow(VERIFICATION_MINUTES);
  user.emailVerificationSentAt = new Date();
  return { token };
}

function assignPasswordReset(user) {
  const token = generateSecureToken();
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = minutesFromNow(RESET_MINUTES);
  return { token };
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
  const user = new User({ name, username, email: normalizedEmail, password, emailVerified: false });
  const challenge = assignVerificationChallenge(user);
  await user.save();

  try {
    await sendVerificationEmail(user, challenge);
  } catch (err) {
    await User.deleteOne({ _id: user._id }).catch(() => undefined);
    throw err;
  }

  return sendCreated(res, "Account created. Check your Gmail inbox to verify your email.", {
    user,
    verificationRequired: true,
    email: user.email,
  });
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

  if (!user.emailVerified) {
    throw ApiError.forbidden("Please verify your Gmail address before logging in.");
  }

  user.loginFailedAttempts = 0;
  user.loginLockedUntil = undefined;
  await user.save({ validateBeforeSave: false });
  return sendAuthToken(res, user);
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({ emailVerificationTokenHash: hashToken(token) }).select(
    "+emailVerificationTokenHash"
  );
  if (!user || isExpired(user.emailVerificationExpiresAt)) {
    throw ApiError.badRequest("Verification link is invalid or expired.");
  }

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.emailVerificationSentAt = undefined;
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, { message: "Email verified successfully", data: { user } });
});

// POST /api/auth/resend-verification
export const resendVerification = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email }).select("+emailVerificationTokenHash");

  if (!user || user.emailVerified) {
    return sendSuccess(res, { message: "If this account needs verification, a new email has been sent." });
  }

  if (user.emailVerificationSentAt && Date.now() - user.emailVerificationSentAt.getTime() < RESEND_COOLDOWN_MS) {
    throw ApiError.tooManyRequests("Please wait before requesting another verification email.");
  }

  const challenge = assignVerificationChallenge(user);
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, challenge);

  return sendSuccess(res, { message: "Verification email sent", data: { email: user.email } });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email }).select("+passwordResetTokenHash");

  if (user && user.emailVerified) {
    const reset = assignPasswordReset(user);
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, reset);
  }

  return sendSuccess(res, { message: GENERIC_RESET_MESSAGE });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({ passwordResetTokenHash: hashToken(token) }).select("+passwordResetTokenHash +password");

  if (!user || isExpired(user.passwordResetExpiresAt)) {
    throw ApiError.badRequest("Password reset link is invalid or expired.");
  }

  user.password = password;
  user.passwordChangedAt = new Date();
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  user.loginFailedAttempts = 0;
  user.loginLockedUntil = undefined;
  await user.save();

  return sendSuccess(res, { message: "Password changed successfully" });
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
