import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

const sentEmails = [];
let transporter;
const EMAIL_UNAVAILABLE_MESSAGE = "Email service is temporarily unavailable. Please try again later.";

function getTransporter() {
  if (env.isTest) {
    return {
      async sendMail(message) {
        sentEmails.push(message);
        return { messageId: `test-${sentEmails.length}` };
      },
    };
  }

  const hasPlaceholder = [env.EMAIL_FROM, env.SMTP_USER, env.SMTP_PASS].some((value) =>
    /your-(gmail-address|16-character-google-app-password)/i.test(value)
  );

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.EMAIL_FROM || hasPlaceholder) {
    console.error(
      "[email] SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, and EMAIL_FROM in backend/.env."
    );
    throw ApiError.serviceUnavailable(EMAIL_UNAVAILABLE_MESSAGE);
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    console.log(`[email] SMTP transporter configured for ${env.SMTP_USER} via ${env.SMTP_HOST}:${env.SMTP_PORT}`);
  }
  return transporter;
}

function appUrl(path) {
  const base = env.APP_URL.replace(/\/$/, "");
  return `${base}${path}`;
}

async function sendMail({ to, subject, text, html }) {
  const from = env.EMAIL_FROM;
  try {
    const info = await getTransporter().sendMail({ from, to, subject, text, html });
    console.log(`[email] Sent "${subject}" to ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[email] Failed to send email to ${to}: ${err.message}`);
    if (err instanceof ApiError) throw err;
    throw ApiError.serviceUnavailable(EMAIL_UNAVAILABLE_MESSAGE);
  }
}

export async function sendVerificationEmail(user, { token }) {
  const verifyUrl = appUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  return sendMail({
    to: user.email,
    subject: "Verify your CollabSphere email",
    text: [
      `Hi ${user.name},`,
      "",
      `Verify your CollabSphere account by opening this link: ${verifyUrl}`,
      "",
      "This verification expires in 20 minutes. If you did not create this account, ignore this email.",
    ].join("\n"),
    html: `
      <p>Hi ${user.name},</p>
      <p>Verify your CollabSphere account by opening this link:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This verification expires in 20 minutes. If you did not create this account, ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(user, { token }) {
  const resetUrl = appUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  return sendMail({
    to: user.email,
    subject: "Reset your CollabSphere password",
    text: [
      `Hi ${user.name},`,
      "",
      `Reset your CollabSphere password here: ${resetUrl}`,
      "",
      "This reset link expires in 30 minutes. If you did not request it, ignore this email.",
    ].join("\n"),
    html: `
      <p>Hi ${user.name},</p>
      <p>Reset your CollabSphere password here:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This reset link expires in 30 minutes. If you did not request it, ignore this email.</p>
    `,
  });
}

export function getSentEmails() {
  return sentEmails;
}

export function clearSentEmails() {
  sentEmails.length = 0;
}
