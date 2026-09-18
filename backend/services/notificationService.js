import Notification from "../models/Notification.js";

export async function createNotification({ recipient, sender, project, type, message }) {
  try {
    if (sender && recipient && sender.toString() === recipient.toString()) return null; // don't notify yourself
    return await Notification.create({ recipient, sender, project, type, message });
  } catch (err) {
    console.error("[notification] failed to create notification:", err.message);
    return null;
  }
}

// Notify every project member except `excludeUserId`.
export async function notifyProjectMembers(project, { sender, type, message, excludeUserId }) {
  const recipients = (project.members || [])
    .map((m) => (m.user?._id ? m.user._id : m.user))
    .filter((id) => id && (!excludeUserId || id.toString() !== excludeUserId.toString()));
  if (!recipients.length) return [];
  try {
    return await Notification.insertMany(
      recipients.map((recipient) => ({ recipient, sender, project: project._id, type, message }))
    );
  } catch (err) {
    console.error("[notification] failed to notify members:", err.message);
    return [];
  }
}
