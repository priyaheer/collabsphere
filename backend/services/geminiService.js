import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

const MAX_INPUT_CHARS = 20000; // guards prompt size / cost / abuse
const GEMINI_TIMEOUT_MS = 30000;

function assertConfigured() {
  if (!env.GEMINI_API_KEY) {
    throw ApiError.serviceUnavailable("AI features are not configured on this server");
  }
}

function truncate(text = "", max = MAX_INPUT_CHARS) {
  const str = String(text ?? "");
  return str.length > max ? str.slice(0, max) : str;
}

// Low-level call to the Gemini generateContent REST endpoint.
// All communication with Gemini happens through this function - the API key
// never leaves the server and is never logged.
async function callGemini(prompt, { maxOutputTokens = 1500, temperature = 0.4 } = {}) {
  assertConfigured();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens, temperature },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw ApiError.serviceUnavailable("AI request timed out. Please try again.");
    }
    // Never leak raw network/internal error details to the client.
    console.error("[gemini] network error:", err.message);
    throw ApiError.serviceUnavailable("Unable to reach the AI service right now");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Log status only - never log the API key or full request/response body.
    console.error(`[gemini] request failed with status ${response.status}`);
    if (response.status === 429) {
      throw new ApiError(429, "AI service rate limit reached. Please try again shortly.");
    }
    throw ApiError.serviceUnavailable("The AI service could not process this request");
  }

  const data = await response.json().catch(() => null);
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ?? "";

  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) {
      throw ApiError.badRequest("The AI service could not process this content");
    }
    throw ApiError.serviceUnavailable("The AI service returned an empty response");
  }

  return text.trim();
}

// ---- High-level, feature-specific prompts -------------------------------

export async function explainContent({ content, type }) {
  const safeContent = truncate(content);

  const prompt =
    type === "code"
      ? [
          "You are a senior software engineer reviewing a piece of code for a teammate.",
          "Explain the following code. Respond in clear Markdown with these sections:",
          "## Overview", "## Logic Explanation", "## Important Functions",
          "## Potential Issues", "## Improvement Suggestions",
          "", "Code:", "```", safeContent, "```",
        ].join("\n")
      : [
          "You are helping a developer understand a Markdown note from their project.",
          "Explain the following note. Respond in clear Markdown with these sections:",
          "## Explanation", "## Summary", "## Simplified Interpretation", "## Improvement Suggestions",
          "", "Note:", safeContent,
        ].join("\n");

  return callGemini(prompt, { maxOutputTokens: 1500 });
}

export async function generateDocs({ code, language }) {
  const safeCode = truncate(code);
  const prompt = [
    `You are a technical writer. Generate clear, useful developer documentation`,
    `for the following ${language || "code"} snippet. Include a short description,`,
    `parameters/inputs, return value/output, and a usage example where relevant.`,
    `Respond in Markdown only.`,
    "", "```" + (language || ""), safeCode, "```",
  ].join("\n");

  return callGemini(prompt, { maxOutputTokens: 1500 });
}

export async function generateReadme({ projectName, description, technologies = [], features = [], installation, usage }) {
  const prompt = [
    "Generate a professional, well-structured README.md for a software project.",
    "Use proper Markdown headings, and include sections for Overview, Features,",
    "Technologies, Installation, Usage, and Contributing. Keep it concise but complete.",
    "",
    `Project name: ${truncate(projectName, 200)}`,
    `Description: ${truncate(description, 2000)}`,
    `Technologies: ${(technologies || []).slice(0, 30).join(", ")}`,
    `Features: ${(features || []).slice(0, 30).join(", ")}`,
    `Installation notes: ${truncate(installation, 2000)}`,
    `Usage notes: ${truncate(usage, 2000)}`,
  ].join("\n");

  return callGemini(prompt, { maxOutputTokens: 2000 });
}
