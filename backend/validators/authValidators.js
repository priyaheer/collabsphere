import { body } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";

export const registerValidator = withValidation(
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage("Username may only contain letters, numbers, dots, dashes and underscores"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
);

export const loginValidator = withValidation(
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
);
