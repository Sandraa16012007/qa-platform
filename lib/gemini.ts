import { GoogleGenAI } from "@google/genai";

/**
 * Configuration options for sending prompts to Gemini.
 */
export interface GeminiRequestOptions<T = unknown> {
  /** The main user prompt or structured context string */
  prompt: string;
  /** Optional system instruction to guide model behavior */
  systemInstruction?: string;
  /** Optional Zustand store loading state updater function */
  setLoading?: (isLoading: boolean) => void;
  /** Optional validation function to verify parsed JSON structure */
  validator?: (data: unknown) => data is T;
  /** Temperature for generation (default: 0.2 for deterministic JSON) */
  temperature?: number;
  /** Max output tokens to limit response length and minimize usage */
  maxOutputTokens?: number;
}

/**
 * Standard structured result wrapper returned by safe calls.
 */
export interface GeminiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rawText?: string;
  modelUsed?: string;
}

/**
 * Custom Error for Gemini Service failures.
 */
export class GeminiServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "MISSING_API_KEY"
      | "RATE_LIMIT"
      | "PARSING_ERROR"
      | "API_ERROR"
      | "VALIDATION_ERROR"
      | "MODEL_UNAVAILABLE",
    public readonly status?: number,
    public readonly model?: string
  ) {
    super(message);
    this.name = "GeminiServiceError";
  }
}

// ── Centralized Model & Rate Configuration ──
export function getGeminiConfig() {
  return {
    primaryModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    fallbackModel: process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite",
    maxRetries: Number(process.env.GEMINI_MAX_RETRIES) || 2,
    // Requirement: strictly not more than 4 requests sent in a minute
    requestsPerMinute: Number(process.env.GEMINI_REQUESTS_PER_MINUTE) || 4,
  };
}

// ── Rate Limiter State ──
// Strictly enforces max 4 requests per 60,000 ms (minimum 15,000 ms between requests).
const RATE_WINDOW_MS = 60000;
let requestTimestamps: number[] = [];
let rateLimitQueue: Promise<void> = Promise.resolve();

/**
 * Strictly throttles execution so that no more than 4 requests are sent within any 60-second window.
 * Enforces both a sliding window limit and a minimum interval between calls.
 */
