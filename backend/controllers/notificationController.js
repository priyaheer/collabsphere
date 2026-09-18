import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, sendSuccess } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";

// GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { recipient: req.user._id };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort("-createdAt").skip(skip).limit(limit).populate("sender", PUBLIC_USER_FIELDS).populate("project", "name"),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, read: false }),
  ]);

  return sendSuccess(res, {
    message: "Notifications fetched successfully",
    data: { notifications, unreadCount },
    pagination: buildPaginationMeta({ page, limit }, total),
  });
});

// PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw ApiError.notFound("Notification not found");
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw ApiError.notFound("Notification not found");

  notification.read = true;
  await notification.save();
  return sendSuccess(res, { message: "Notification marked as read", data: { notification } });
});

// PATCH /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
  return sendSuccess(res, { message: "All notifications marked as read" });
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw ApiError.notFound("Notification not found");
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw ApiError.notFound("Notification not found");
  return sendSuccess(res, { message: "Notification deleted successfully" });
});
