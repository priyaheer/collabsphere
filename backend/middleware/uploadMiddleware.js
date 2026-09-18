import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

// Extensions allowed for upload. Deliberately excludes anything executable
// (.exe, .sh, .bat, .php, .dll, etc.) - see fileFilter below for enforcement.
export const ALLOWED_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json", ".md", ".txt",
  ".yml", ".yaml", ".png", ".jpg", ".jpeg", ".svg", ".pdf", ".gif", ".webp",
];

const MIME_BY_EXT = {
  ".js": "text/javascript", ".jsx": "text/javascript", ".ts": "text/typescript", ".tsx": "text/typescript",
  ".py": "text/x-python", ".html": "text/html", ".css": "text/css", ".json": "application/json",
  ".md": "text/markdown", ".txt": "text/plain", ".yml": "text/yaml", ".yaml": "text/yaml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".pdf": "application/pdf", ".gif": "image/gif", ".webp": "image/webp",
};

export function extensionOf(filename) {
  return path.extname(filename || "").toLowerCase();
}

export function mimeForExtension(ext) {
  return MIME_BY_EXT[ext] || "application/octet-stream";
}

export const TEXT_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json", ".md", ".txt", ".yml", ".yaml"];
export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"];

// Ensure the upload directory exists before multer tries to write into it.
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, env.UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    // Never trust the original filename for the stored name - generate a
    // random, collision-free, path-traversal-safe filename instead.
    const ext = extensionOf(file.originalname);
    const randomName = crypto.randomBytes(24).toString("hex");
    cb(null, `${randomName}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = extensionOf(file.originalname);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(ApiError.badRequest(`File type '${ext || "unknown"}' is not allowed`));
  }
  cb(null, true);
}

export const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 1,
  },
});
