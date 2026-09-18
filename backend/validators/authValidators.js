import { body } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";

const GMAIL_ONLY_MESSAGE = "Only Gmail addresses ending in @gmail.com are allowed.";

const isGmailAddress = (value = "") => String(value).trim().toLowerCase().endsWith("@gmail.com");
const strongEnoughPassword = body("password")
  .notEmpty().withMessage("Password is required")
  .isLength({ min: 8 }).withMessage("Password must be at least 8 characters");

export const registerValidator = withValidation(
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(isGmailAddress).withMessage(GMAIL_ONLY_MESSAGE)
    .normalizeEmail(),
  strongEnoughPassword,
  body("confirm")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("The two passwords do not match")
);

export const loginValidator = withValidation(
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(isGmailAddress).withMessage(GMAIL_ONLY_MESSAGE)
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
);

export const verifyEmailValidator = withValidation(
  body("token")
    .trim()
    .notEmpty().withMessage("Verification token is required")
    .isLength({ min: 64, max: 64 }).withMessage("Verification token is invalid")
    .isHexadecimal().withMessage("Verification token is invalid")
);

export const resendVerificationValidator = withValidation(
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(isGmailAddress).withMessage(GMAIL_ONLY_MESSAGE)
    .normalizeEmail()
);

export const forgotPasswordValidator = withValidation(
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(isGmailAddress).withMessage(GMAIL_ONLY_MESSAGE)
    .normalizeEmail()
);

export const resetPasswordValidator = withValidation(
  body("token").trim().notEmpty().withMessage("Reset token is required"),
  strongEnoughPassword,
  body("confirm")
    .optional()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("The two passwords do not match")
);
