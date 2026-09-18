import express from "express";
import { getMembers, searchUsers, addMember, updateMemberRole, removeMember } from "../controllers/memberController.js";
import {
  projectIdParamValidator,
  searchUsersValidator,
  addMemberValidator,
  updateMemberRoleValidator,
  removeMemberValidator,
} from "../validators/memberValidators.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

// Mounted at /api/projects/:projectId/members - projectId is available via the mount path.
const router = express.Router({ mergeParams: true });

router.get("/", optionalAuth, projectIdParamValidator, getMembers);
router.get("/search", protect, searchUsersValidator, searchUsers);
router.post("/", protect, addMemberValidator, addMember);
router.put("/:userId", protect, updateMemberRoleValidator, updateMemberRole);
router.delete("/:userId", protect, removeMemberValidator, removeMember);

export default router;
