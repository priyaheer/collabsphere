import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true, unique: true },
    // Storage-provider specific location (local disk path today, S3/Cloudinary key later)
    path: { type: String, required: true, select: false },
    storage: { type: String, default: "local" },
    // Public-facing URL served by the API (access controlled)
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    extension: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        delete ret.path;
        return ret;
      },
    },
  }
);

export default mongoose.model("File", fileSchema);
