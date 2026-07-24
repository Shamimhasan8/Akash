/**
 * AKASH — /api/story endpoint
 *
 * POST /api/story
 * Body: { topic: SpaceTopic, lang?: "bn" | "en" }
 * Returns: { title, chapters: [{bn, en}], source, fallback, latencyMs }
 *
 * Strategy:
 *  1. Always check curated story library first (we have 3 hand-written stories)
 *  2. If found: return curated story (fast, reliable)
 *  3. If not found AND live model enabled: ask Gemma to generate a new story
 *  4. If live fails: return a curated story from a related topic as fallback
 */

import { NextRequest, NextResponse } from "next/server";
import { generate, AKASH_SYSTEM_PROMPT, getConfig } from "@/lib/huggingface";
import { STORIES, type SpaceTopic } from "@/lib/akash-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TOPICS = new Set<string>([
  "sun", "moon", "earth", "mars", "jupiter", "saturn", "venus", "mercury",
  "neptune", "uranus", "black_hole", "galaxy", "star", "comet", "meteor",
  "rocket", "astronaut", "iss", "big_bang", "eclipse",
]);

interface StoryRequestBody {
  topic?: unknown;
  lang?: unknown;
  mode?: unknown;
}

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  let body: StoryRequestBody;
  try {
    body = (await req.json()) as StoryRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic : "";
  const lang = body.lang === "en" ? "en" : "bn";
  const forceMode = body.mode === "curated" ? "curated" : body.mode === "live" ? "live" : "auto";

  if (!topic || !VALID_TOPICS.has(topic)) {
    return NextResponse.json(
      { error: `Invalid topic. Must be one of: ${Array.from(VALID_TOPICS).join(", ")}` },
      { status: 400 }
    );
  }

  const config = getConfig();

  // ── Step 1: Try curated story first ─────────────────────────────
  const curatedStory = STORIES.find((s) => s.topic === (topic as SpaceTopic));
  if (curatedStory && forceMode !== "live") {
    return NextResponse.json({
      title: lang === "bn" ? curatedStory.title_bn : curatedStory.title_en,
      chapters: curatedStory.chapters,
      source: "AKASH curated story library",
      fallback: "curated",
      latencyMs: Date.now() - startMs,
      topic,
    });
  }

  // ── Step 2: Live generation (if enabled) ────────────────────────
  if (config.liveModelEnabled && forceMode !== "curated") {
    try {
      const storyPrompt = `একটি শিশুর জন্য ${topic} সম্পর্কে একটি ছোট গল্প লেখো। গল্পের নায়ক হবে একজন শিশু যে ${topic}-এ যায় বা সে সম্পর্কে শেখে। গল্পটি ৪টি ছোট অধ্যায়ে লেখো। প্রতিটি অধ্যায় ২-৩ বাক্যের।

প্রতিটি অধ্যায়ের শুরুতে "অধ্যায় ১:", "অধ্যায় ২:" ইত্যাদি লেখো।

JSON আকারে উত্তর দাও:
{"title": "গল্পের নাম", "chapters": [{"bn": "অধ্যায় ১ টেক্সট"}, {"bn": "অধ্যায় ২ টেক্সট"}, ...]}

শুধু JSON, অন্য কিছু না।`;

      const result = await generate(
        [
          { role: "system", content: AKASH_SYSTEM_PROMPT },
          { role: "user", content: storyPrompt },
        ],
        {
          maxTokens: 800,
          temperature: 0.85,
          topP: 0.95,
          timeoutMs: 60000,
        }
      );

      // Try to parse JSON from response
      let storyData: { title?: string; chapters?: Array<{ bn?: string; en?: string }> } | null = null;
      try {
        storyData = JSON.parse(result.text);
      } catch {
        // Fallback: try regex extract
        const match = result.text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            storyData = JSON.parse(match[0]);
          } catch {
            // Ignore
          }
        }
      }

      if (storyData?.chapters && Array.isArray(storyData.chapters) && storyData.chapters.length > 0) {
        return NextResponse.json({
          title: storyData.title ?? `${topic} গল্প`,
          chapters: storyData.chapters.map((c) => ({
            bn: c.bn ?? c.en ?? "",
            en: c.en ?? c.bn ?? "",
          })),
          source: `Live: ${result.model}`,
          fallback: result.cached ? "cache" : "live",
          latencyMs: Date.now() - startMs,
          model: result.model,
          topic,
        });
      }
      // Parse failed — fall through to curated fallback
      console.warn("[api/story] Live response not parseable as JSON, falling back to curated");
    } catch (err) {
      console.error(`[api/story] Live generation failed:`, err instanceof Error ? err.message : err);
    }
  }

  // ── Step 3: Fallback to curated (any topic if exact not found) ───
  const fallbackStory = curatedStory ?? STORIES[0];
  return NextResponse.json({
    title: lang === "bn" ? fallbackStory.title_bn : fallbackStory.title_en,
    chapters: fallbackStory.chapters,
    source: "AKASH curated story library (fallback)",
    fallback: "curated",
    fallbackReason: "Live story generation unavailable",
    latencyMs: Date.now() - startMs,
    topic,
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/story",
    method: "POST",
    schema: {
      request: {
        topic: "SpaceTopic (required)",
        lang: '"bn" | "en" (default: "bn")',
        mode: '"live" | "curated" | "auto" (default: "auto")',
      },
      response: {
        title: "string",
        chapters: "Array<{ bn: string, en: string }>",
        source: "string",
        fallback: '"live" | "cache" | "curated"',
      },
    },
    availableTopics: STORIES.map((s) => s.topic),
  });
}
