import express from "express";
import { param } from "express-validator";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { withValidation } from "../middleware/validationMiddleware.js";

const router = express.Router();
const idValidator = withValidation(param("id").isMongoId().withMessage("Invalid notification id"));

router.use(protect);
router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", idValidator, markAsRead);
router.delete("/:id", idValidator, deleteNotification);

export default router;
