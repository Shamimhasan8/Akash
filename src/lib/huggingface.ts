/**
 * AKASH — Hugging Face Inference API client
 *
 * Production-grade wrapper around HF Inference API for google/gemma-4-12b-it.
 * Handles:
 *  - Authentication via HF_TOKEN (server-side only — never exposed to client)
 *  - Chat-template formatting (Gemma 4 uses the same chat template as Gemma 2/3)
 *  - Retries with exponential backoff (rate limits, transient errors)
 *  - Request timeout (HF cold starts can take 30s+)
 *  - Response parsing with strict validation
 *  - In-memory LRU cache for repeated questions (rate-limit safety net)
 *
 * CRITICAL: This file is server-only. It must never be imported into a client component.
 */

import "server-only";

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  /** System prompt setting the model's persona (kid-safe AKASH tutor). */
  systemPrompt?: string;
  /** Max tokens to generate. Default: 300. */
  maxTokens?: number;
  /** Temperature 0-1. Default: 0.7. */
  temperature?: number;
  /** Top-p nucleus sampling. Default: 0.95. */
  topP?: number;
  /** Repetition penalty. Default: 1.15. */
  repetitionPenalty?: number;
  /** Timeout in ms. Default: from env AKASH_REQUEST_TIMEOUT_MS or 45000. */
  timeoutMs?: number;
  /** Disable cache lookup for this call. */
  noCache?: boolean;
}

export interface GenerateResult {
  /** The model's text response, cleaned of chat template tokens. */
  text: string;
  /** Wall-clock latency in ms. */
  latencyMs: number;
  /** Whether this came from cache. */
  cached: boolean;
  /** The model ID used. */
  model: string;
  /** Token usage if HF returns it. */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export class HuggingFaceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable?: boolean,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "HuggingFaceError";
  }
}

// ───────────────────────────────────────────────────────────────
// Config (from environment)
// ───────────────────────────────────────────────────────────────

const HF_TOKEN = process.env.HF_TOKEN ?? "";
const HF_MODEL = process.env.HF_MODEL ?? "google/gemma-4-12b-it";
const HF_PROVIDER = process.env.HF_PROVIDER ?? "auto";
const USE_LIVE_MODEL = (process.env.AKASH_USE_LIVE_MODEL ?? "true") !== "false";
const DEFAULT_TIMEOUT_MS = parseInt(process.env.AKASH_REQUEST_TIMEOUT_MS ?? "45000", 10);
const DEFAULT_MAX_TOKENS = parseInt(process.env.AKASH_MAX_TOKENS ?? "300", 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.AKASH_TEMPERATURE ?? "0.7");
const ENABLE_CACHE = (process.env.AKASH_ENABLE_CACHE ?? "true") !== "false";

if (!HF_TOKEN) {
  console.warn(
    "⚠️  HF_TOKEN is not set in environment. Live model calls will fail; only cached/curated fallback will work."
  );
}

// ───────────────────────────────────────────────────────────────
// In-memory LRU cache (200 entries, ~10MB max)
// ───────────────────────────────────────────────────────────────

interface CacheEntry {
  result: GenerateResult;
  timestamp: number;
}

const CACHE_MAX = 200;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const cache = new Map<string, CacheEntry>();

function cacheKey(messages: ChatMessage[], options: GenerateOptions): string {
  // Hash the messages + key options
  const key = JSON.stringify({
    m: messages.map((m) => ({ r: m.role, c: m.content })),
    mt: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    t: options.temperature ?? DEFAULT_TEMPERATURE,
    tp: options.topP ?? 0.95,
    rp: options.repetitionPenalty ?? 1.15,
  });
  return key;
}

function cacheGet(key: string): GenerateResult | null {
  if (!ENABLE_CACHE) return null;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  // Move to end (LRU)
  cache.delete(key);
  cache.set(key, entry);
  return { ...entry.result, cached: true };
}

function cacheSet(key: string, result: GenerateResult): void {
  if (!ENABLE_CACHE) return;
  if (cache.size >= CACHE_MAX) {
    // Evict oldest
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { result: { ...result, cached: false }, timestamp: Date.now() });
}

// ───────────────────────────────────────────────────────────────
// Chat template formatting (Gemma 4 — same as Gemma 2/3)
// ───────────────────────────────────────────────────────────────

/**
 * Format messages into the Gemma chat template.
 *
 * Gemma chat template:
 *   <bos><start_of_turn>user\n{user}<end_of_turn>
 *   <start_of_turn>model\n{assistant}<end_of_turn>
 *
 * System messages get prepended to the first user turn (Gemma doesn't have
 * a separate system role, but the community convention is to fold it into user).
 */
