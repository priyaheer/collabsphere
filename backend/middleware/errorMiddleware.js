import { ApiError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

// 404 handler - mounted after all routes.
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Normalizes known error types (Mongoose, JWT, Multer, ApiError) into a
// consistent { statusCode, message, errors } shape.
function normalizeError(err) {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, message: err.message, errors: err.errors || [] };
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return { statusCode: 422, message: "Validation failed", errors };
  }

  // Mongoose invalid ObjectId / cast error
  if (err.name === "CastError") {
    return { statusCode: 400, message: `Invalid value for field '${err.path}'`, errors: [] };
  }

  // Mongo duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return { statusCode: 409, message: `This ${field} is already in use`, errors: [] };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return { statusCode: 401, message: "Invalid authentication token", errors: [] };
  }
  if (err.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Authentication token has expired", errors: [] };
  }

  // Multer errors (file size / unexpected field / etc.)
  if (err.name === "MulterError") {
    const map = {
      LIMIT_FILE_SIZE: "File is too large",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
    };
    return { statusCode: 400, message: map[err.code] || `File upload error: ${err.code}`, errors: [] };
  }

  // Body parser JSON syntax error
  if (err.type === "entity.parse.failed") {
    return { statusCode: 400, message: "Malformed JSON in request body", errors: [] };
  }

  // Anything from an external service (e.g. Gemini) that we've already
  // tagged as operational should keep its own message but never leak internals.
  if (err.isOperational) {
    return { statusCode: err.statusCode || 500, message: err.message, errors: err.errors || [] };
  }

  // Unexpected/unknown error - never leak internal details in production.
  return {
    statusCode: 500,
    message: env.isProd ? "Something went wrong. Please try again later." : err.message || "Internal server error",
    errors: [],
  };
}

// Centralized error handler - must be mounted last, after all routes.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const { statusCode, message, errors } = normalizeError(err);

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  } else if (!env.isTest) {
    console.warn(`[error] ${req.method} ${req.originalUrl} -> ${statusCode} ${message}`);
  }

  const body = { success: false, message, errors };
  if (!env.isProd && err?.stack && statusCode >= 500) {
    body.stack = err.stack;
  }
  res.status(statusCode).json(body);
}
