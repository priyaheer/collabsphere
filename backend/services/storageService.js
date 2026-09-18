import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { env } from "../config/env.js";

// Local-disk storage provider. To move to S3/Cloudinary later, implement the same
// four functions against that provider and switch the export below.
const localStorage = {
  name: "local",

  // multer has already written the file to disk; just describe where it lives.
  async save(multerFile) {
    return { path: multerFile.path, storage: "local" };
  },

  async remove(fileDoc) {
    if (!fileDoc?.path) return;
    try {
      await fs.unlink(fileDoc.path);
    } catch (err) {
      if (err.code !== "ENOENT") console.error("[storage] failed to delete file:", err.message);
    }
  },

  async readText(fileDoc, maxBytes) {
    const handle = await fs.open(fileDoc.path, "r");
    try {
      const buf = Buffer.alloc(maxBytes);
      const { bytesRead } = await handle.read(buf, 0, maxBytes, 0);
      return buf.subarray(0, bytesRead).toString("utf8");
    } finally {
      await handle.close();
    }
  },

  createReadStream(fileDoc) {
    return createReadStream(fileDoc.path);
  },
};

// Guard: a stored path must live inside the uploads directory.
export function isInsideUploadDir(filePath) {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(env.UPLOAD_DIR + path.sep);
}

export const storage = localStorage;