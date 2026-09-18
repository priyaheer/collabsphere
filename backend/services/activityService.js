import Activity from "../models/Activity.js";

// Fire-and-forget safe activity logger. Never throws into request handlers.
export async function logActivity({ user, project, type, message, metadata = {} }) {
  try {
    return await Activity.create({ user, project, type, message, metadata });
  } catch (err) {
    console.error("[activity] failed to log activity:", err.message);
    return null;
  }
}
