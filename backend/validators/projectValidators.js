import { body, param, query } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";
import { PROJECT_VISIBILITY } from "../models/Project.js";

export const projectIdParamValidator = withValidation(
  param("id").isMongoId().withMessage("Invalid project id")
);

export const createProjectValidator = withValidation(
  body("name").trim().notEmpty().withMessage("Project name is required").isLength({ max: 100 }),
  body("description").optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body("technologies").optional({ nullable: true }).isArray().withMessage("Technologies must be an array"),
  body("technologies.*").optional().isString().trim().isLength({ max: 40 }),
  body("visibility").optional({ nullable: true }).isIn(PROJECT_VISIBILITY).withMessage(`Visibility must be one of: ${PROJECT_VISIBILITY.join(", ")}`),
  body("readme").optional({ nullable: true }).isString()
);

export const updateProjectValidator = withValidation(
  param("id").isMongoId().withMessage("Invalid project id"),
  body("name").optional().trim().notEmpty().withMessage("Project name cannot be empty").isLength({ max: 100 }),
  body("description").optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body("technologies").optional({ nullable: true }).isArray().withMessage("Technologies must be an array"),
  body("technologies.*").optional().isString().trim().isLength({ max: 40 }),
  body("visibility").optional({ nullable: true }).isIn(PROJECT_VISIBILITY).withMessage(`Visibility must be one of: ${PROJECT_VISIBILITY.join(", ")}`),
  body("readme").optional({ nullable: true }).isString()
);

export const listProjectsValidator = withValidation(
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString().isLength({ max: 100 }),
  query("scope").optional().isIn(["all", "mine", "shared"])
);
