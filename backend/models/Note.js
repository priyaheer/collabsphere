import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    // Markdown content
    content: { type: String, default: "", maxlength: 200000 },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

noteSchema.index({ project: 1, updatedAt: -1 });

export default mongoose.model("Note", noteSchema);
