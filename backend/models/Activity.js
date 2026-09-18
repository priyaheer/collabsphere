import mongoose from "mongoose";

export const ACTIVITY_TYPES = [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "MEMBER_ROLE_CHANGED",
  "NOTE_CREATED",
  "NOTE_UPDATED",
  "NOTE_DELETED",
  "FILE_UPLOADED",
  "FILE_DELETED",
  "README_GENERATED",
  "AI_REQUEST",
];

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
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

activitySchema.index({ project: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);