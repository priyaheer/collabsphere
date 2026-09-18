import mongoose from "mongoose";

export const PROJECT_ROLES = ["owner", "admin", "member"];
export const PROJECT_VISIBILITY = ["private", "public"];

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: PROJECT_ROLES, default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: { type: [memberSchema], default: [] },
    technologies: { type: [String], default: [] },
    visibility: { type: String, enum: PROJECT_VISIBILITY, default: "private", index: true },
    readme: { type: String, default: "" },
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

projectSchema.index({ "members.user": 1 });
projectSchema.index({ name: "text", description: "text", technologies: "text" });

export default mongoose.model("Project", projectSchema);