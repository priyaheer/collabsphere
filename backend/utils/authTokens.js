import crypto from "crypto";
import { env } from "../config/env.js";

export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token) {
  return crypto.createHmac("sha256", env.JWT_SECRET).update(String(token)).digest("hex");
}

export function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isExpired(date) {
  return !date || date.getTime() <= Date.now();
}