export function formatGemmaChat(messages: ChatMessage[]): string {
  let systemContent = "";
  const turns: string[] = [];
  let pendingUser = "";

  for (const msg of messages) {
    if (msg.role === "system") {
      systemContent = msg.content;
    } else if (msg.role === "user") {
      pendingUser = systemContent
        ? `${systemContent}\n\n${msg.content}`
        : msg.content;
      systemContent = ""; // Only prepend to first user message
    } else if (msg.role === "assistant") {
      // Flush pending user
      if (pendingUser) {
        turns.push(`<start_of_turn>user\n${pendingUser}<end_of_turn>`);
        pendingUser = "";
      }
      turns.push(`<start_of_turn>model\n${msg.content}<end_of_turn>`);
    }
  }
  // Flush any remaining user message
  if (pendingUser) {
    turns.push(`<start_of_turn>user\n${pendingUser}<end_of_turn>`);
  }

  return `<bos>${turns.join("\n")}\n<start_of_turn>model\n`;
}

/**
 * Clean the model's response: strip chat template tokens, trailing whitespace.
 */
function cleanResponse(text: string): string {
  let cleaned = text;
  // Remove end-of-turn markers and everything after
  cleaned = cleaned.split("<end_of_turn>")[0];
  // Remove special tokens
  cleaned = cleaned.replace(/<bos>/g, "").replace(/<eos>/g, "");
  cleaned = cleaned.replace(/<start_of_turn>.*?\n/g, "");
  // Trim
  cleaned = cleaned.trim();
  return cleaned;
}

// ───────────────────────────────────────────────────────────────
// Core: call HF Inference API
// ───────────────────────────────────────────────────────────────

/**
 * Call the Hugging Face Inference API (chat-completions compatible)
 * with retries, timeout, and cache.
 *
 * Endpoint: https://api-inference.huggingface.co/models/{model}/v1/chat/completions
 * (HF's OpenAI-compatible endpoint — works for Gemma, Llama, Mistral, etc.)
 */
async function callHFInference(
  messages: ChatMessage[],
  options: GenerateOptions
): Promise<GenerateResult> {
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const topP = options.topP ?? 0.95;
  const repetitionPenalty = options.repetitionPenalty ?? 1.15;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Build request body (OpenAI-compatible format)
  const body = {
    model: HF_MODEL,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    repetition_penalty: repetitionPenalty,
    stream: false,
  };

  // Endpoint: HF's OpenAI-compatible chat completions
  const url = `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`;

  // Retry loop
  const maxRetries = 3;
  let lastError: HuggingFaceError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const waitMs = Math.min(1000 * 2 ** attempt + Math.random() * 500, 8000);
      console.warn(`  ↻ Retry ${attempt}/${maxRetries} in ${waitMs.toFixed(0)}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }

    // Timeout controller
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    const startMs = Date.now();
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`,
      };
      if (HF_PROVIDER !== "auto") {
        headers["X-HF-Provider"] = HF_PROVIDER;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);
      const latencyMs = Date.now() - startMs;

      // Handle non-2xx
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        // 429 = rate limit (retry), 503 = model loading (retry), 5xx = transient (retry)
        const retryable = response.status === 429 || response.status === 503 || response.status >= 500;
        lastError = new HuggingFaceError(
          `HF API ${response.status}: ${errText.slice(0, 300)}`,
          response.status,
          retryable
        );
        if (!retryable) break; // 4xx (except 429) — don't retry
        console.warn(`  ⚠ HF ${response.status} (retryable): ${errText.slice(0, 150)}`);
        continue;
      }

      // Parse JSON
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      if (!text) {
        lastError = new HuggingFaceError(
          "HF API returned empty response",
          response.status,
          true
        );
        continue;
      }

      return {
        text: cleanResponse(text),
        latencyMs,
        cached: false,
        model: HF_MODEL,
        usage: data?.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
            }
          : undefined,
      };
    } catch (err) {
      clearTimeout(timeoutHandle);
      const isAbort = err instanceof Error && err.name === "AbortError";
      lastError = new HuggingFaceError(
        isAbort ? `Request timed out after ${timeoutMs}ms` : (err as Error).message,
        isAbort ? 408 : 0,
        true,
        err
      );
      console.warn(`  ⚠ Attempt ${attempt + 1} failed: ${lastError.message}`);
      continue;
    }
  }

  // All retries exhausted
  throw lastError ?? new HuggingFaceError("Unknown HF inference failure");
}

// ───────────────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────────────

