export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "Not authenticated") {
    return new ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }
  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }
  static validation(errors = [], message = "Validation failed") {
    return new ApiError(422, message, errors);
  }
  static serviceUnavailable(message = "Service temporarily unavailable") {
    return new ApiError(503, message);
  }
}

export function sendSuccess(res, { statusCode = 200, message = "Success", data = null, pagination } = {}) {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
}

export function sendCreated(res, message, data) {
  return sendSuccess(res, { statusCode: 201, message, data });
}

export function sendError(res, statusCode, message, errors = []) {
  return res.status(statusCode).json({ success: false, message, errors });
}
