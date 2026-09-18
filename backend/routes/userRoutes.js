import express from "express";
import { getProfile, updateProfile, updatePassword } from "../controllers/userController.js";
import { updateProfileValidator, updatePasswordValidator } from "../validators/userValidators.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/me", getProfile);
router.put("/me", updateProfileValidator, updateProfile);
router.put("/me/password", updatePasswordValidator, updatePassword);

export default router;