async function enforceRateLimit(): Promise<void> {
  rateLimitQueue = rateLimitQueue.then(async () => {
    const { requestsPerMinute } = getGeminiConfig();
    const minSpacingMs = Math.ceil(RATE_WINDOW_MS / requestsPerMinute); // 15,000ms for 4 req/min

    let now = Date.now();
    // Purge timestamps older than the 60s sliding window
    requestTimestamps = requestTimestamps.filter((t) => now - t < RATE_WINDOW_MS);

    // 1. Sliding window check: if already at quota within last 60s, wait until oldest expires
    if (requestTimestamps.length >= requestsPerMinute) {
      const oldest = requestTimestamps[0];
      const waitTime = RATE_WINDOW_MS - (now - oldest) + 100;
      if (waitTime > 0) {
        console.warn(
          `[Gemini Rate Limiter] 60s window capacity reached (${requestTimestamps.length}/${requestsPerMinute} reqs). Waiting ${(waitTime / 1000).toFixed(1)}s`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        now = Date.now();
        requestTimestamps = requestTimestamps.filter((t) => now - t < RATE_WINDOW_MS);
      }
    }

    // 2. Minimum interval check: ensure at least minSpacingMs since previous request
    if (requestTimestamps.length > 0) {
      const last = requestTimestamps[requestTimestamps.length - 1];
      const elapsed = now - last;
      if (elapsed < minSpacingMs) {
        const waitTime = minSpacingMs - elapsed;
        console.info(
          `[Gemini Rate Limiter] Spacing requests: waiting ${(waitTime / 1000).toFixed(1)}s (max ${requestsPerMinute} req/min)`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    requestTimestamps.push(Date.now());
  });

  return rateLimitQueue;
}

/**
 * Gets an initialized GoogleGenAI instance or throws if key is missing.
 * Kept strictly server-side.
 */
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new GeminiServiceError(
      "GEMINI_API_KEY environment variable is not configured on the server. Please set GEMINI_API_KEY in your environment.",
      "MISSING_API_KEY"
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Extracts numeric HTTP status from Gemini/SDK errors if available.
 */
function extractHttpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const anyErr = err as Record<string, unknown>;
  if (typeof anyErr.status === "number") return anyErr.status;
  if (typeof anyErr.statusCode === "number") return anyErr.statusCode;
  if (typeof anyErr.code === "number") return anyErr.code;

  // Search error message for JSON body like {"error":{"code":503,...}}
  if (typeof anyErr.message === "string") {
    const match = anyErr.message.match(/"code"\s*:\s*(\d{3})/);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
}

/**
 * Checks whether an error is non-retryable (client errors, bad requests, invalid auth).
 * These must fail immediately without retry or fallback.
 */
function isNonRetryableError(status: number | undefined, message: string): boolean {
  if (status === 400) return true; // Malformed request / Invalid argument
  if (status === 401 || status === 403) return true; // Invalid API key or permission denied
  if (message.includes("API key not valid") || message.includes("PERMISSION_DENIED")) return true;
  if (message.includes("INVALID_ARGUMENT")) return true;
  return false;
}

/**
 * Checks whether an error indicates a candidate for model fallback (service/model failure).
 * Do NOT use fallback for invalid API keys, malformed requests, or exhausted shared quota.
 */
function isFallbackCandidate(status: number | undefined, message: string): boolean {
  // Service/model unavailable (high demand), model not found, or model internal error
  if (status === 503 || status === 404 || status === 500) return true;
  if (
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("not found") ||
    message.includes("no longer available") ||
    message.includes("ModelService.ListModels")
  ) {
    return true;
  }
  return false;
}

/**
 * Extracts Retry-After duration in milliseconds if provided by the error headers or message.
 */
function extractRetryAfterMs(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const anyErr = err as Record<string, unknown>;

  // Check headers if available
  const response = anyErr.response as { headers?: Headers | Record<string, string> } | undefined;
  if (response?.headers) {
    let headerVal: string | null = null;
    if (typeof (response.headers as Headers).get === "function") {
      headerVal = (response.headers as Headers).get("retry-after");
    } else {
      headerVal = (response.headers as Record<string, string>)["retry-after"] || null;
    }
    if (headerVal) {
      const seconds = parseFloat(headerVal);
      if (!isNaN(seconds) && seconds > 0) {
        return Math.min(seconds * 1000, 45000); // Bound at 45s max
      }
    }
  }

  // Check message string for retry after hints
  if (typeof anyErr.message === "string") {
    const match = anyErr.message.match(/retry after (\d+)s/i);
    if (match) {
      const s = parseInt(match[1], 10);
      if (!isNaN(s)) return Math.min(s * 1000, 45000);
    }
  }

  return undefined;
}

/**
 * Strips markdown code blocks (e.g. ```json ... ```) and leading/trailing whitespace.
 */
export function cleanJsonResponse(rawText: string): string {
  if (!rawText) return "";
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  return cleaned;
}

/**
 * Executes generateContent with bounded retries and exponential backoff for a specific model.
 */
async function callModelWithRetries(
  ai: GoogleGenAI,
  modelName: string,
  prompt: string,
  systemInstruction: string,
  temperature: number,
  maxOutputTokens?: number
): Promise<{ text: string }> {
  const { maxRetries } = getGeminiConfig();
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      await enforceRateLimit();

      console.info(`[Gemini Service] Sending request to model [${modelName}] (attempt ${attempt + 1}/${maxRetries + 1})...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction,
          temperature,
          maxOutputTokens,
        },
      });

      const text = response.text || "";
      if (!text.trim()) {
        throw new GeminiServiceError(
          `Received empty response from Gemini model [${modelName}].`,
          "API_ERROR",
          undefined,
          modelName
        );
      }
      return { text };
    } catch (err) {
      lastError = err;
      const status = extractHttpStatus(err);
      const errMsg = err instanceof Error ? err.message : String(err);

      // 1. Immediately abort if error is non-retryable (invalid key, malformed prompt)
      if (isNonRetryableError(status, errMsg)) {
        console.error(`[Gemini Service] Non-retryable error on [${modelName}] (HTTP ${status || "unknown"}): ${errMsg}`);
        throw new GeminiServiceError(
          `Gemini request rejected (${errMsg})`,
          status === 401 || status === 403 ? "MISSING_API_KEY" : "API_ERROR",
          status,
          modelName
        );
      }

      // If attempts exhausted, break out to let caller handle fallback or throw
      if (attempt >= maxRetries) {
        console.warn(`[Gemini Service] Exhausted all ${maxRetries + 1} attempts on [${modelName}].`);
        break;
      }

      // 2. Exponential backoff with jitter and Retry-After
      const retryAfterMs = extractRetryAfterMs(err);
      const backoffMs = retryAfterMs || Math.min(30000, 2000 * Math.pow(2, attempt) + Math.floor(Math.random() * 1000));

      console.warn(
        `[Gemini Service] Attempt ${attempt + 1} on [${modelName}] failed (HTTP ${status || "unknown"}). Backing off for ${(backoffMs / 1000).toFixed(1)}s before retry. Reason: ${errMsg.slice(0, 120)}`
      );

      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      attempt++;
    }
  }

  const finalStatus = extractHttpStatus(lastError);
  const finalMsg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new GeminiServiceError(
    `Gemini model [${modelName}] failed after ${maxRetries + 1} attempts: ${finalMsg}`,
    finalStatus === 503 ? "MODEL_UNAVAILABLE" : finalStatus === 429 ? "RATE_LIMIT" : "API_ERROR",
    finalStatus,
    modelName
  );
}

/**
 * Single service function for all AI calls.
 * Sends a prompt to Gemini with bounded retries, exponential backoff, and model fallback.
 *
 * Features:
 * - Rate limited to strictly not more than 4 requests per minute.
 * - Centralized primary and fallback model configuration via environment variables.
 * - Bounded retries with exponential backoff & Retry-After respect.
 * - Fallback to secondary model ONLY on model/service failures (503 high demand, 404 deprecated, 500).
 * - Strict JSON mode with application/json mime type.
 * - Markdown stripping and safe parsing with JSON repair.
 * - Clear, actionable errors without returning fake AI output.
 */
export async function generateJSON<T = unknown>(
  options: GeminiRequestOptions<T>
): Promise<T> {
  const {
    prompt,
    systemInstruction,
    setLoading,
    validator,
    temperature = 0.2,
    maxOutputTokens,
  } = options;

  if (setLoading) setLoading(true);

  try {
    // If invoked in the browser, proxy via server API route so API keys remain strictly server-side
    if (typeof window !== "undefined") {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction, temperature, maxOutputTokens }),
      });
      const json: GeminiResponse<T> = await res.json();
      if (!json.success || !json.data) {
        throw new GeminiServiceError(
          json.error || "Server failed to process Gemini request.",
          "API_ERROR"
        );
      }
      if (validator && !validator(json.data)) {
        throw new GeminiServiceError(
          "Parsed Gemini JSON response did not pass schema validation.",
          "VALIDATION_ERROR"
        );
      }
      return json.data;
    }

    // ── Server-side Execution ──
    const ai = getGeminiClient();
    const { primaryModel, fallbackModel } = getGeminiConfig();

    const baseSystemInstruction =
      "You are a strict JSON-only AI assistant for a Quality Engineering platform. " +
      "You must ALWAYS return valid, parseable JSON matching the requested structure. " +
      "Do NOT include markdown formatting, code fences (```json), or explanatory conversational text.";

    const fullSystemInstruction = systemInstruction
      ? `${baseSystemInstruction}\n\nTask Specific Instruction:\n${systemInstruction}`
      : baseSystemInstruction;

    let rawText = "";
    let activeModel = primaryModel;

    try {
      // 1. Try Primary Model with bounded retries
      const primaryRes = await callModelWithRetries(
        ai,
        primaryModel,
        prompt,
        fullSystemInstruction,
        temperature,
        maxOutputTokens
      );
      rawText = primaryRes.text;
      activeModel = primaryModel;
    } catch (primaryErr) {
      const status = extractHttpStatus(primaryErr);
      const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);

      // Check if eligible for fallback
      const eligibleForFallback = isFallbackCandidate(status, errMsg) && fallbackModel && fallbackModel !== primaryModel;

      if (!eligibleForFallback) {
        throw primaryErr;
      }

      console.warn(
        `[Gemini Service] Primary model [${primaryModel}] unavailable (status ${status || "unknown"}). Initiating fallback to [${fallbackModel}]...`
      );

      try {
        // 2. Try Fallback Model with bounded retries
        const fallbackRes = await callModelWithRetries(
          ai,
          fallbackModel,
          prompt,
          fullSystemInstruction,
          temperature,
          maxOutputTokens
        );
        rawText = fallbackRes.text;
        activeModel = fallbackModel;
        console.info(`[Gemini Service] Fallback model [${fallbackModel}] succeeded.`);
      } catch (fallbackErr) {
        const fbStatus = extractHttpStatus(fallbackErr);
        const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.error(`[Gemini Service] Both primary [${primaryModel}] and fallback [${fallbackModel}] failed.`);

        throw new GeminiServiceError(
          `Gemini generation failed on primary [${primaryModel}] (${errMsg.slice(0, 100)}) and fallback [${fallbackModel}] (${fbMsg.slice(0, 100)}). Please try again later.`,
          fbStatus === 503 ? "MODEL_UNAVAILABLE" : "API_ERROR",
          fbStatus,
          fallbackModel
        );
      }
    }

    const cleanedText = cleanJsonResponse(rawText);
    if (!cleanedText) {
      throw new GeminiServiceError(
        `Received empty response body from Gemini model [${activeModel}].`,
        "API_ERROR",
        undefined,
        activeModel
      );
    }

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseErr) {
      // Repair pass for trailing commas and curly/smart quotes
      try {
        const repaired = cleanedText
          .replace(/,(\s*[}\]])/g, "$1")
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"');
        parsedData = JSON.parse(repaired);
      } catch {
        throw new GeminiServiceError(
          `Failed to parse Gemini response as JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          "PARSING_ERROR",
          undefined,
          activeModel
        );
      }
    }

    if (validator && !validator(parsedData)) {
      throw new GeminiServiceError(
        "Parsed Gemini JSON response did not pass schema validation.",
        "VALIDATION_ERROR",
        undefined,
        activeModel
      );
    }

    return parsedData as T;
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      throw err;
    }
    throw new GeminiServiceError(
      `Gemini request failed: ${err instanceof Error ? err.message : String(err)}`,
      "API_ERROR"
    );
  } finally {
    if (setLoading) setLoading(false);
  }
}

/**
 * Safe wrapper around generateJSON that catches errors gracefully.
 * Does not throw, returning a GeminiResponse object instead.
 */
export async function safeGenerateJSON<T = unknown>(
  options: GeminiRequestOptions<T>
): Promise<GeminiResponse<T>> {
  try {
    const data = await generateJSON<T>(options);
    return { success: true, data };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Gemini Service Safe Error]:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Helper to reset rate limit timer & queue (useful for unit tests/diagnostics).
 */
export function _resetRateLimitTimer(): void {
  requestTimestamps = [];
  rateLimitQueue = Promise.resolve();
}
