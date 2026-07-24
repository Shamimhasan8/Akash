/**
 * AKASH — /api/quiz endpoint
 *
 * POST /api/quiz
 * Body: { topic: SpaceTopic, lang?: "bn" | "en" }
 * Returns: { title, questions: [{q_bn, q_en, options_bn, options_en, correct, explain_bn, explain_en}], source, fallback, latencyMs }
 *
 * Strategy:
 *  1. Always check curated quiz library first (we have 4 hand-written quizzes)
 *  2. If found: return curated quiz (fast, reliable, verified correct answers)
 *  3. If not found AND live model enabled: ask Gemma to generate a quiz
 *  4. If live fails: return curated quiz from a related topic
 *
 * Note: For quiz mode, curated is actually BETTER than live — we've verified
 * the correct answers manually. Live generation risks wrong "correct" answers.
 * So we prefer curated for quiz mode even when live is available.
 */

import { NextRequest, NextResponse } from "next/server";
import { generate, getAkashSystemPrompt, getConfig } from "@/lib/huggingface";
import { QUIZZES, type SpaceTopic } from "@/lib/akash-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TOPICS = new Set<string>([
  "sun", "moon", "earth", "mars", "jupiter", "saturn", "venus", "mercury",
  "neptune", "uranus", "black_hole", "galaxy", "star", "comet", "meteor",
  "rocket", "astronaut", "iss", "big_bang", "eclipse",
]);

interface QuizRequestBody {
  topic?: unknown;
  lang?: unknown;
  mode?: unknown;
}

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  let body: QuizRequestBody;
  try {
    body = (await req.json()) as QuizRequestBody;
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

  // ── Step 1: Try curated quiz first (preferred for quiz mode) ────
  const curatedQuiz = QUIZZES.find((q) => q.topic === (topic as SpaceTopic));
  if (curatedQuiz && forceMode !== "live") {
    return NextResponse.json({
      title: lang === "bn" ? curatedQuiz.title_bn : curatedQuiz.title_en,
      questions: curatedQuiz.questions,
      source: "AKASH curated quiz library (verified answers)",
      fallback: "curated",
      latencyMs: Date.now() - startMs,
      topic,
    });
  }

  // ── Step 2: Live generation (only if explicitly requested) ──────
  if (config.liveModelEnabled && forceMode === "live") {
    try {
      const systemPrompt = getAkashSystemPrompt(lang);
      const quizPrompt = lang === "en"
        ? `Create 5 multiple choice questions (MCQ) about ${topic} for children.

Each question has 4 options with only 1 correct index (0-3).

JSON format:
{
  "title": "${topic} Quiz",
  "questions": [
    {
      "q": "Question in English",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": 0,
      "explain": "Explanation why this option is correct"
    }
  ]
}

correct is index (0-3).
Return ONLY valid JSON.`
        : `${topic} সম্পর্কে ৫টি বহুনির্বাচনী প্রশ্ন (MCQ) তৈরি করো শিশুদের জন্য।

প্রতিটি প্রশ্নের ৪টি অপশন থাকবে, শুধু একটি সঠিক।

JSON আকারে উত্তর দাও:
{
  "title": "কুইজের নাম",
  "questions": [
    {
      "q": "প্রশ্ন বাংলায়",
      "options": ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"],
      "correct": 0,
      "explain": "কেন এই উত্তর সঠিক তার ব্যাখ্যা"
    }
  ]
}

correct হলো সঠিক অপশনের ইনডেক্স (0-3)।
শুধু JSON, অন্য কিছু না।`;

      const result = await generate(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: quizPrompt },
        ],
        {
          maxTokens: 1200,
          temperature: 0.5, // Lower temperature for factual quiz
          topP: 0.9,
          timeoutMs: 60000,
        }
      );

      let quizData: {
        title?: string;
        questions?: Array<{
          q?: string;
          options?: string[];
          correct?: number;
          explain?: string;
        }>;
      } | null = null;
      try {
        quizData = JSON.parse(result.text);
      } catch {
        const match = result.text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            quizData = JSON.parse(match[0]);
          } catch {
            // Ignore
          }
        }
      }

      if (quizData?.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
        // Validate each question
        const validQuestions = quizData.questions
          .filter((q) => q.q && Array.isArray(q.options) && q.options.length === 4 && typeof q.correct === "number")
          .map((q) => ({
            q_bn: q.q ?? "",
            q_en: q.q ?? "",
            options_bn: q.options ?? [],
            options_en: q.options ?? [],
            correct: q.correct ?? 0,
            explain_bn: q.explain ?? "",
            explain_en: q.explain ?? "",
          }));

        if (validQuestions.length > 0) {
          return NextResponse.json({
            title: quizData.title ?? `${topic} কুইজ`,
            questions: validQuestions,
            source: `Live: ${result.model}`,
            fallback: result.cached ? "cache" : "live",
            latencyMs: Date.now() - startMs,
            model: result.model,
            topic,
          });
        }
      }
      console.warn("[api/quiz] Live response not parseable, falling back to curated");
    } catch (err) {
      console.error(`[api/quiz] Live generation failed:`, err instanceof Error ? err.message : err);
    }
  }

  // ── Step 3: Fallback to curated ─────────────────────────────────
  const fallbackQuiz = curatedQuiz ?? QUIZZES[0];
  return NextResponse.json({
    title: lang === "bn" ? fallbackQuiz.title_bn : fallbackQuiz.title_en,
    questions: fallbackQuiz.questions,
    source: "AKASH curated quiz library (fallback)",
    fallback: "curated",
    fallbackReason: "Live quiz generation unavailable",
    latencyMs: Date.now() - startMs,
    topic,
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/quiz",
    method: "POST",
    schema: {
      request: {
        topic: "SpaceTopic (required)",
        lang: '"bn" | "en" (default: "bn")',
        mode: '"live" | "curated" | "auto" (default: "auto" — prefers curated)',
      },
      response: {
        title: "string",
        questions: "Array<{ q_bn, q_en, options_bn[4], options_en[4], correct, explain_bn, explain_en }>",
        source: "string",
        fallback: '"live" | "cache" | "curated"',
      },
    },
    availableTopics: QUIZZES.map((q) => q.topic),
    note: "For quiz mode, curated is preferred over live — answers are manually verified for correctness.",
  });
}
