import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(uri = env.MONGO_URI) {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("[db] Failed to connect to MongoDB:", err.message);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

