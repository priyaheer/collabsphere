import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load server/.env (works regardless of the directory node was started from)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const required = ["MONGO_URI", "JWT_SECRET"];

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GEMINI_API_KEY: (process.env.GEMINI_API_KEY || "").trim(),
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  CLIENT_URL: (process.env.CLIENT_URL || "http://localhost:5173").trim(),
  APP_URL: (process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173").trim(),
  EMAIL_FROM: (process.env.EMAIL_FROM || "").trim(),
  SMTP_HOST: (process.env.SMTP_HOST || "").trim(),
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: String(process.env.SMTP_SECURE || "false").trim().toLowerCase() === "true",
  SMTP_USER: (process.env.SMTP_USER || "").trim(),
  SMTP_PASS: (process.env.SMTP_PASS || "").trim(),
  MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  UPLOAD_DIR: path.resolve(__dirname, "..", "uploads"),
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`
    );
  }
  if (!env.GEMINI_API_KEY) {
    console.warn("[env] GEMINI_API_KEY is not set - AI endpoints will respond with 503.");
  }

  if (!env.isTest) {
    const missingEmailSettings = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"].filter(
      (key) => !env[key]
    );
    const hasPlaceholderPassword = /your-16-character-google-app-password/i.test(env.SMTP_PASS);
    if (missingEmailSettings.length || hasPlaceholderPassword) {
      console.warn(
        `[env] Auth email SMTP is not ready. Set ${missingEmailSettings.join(", ") || "SMTP_PASS"} in backend/.env.`
      );
    }
  }
}
