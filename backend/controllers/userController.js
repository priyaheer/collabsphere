import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess } from "../utils/apiResponse.js";

// GET /api/users/me
export const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: "Profile fetched successfully", data: { user: req.user } });
});

// PUT /api/users/me
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, bio, skills, avatar } = req.body;

  if (username && username.toLowerCase() !== req.user.username) {
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) throw ApiError.conflict("This username is already taken");
  }

  const user = await User.findById(req.user._id);
  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = username.toLowerCase();
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = skills;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  return sendSuccess(res, { message: "Profile updated successfully", data: { user } });
});

// PUT /api/users/me/password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  const matches = await user.comparePassword(currentPassword);
  if (!matches) throw ApiError.unauthorized("Current password is incorrect");

  user.password = newPassword; // hashed by the User pre-save hook
  await user.save();
  return sendSuccess(res, { message: "Password updated successfully" });
});
