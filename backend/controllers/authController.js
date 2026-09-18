import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { generateToken, tokenCookieOptions } from "../utils/generateToken.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
  if (existing) {
    const field = existing.email === email.toLowerCase() ? "email" : "username";
    throw ApiError.conflict(`This ${field} is already taken`);
  }

  const user = await User.create({ name, username, email, password });
  const token = generateToken(user._id);
  res.cookie("token", token, tokenCookieOptions);
  return sendCreated(res, "Account created successfully", { user, token });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  const token = generateToken(user._id);
  res.cookie("token", token, tokenCookieOptions);
  return sendSuccess(res, { message: "Logged in successfully", data: { user, token } });
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