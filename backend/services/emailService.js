import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

let transporter;
const EMAIL_UNAVAILABLE_MESSAGE = "Password reset email is temporarily unavailable. Please try again later.";

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.EMAIL_FROM) {
    console.error("[email] SMTP is not configured for password reset emails.");
    throw ApiError.serviceUnavailable(EMAIL_UNAVAILABLE_MESSAGE);
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendPasswordResetOtpEmail(user, otp) {
  try {
    const info = await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to: user.email,
      subject: "Your CollabSphere password reset code",
      text: [
        `Hi ${user.name},`,
        "",
        `Your password reset code is ${otp}.`,
        "",
        "This code expires in 10 minutes and can be used only once.",
        "If you did not request a password reset, ignore this email.",
      ].join("\n"),
      html: `
        <p>Hi ${user.name},</p>
        <p>Your CollabSphere password reset code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code expires in 10 minutes and can be used only once.</p>
        <p>If you did not request a password reset, ignore this email.</p>
      `,
    });
    console.log(`[email] Password reset OTP sent to ${user.email} (${info.messageId})`);
  } catch (error) {
    console.error(`[email] Password reset OTP failed for ${user.email}: ${error.message}`);
    if (error instanceof ApiError) throw error;
    throw ApiError.serviceUnavailable(EMAIL_UNAVAILABLE_MESSAGE);
  }
}
