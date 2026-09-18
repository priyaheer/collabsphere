import { body, param } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";

export const projectIdParamValidator = withValidation(
  param("projectId").isMongoId().withMessage("Invalid project id")
);

export const noteIdParamValidator = withValidation(
  param("id").isMongoId().withMessage("Invalid note id")
);

export const createNoteValidator = withValidation(
  param("projectId").isMongoId().withMessage("Invalid project id"),
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("content").optional({ nullable: true }).isString().isLength({ max: 200000 })
);

export const updateNoteValidator = withValidation(
  param("id").isMongoId().withMessage("Invalid note id"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty").isLength({ max: 200 }),
  body("content").optional({ nullable: true }).isString().isLength({ max: 200000 })
);
