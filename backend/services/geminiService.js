import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

const MAX_INPUT_CHARS = 20000; // guards prompt size / cost / abuse
const GROQ_TIMEOUT_MS = 60000;
const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

function assertConfigured() {
  if (!env.GROQ_API_KEY) {
    throw ApiError.serviceUnavailable("AI features are not configured on this server");
  }
}

function truncate(text = "", max = MAX_INPUT_CHARS) {
  const str = String(text ?? "");
  return str.length > max ? str.slice(0, max) : str;
}

// Low-level call to the Groq OpenAI-compatible chat completions endpoint.
// All communication with Groq happens through this function - the API key
// never leaves the server and is never logged.
async function callGroq(prompt, { maxOutputTokens = 1500, temperature = 0.4 } = {}) {
  assertConfigured();
  const startedAt = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful senior developer assistant. Respond with clear, useful Markdown.",
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: maxOutputTokens,
        temperature,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`[groq] request timed out after ${Date.now() - startedAt}ms`);
      throw ApiError.serviceUnavailable("AI request timed out. Please try again.");
    }
    // Never leak raw network/internal error details to the client.
    console.error("[groq] network error:", err.message);
    throw ApiError.serviceUnavailable("Unable to reach the AI service right now");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Log status only - never log the API key or full request/response body.
    console.error(`[groq] request failed with status ${response.status}`);
    if (response.status === 429) {
      throw new ApiError(429, "AI service rate limit reached. Please try again shortly.");
    }
    if (response.status === 401 || response.status === 403) {
      throw ApiError.serviceUnavailable("AI service authentication failed. Check the server API key.");
    }
    throw ApiError.serviceUnavailable("The AI service could not process this request");
  }

  console.log(`[groq] request completed in ${Date.now() - startedAt}ms (${env.GROQ_MODEL})`);

  const data = await response.json().catch(() => null);
  const text = data?.choices?.[0]?.message?.content ?? "";

  if (!text) {
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
        "You are a helpful senior software engineer.",
        "Explain the user's code clearly and practically.",
        "Do not create unnecessary sections or tables.",
        "Keep the answer concise unless the code is complex.",
        "Explain what the code does, how it works, and mention important issues only when relevant.",
        "",
        "Code:",
        "```",
        safeContent,
        "```",
      ].join("\n")
    : [
        "You are a helpful AI assistant for a developer collaboration platform.",
        "Understand the user's input before answering.",
        "If the input is very short, such as a greeting, typo, or single word, respond briefly and naturally.",
        "Do not invent technical meaning when the input has no technical context.",
        "If the input is a meaningful technical note, explain it clearly.",
        "Do not create unnecessary sections, tables, or long explanations.",
        "",
        "User input:",
        safeContent,
      ].join("\n");

  return callGroq(prompt, { maxOutputTokens: 1500 });
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

  return callGroq(prompt, { maxOutputTokens: 1500 });
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

  return callGroq(prompt, { maxOutputTokens: 2000 });
}
