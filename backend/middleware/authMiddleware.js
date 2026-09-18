import User from "../models/User.js";
import { verifyToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

async function resolveUser(token) {
  const decoded = verifyToken(token); // throws on invalid/expired -> handled by errorMiddleware (401)
  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized("User belonging to this token no longer exists");
  return user;
}

// Requires a valid JWT. Attaches req.user.
export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Not authenticated. Please log in.");
  req.user = await resolveUser(token);
  next();
});

// Attaches req.user when a valid token is present, otherwise continues anonymously.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = await resolveUser(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
});
