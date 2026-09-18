import mongoose from "mongoose";
import Project from "../models/Project.js";
import Note from "../models/Note.js";
import File from "../models/File.js";
import Activity from "../models/Activity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { loadProjectWithAccess } from "../middleware/projectAccess.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";

// GET /api/projects/:projectId/analytics
export const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { project } = await loadProjectWithAccess(req.params.projectId, req.user, "member");
  const projectId = project._id;

  const [
    totalNotes,
    totalFiles,
    totalActivity,
    notesByMember,
    filesByMember,
    activityOverTime,
    recentActivity,
  ] = await Promise.all([
    Note.countDocuments({ project: projectId }),
    File.countDocuments({ project: projectId }),
    Activity.countDocuments({ project: projectId }),
    Note.aggregate([
      { $match: { project: projectId } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]),
    File.aggregate([
      { $match: { project: projectId } },
      { $group: { _id: "$uploadedBy", count: { $sum: 1 } } },
    ]),
    Activity.aggregate([
      { $match: { project: projectId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Activity.find({ project: projectId }).sort("-createdAt").limit(10).populate("user", PUBLIC_USER_FIELDS),
  ]);

  // Merge per-member note/file counts into a single contributions array.
  const contributionsMap = new Map(
    project.members.map((member) => [member.user.toString(), { user: member.user, notes: 0, files: 0 }])
  );
  for (const row of notesByMember) {
    if (!row._id) continue;
    const key = row._id.toString();
    contributionsMap.set(key, { user: row._id, notes: row.count, files: 0 });
  }
  for (const row of filesByMember) {
    if (!row._id) continue;
    const key = row._id.toString();
    const existing = contributionsMap.get(key) || { user: row._id, notes: 0, files: 0 };
    existing.files = row.count;
    contributionsMap.set(key, existing);
  }
  const memberIds = [...contributionsMap.keys()].map((id) => new mongoose.Types.ObjectId(id));
  const users = await mongoose.model("User").find({ _id: { $in: memberIds } }).select(`${PUBLIC_USER_FIELDS} email`);
  const usersById = new Map(users.map((u) => [u._id.toString(), u]));
  const memberContributions = [...contributionsMap.values()].map((c) => ({
    user: usersById.get(c.user.toString()) || c.user,
    notes: c.notes,
    files: c.files,
  }));

  return sendSuccess(res, {
    message: "Analytics fetched successfully",
    data: {
      totalMembers: project.members.length,
      totalNotes,
      totalFiles,
      totalActivity,
      memberContributions,
      activityOverTime: activityOverTime.map((a) => ({ date: a._id, count: a.count })),
      recentActivity,
    },
  });
});
