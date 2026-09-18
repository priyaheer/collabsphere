import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "PROJECT_INVITE",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "ROLE_CHANGED",
  "NOTE_UPDATED",
  "FILE_UPLOADED",
  "AI_COMPLETED",
  "PROJECT_SHARED",
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);