import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateToken(userId) {
  return jwt.sign({ id: userId.toString() }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

// Cookie options used when also setting the token as an httpOnly cookie.
export const tokenCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
