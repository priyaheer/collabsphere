import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiResponse.js";

// Run after express-validator chains: converts failures into a 422 response.
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  next(ApiError.validation(errors));
}

// Helper: build [ ...chains, validate ]
export const withValidation = (...chains) => [...chains, validate];
