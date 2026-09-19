import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env, validateEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import { projectNotesRouter, noteRouter } from "./routes/noteRoutes.js";
import { projectFilesRouter, fileRouter } from "./routes/fileRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import githubAccountRoutes from "./routes/githubAccountRoutes.js";

validateEnv();

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = new Set([env.CLIENT_URL].filter(Boolean));
const isLocalDevOrigin = (origin) => {
  if (env.isProd) return false;
  try {
    return ["localhost", "127.0.0.1"].includes(new URL(origin).hostname);
  } catch {
    return false;
  }
};

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isLocalDevOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
if (!env.isProd && !env.isTest) app.use(morgan("dev"));

// General API rate limit - generous, just a backstop against abuse.
// Sensitive routes (auth, AI) layer stricter limiters on top of this.
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later.", errors: [] },
  })
);

// GET /api/health
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "CollabSphere API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/github", githubAccountRoutes);
app.use("/api/projects/:projectId/members", memberRoutes);
app.use("/api/projects/:projectId/notes", projectNotesRouter);
app.use("/api/projects/:projectId/files", projectFilesRouter);
app.use("/api/projects/:projectId/analytics", analyticsRoutes);
app.use("/api/projects/:projectId/github", githubRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notes", noteRouter);
app.use("/api/files", fileRouter);
app.use("/api/ai", geminiRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/search", searchRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    const server = http.createServer(app);

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `[server] Port ${env.PORT} is already in use. Stop the other server using this port, or set PORT to a different value in backend/.env and update frontend/.env VITE_API_URL to match.`
        );
      } else {
        console.error("[server] Server error:", err.message);
      }
      process.exit(1);
    });

    server.listen(env.PORT, () => {
      console.log(`[server] CollabSphere API listening on port ${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  }
}

// Avoid auto-starting the server when this file is imported by tests.
if (env.NODE_ENV !== "test") {
  start();
}

process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled promise rejection:", reason);
});

export default app;