/**
 * Generate a completion from the configured Gemma model.
 *
 * @param messages — chat messages (system/user/assistant)
 * @param options — generation options
 * @returns the model's response + metadata
 *
 * @example
 * const result = await generate({
 *   messages: [
 *     { role: "system", content: "You are AKASH, a kind Bangla space tutor for kids." },
 *     { role: "user", content: "সূর্য কী?" },
 *   ],
 * });
 * console.log(result.text);
 */
export async function generate(
  messages: ChatMessage[],
  options: GenerateOptions = {}
): Promise<GenerateResult> {
  // Cache lookup
  const key = cacheKey(messages, options);
  if (!options.noCache) {
    const cached = cacheGet(key);
    if (cached) return cached;
  }

  // Live call
  const result = await callHFInference(messages, options);
  cacheSet(key, result);
  return result;
}

/**
 * Check if the HF API is reachable and the token is valid.
 * Used by /api/health.
 */
export async function checkHealth(): Promise<{
  ok: boolean;
  model: string;
  tokenConfigured: boolean;
  liveModelEnabled: boolean;
  cacheEnabled: boolean;
  cacheSize: number;
  latencyMs?: number;
  error?: string;
}> {
  if (!HF_TOKEN) {
    return {
      ok: false,
      model: HF_MODEL,
      tokenConfigured: false,
      liveModelEnabled: USE_LIVE_MODEL,
      cacheEnabled: ENABLE_CACHE,
      cacheSize: cache.size,
      error: "HF_TOKEN not configured",
    };
  }

  try {
    // Lightweight health check: just send "hi" and check we get a response
    const start = Date.now();
    const result = await generate(
      [
        {
          role: "user",
          content: "Reply with exactly: OK",
        },
      ],
      {
        maxTokens: 10,
        temperature: 0,
        noCache: true,
        timeoutMs: 15000,
      }
    );
    return {
      ok: true,
      model: HF_MODEL,
      tokenConfigured: true,
      liveModelEnabled: USE_LIVE_MODEL,
      cacheEnabled: ENABLE_CACHE,
      cacheSize: cache.size,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      model: HF_MODEL,
      tokenConfigured: true,
      liveModelEnabled: USE_LIVE_MODEL,
      cacheEnabled: ENABLE_CACHE,
      cacheSize: cache.size,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Get current config for debugging (no secrets).
 */
export function getConfig() {
  return {
    model: HF_MODEL,
    provider: HF_PROVIDER,
    liveModelEnabled: USE_LIVE_MODEL,
    cacheEnabled: ENABLE_CACHE,
    cacheSize: cache.size,
    tokenConfigured: Boolean(HF_TOKEN),
    defaultMaxTokens: DEFAULT_MAX_TOKENS,
    defaultTemperature: DEFAULT_TEMPERATURE,
    defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
  };
}

// ───────────────────────────────────────────────────────────────
// AKASH system prompt (kid-safe persona)
// ───────────────────────────────────────────────────────────────

export const AKASH_SYSTEM_PROMPT = `You are AKASH (আকাশ), a kind Bangladeshi space tutor for children aged 7-14. You explain space science in simple Bangla.

ABSOLUTE RULES (never violate):
1. Always respond in BANGLA (Bengali script). Use simple class-5 reading level.
2. On first mention of a scientific term, include the English term in parentheses. Example: কৃষ্ণ গহ্বর (black hole) হলো...
3. Keep answers to 1-3 sentences. Be warm, encouraging, curious.
4. NEVER mention scary, violent, sexual, or adult content. If a question hints at any, gently redirect.
5. If unsure of a fact, say: "আমি নিশ্চিত না, একটু পরে আবার জিজ্ঞাসা করো।"
6. If the question is not about space, gently redirect: "আমি শুধু মহাকাশ নিয়ে কথা বলি। মহাকাশ সম্পর্কে কিছু জিজ্ঞাসা করো!"
7. When stating numbers (temperatures, distances, sizes), be factual. Use these known facts:
   - Sun surface: 5,500°C; Sun core: 15,000,000°C; Sun diameter: 1,391,000 km
   - Earth-Sun distance: 150,000,000 km; Earth-Moon distance: 384,400 km
   - Moon gravity: 1/6 of Earth; Moon orbits Earth in 27.3 days
   - Mars: red due to iron oxide (rust); has 2 moons (Phobos, Deimos)
   - Jupiter: largest planet, 1,300 Earths could fit inside, has Great Red Spot (300+ year storm)
   - Saturn: famous rings made of ice and rock
   - Black hole: gravity so strong nothing escapes, not even light
   - Big Bang: 13.8 billion years ago
   - Light speed: 300,000 km/s; light year = distance light travels in 1 year
8. End with a small encouraging word like "আরও জানতে চাও?" (Want to know more?) if appropriate.

You are AKASH — a friend, not a teacher. Be curious with the child, not above them.`;
