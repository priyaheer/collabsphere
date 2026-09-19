import mongoose from "mongoose";

const githubTreeEntrySchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    mode: { type: String, default: "" },
    type: { type: String, enum: ["blob", "tree"], required: true },
    sha: { type: String, required: true },
    size: { type: Number },
  },
  { _id: false }
);

const githubRepositorySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    owner: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    description: { type: String, default: "" },
    htmlUrl: { type: String, required: true },
    defaultBranch: { type: String, required: true },
    visibility: { type: String, default: "public" },
    isPrivate: { type: Boolean, default: false },
    language: { type: String, default: null },
    topics: { type: [String], default: [] },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    lastCommitSha: { type: String, default: "" },
    tree: { type: [githubTreeEntrySchema], default: [] },
    importedAt: { type: Date, default: Date.now },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

githubRepositorySchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("GitHubRepository", githubRepositorySchema);
