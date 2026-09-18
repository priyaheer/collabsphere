import { body, param, query } from "express-validator";
import { withValidation } from "../middleware/validationMiddleware.js";
import { PROJECT_ROLES } from "../models/Project.js";

export const projectIdParamValidator = withValidation(
  param("projectId").isMongoId().withMessage("Invalid project id")
);

export const searchUsersValidator = withValidation(
  param("projectId").isMongoId().withMessage("Invalid project id"),
  query("q").optional().isString().isLength({ max: 60 })
);

export const addMemberValidator = withValidation(
  param("projectId").isMongoId().withMessage("Invalid project id"),
  body("userId").optional().isMongoId().withMessage("Invalid user id"),
  body("username").optional().isString().trim(),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("role").optional().isIn(PROJECT_ROLES).withMessage(`Role must be one of: ${PROJECT_ROLES.join(", ")}`)
);

export const updateMemberRoleValidator = withValidation(
  param("projectId").isMongoId().withMessage("Invalid project id"),
  param("userId").isMongoId().withMessage("Invalid user id"),
  body("role").notEmpty().withMessage("Role is required").isIn(PROJECT_ROLES).withMessage(`Role must be one of: ${PROJECT_ROLES.join(", ")}`)
);

export const removeMemberValidator = withValidation(
  param("projectId").isMongoId().withMessage("Invalid project id"),
  param("userId").isMongoId().withMessage("Invalid user id")
);
