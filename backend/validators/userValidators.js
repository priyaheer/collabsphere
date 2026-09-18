import { body } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";

export const updateProfileValidator = withValidation(
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 80 }),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage("Username may only contain letters, numbers, dots, dashes and underscores"),
  body("bio").optional({ nullable: true }).isString().isLength({ max: 500 }),
  body("skills").optional({ nullable: true }).isArray().withMessage("Skills must be an array"),
  body("skills.*").optional().isString().trim().isLength({ max: 40 }),
  body("avatar").optional({ nullable: true }).isString()
);

export const updatePasswordValidator = withValidation(
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").notEmpty().withMessage("New password is required").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
);
