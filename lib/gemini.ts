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
}

/**
 * Custom Error for Gemini Service failures.
 */
export class GeminiServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "MISSING_API_KEY" | "RATE_LIMIT" | "PARSING_ERROR" | "API_ERROR" | "VALIDATION_ERROR"
  ) {
    super(message);
    this.name = "GeminiServiceError";
  }
}

// ── Rate Limiter State ──
// Strictly enforces max 1 request per minute (60,000 ms).
const RATE_LIMIT_INTERVAL_MS = 60000;
let lastRequestTime = 0;
let rateLimitQueue: Promise<void> = Promise.resolve();

/**
 * Throttles execution to ensure at least 60 seconds elapse between requests.
 */
async function enforceRateLimit(): Promise<void> {
  // Chain through promise queue to handle concurrent calls sequentially
  rateLimitQueue = rateLimitQueue.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < RATE_LIMIT_INTERVAL_MS) {
      const waitTime = RATE_LIMIT_INTERVAL_MS - elapsed;
      console.warn(`[Gemini Rate Limiter] Throttling request for ${(waitTime / 1000).toFixed(1)}s (1 req/min limit)`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();
  });

  return rateLimitQueue;
}

/**
 * Gets an initialized GoogleGenAI instance or throws if key is missing.
 */
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new GeminiServiceError(
      "GEMINI_API_KEY environment variable is not configured.",
      "MISSING_API_KEY"
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Strips markdown code blocks (e.g. ```json ... ```) and leading/trailing whitespace.
 */
export function cleanJsonResponse(rawText: string): string {
  if (!rawText) return "";
  let cleaned = rawText.trim();
  // Remove markdown code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  return cleaned;
}

/**
 * Single service function for all AI calls.
 * Sends a prompt to Gemini 2.5 Flash and returns parsed JSON.
 *
 * Features:
 * - Rate limited to 1 call per minute.
 * - Strict JSON mode with application/json mime type.
 * - Markdown stripping and safe parsing.
 * - Zustand loading store callback integration.
 * - Token minimization.
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
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // If invoked in the browser without a direct client API key, proxy via server API route
    if (typeof window !== "undefined" && (!apiKey || apiKey.trim() === "")) {
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

    const ai = getGeminiClient();

    // Enforce 1 request per minute rate limit before sending
    await enforceRateLimit();

    const baseSystemInstruction =
      "You are a strict JSON-only AI assistant for a Quality Engineering platform. " +
      "You must ALWAYS return valid, parseable JSON matching the requested structure. " +
      "Do NOT include markdown formatting, code fences (```json), or explanatory conversational text.";

    const fullSystemInstruction = systemInstruction
      ? `${baseSystemInstruction}\n\nTask Specific Instruction:\n${systemInstruction}`
      : baseSystemInstruction;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: fullSystemInstruction,
        temperature,
        maxOutputTokens,
      },
    });

    const rawText = response.text || "";
    const cleanedText = cleanJsonResponse(rawText);

    if (!cleanedText) {
      throw new GeminiServiceError(
        "Received empty response from Gemini model.",
        "API_ERROR"
      );
    }

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseErr) {
      // Gemini's JSON-mode output occasionally has a trailing comma before a
      // closing `}`/`]` (the exact cause of V8's "Expected double-quoted
      // property name in JSON" error) or "smart quotes" instead of straight
      // ones. Try a lenient repair pass before giving up — this alone fixes
      // the vast majority of otherwise-valid responses that fail strict
      // JSON.parse.
      try {
        const repaired = cleanedText
          .replace(/,(\s*[}\]])/g, "$1") // strip trailing commas
          .replace(/[\u2018\u2019]/g, "'") // curly single quotes -> straight
          .replace(/[\u201C\u201D]/g, '"'); // curly double quotes -> straight
        parsedData = JSON.parse(repaired);
      } catch {
        throw new GeminiServiceError(
          `Failed to parse Gemini response as JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          "PARSING_ERROR"
        );
      }
    }

    if (validator && !validator(parsedData)) {
      throw new GeminiServiceError(
        "Parsed Gemini JSON response did not pass schema validation.",
        "VALIDATION_ERROR"
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
    console.warn("[Gemini Service Error - recovered via fallback]:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Helper to reset rate limit timer (useful for unit tests/mocking).
 */
export function _resetRateLimitTimer(): void {
  lastRequestTime = 0;
}
