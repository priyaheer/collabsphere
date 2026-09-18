import { body } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";

const MAX_CONTENT_LENGTH = 20000;

export const explainValidator = withValidation(
  body("content").isString().trim().notEmpty().withMessage("Content is required").isLength({ max: MAX_CONTENT_LENGTH }).withMessage("Content is too long"),
  body("type").isIn(["code", "note"]).withMessage("Type must be 'code' or 'note'"),
  body("noteId").optional().isMongoId().withMessage("Invalid note id")
);

export const docsValidator = withValidation(
  body("code").isString().trim().notEmpty().withMessage("Code is required").isLength({ max: MAX_CONTENT_LENGTH }).withMessage("Code is too long"),
  body("language").optional({ nullable: true }).isString().isLength({ max: 40 }),
  body("noteId").optional().isMongoId().withMessage("Invalid note id")
);

export const readmeValidator = withValidation(
  body("projectName").isString().trim().notEmpty().withMessage("Project name is required").isLength({ max: 200 }),
  body("description").optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body("technologies").optional({ nullable: true }).isArray(),
  body("features").optional({ nullable: true }).isArray(),
  body("installation").optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body("usage").optional({ nullable: true }).isString().isLength({ max: 5000 })
);
