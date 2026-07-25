"use client";

import { useState, useCallback } from "react";
import { useAkash } from "@/lib/akash-context";
import { QUIZZES, type SpaceTopic } from "@/lib/akash-data";
import {
  CheckCircle2, XCircle, Trophy, RotateCcw, Brain, ChevronRight, Database,
} from "lucide-react";

type Stage = "select" | "playing" | "done";

interface QuizQuestion {
  q_bn: string;
  q_en: string;
  options_bn: string[];
  options_en: string[];
  correct: number;
  explain_bn: string;
  explain_en: string;
}

interface LoadedQuiz {
  title: string;
  questions: QuizQuestion[];
  source: string;
  fallback: "live" | "cache" | "curated";
}

const TOPIC_EMOJI: Record<string, string> = {
  moon: "🌙", sun: "☀️", mars: "🔴", black_hole: "🕳️", default: "✨",
};

export function QuizMode() {
  const { lang, t } = useAkash();
  const [stage, setStage] = useState<Stage>("select");
  const [quiz, setQuiz] = useState<LoadedQuiz | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplain, setShowExplain] = useState(false);
  const [loading, setLoading] = useState(false);

  const startQuiz = useCallback(
    async (topic: SpaceTopic) => {
      setLoading(true);
      setQIdx(0);
      setSelected(null);
      setAnswers([]);
      setShowExplain(false);

      const curated = QUIZZES.find((q) => q.topic === topic);
      if (curated) {
        setQuiz({
          title: lang === "bn" ? curated.title_bn : curated.title_en,
          questions: curated.questions,
          source: "AKASH curated quiz (verified answers)",
          fallback: "curated",
        });
        setStage("playing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, lang, mode: "live" }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setQuiz({
            title: data.title ?? `${topic} কুইজ`,
            questions: data.questions,
            source: data.source,
            fallback: data.fallback,
          });
          setStage("playing");
        } else {
          throw new Error("No questions returned");
        }
      } catch (err) {
        const fallback = QUIZZES[0];
        setQuiz({
          title: lang === "bn" ? fallback.title_bn : fallback.title_en,
          questions: fallback.questions,
          source: `AKASH fallback (${err instanceof Error ? err.message : "error"})`,
          fallback: "curated",
        });
        setStage("playing");
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  const pickAnswer = (i: number) => {
    if (selected !== null || !quiz) return;
    setSelected(i);
    const correct = i === quiz.questions[qIdx].correct;
    setAnswers((a) => [...a, correct]);
    setShowExplain(true);
  };

  const next = () => {
    if (!quiz) return;
    if (qIdx < quiz.questions.length - 1) {
      setQIdx(qIdx + 1);
      setSelected(null);
      setShowExplain(false);
    } else {
      setStage("done");
    }
  };

  const restart = () => {
    setStage("select");
    setQuiz(null);
    setQIdx(0);
    setSelected(null);
    setAnswers([]);
    setShowExplain(false);
  };

  /* ── TOPIC SELECT SCREEN ── */
  if (stage === "select") {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#e3f2fd] text-3xl mb-3 shadow-sm border border-[#bae6fd]">
            🎮
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 font-display text-[#1a2744]">
            {t("কুইজ মাস্টার গেম", "Quiz Master Game")}
          </h2>
          <p className="text-[#5b6b8a] font-bn text-base max-w-lg mx-auto">
            {t("একটি বিষয় বেছে নাও — প্রশ্নের সঠিক উত্তর দিয়ে জিতে নাও পয়েন্ট!", "Pick a topic — answer questions and win points!")}
          </p>
        </div>

        {loading && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f8ff] border border-[#bae6fd] text-[#0284c7] font-bold text-xs">
              <span>✨</span>
              <span>{t("গেমা কুইজ বানাচ্ছে...", "Gemma is crafting a quiz...")}</span>
            </div>
          </div>
        )}

        {/* Quiz Topic Cards Grid (Matching index.html .quiz-card) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {QUIZZES.map((q) => {
            const emoji = TOPIC_EMOJI[q.topic] ?? "✨";
            return (
              <button
                key={q.topic}
                onClick={() => startQuiz(q.topic)}
                disabled={loading}
                className="astro-card text-center p-6 hover:border-[#38bdf8] transition-all cursor-pointer flex flex-col items-center justify-between"
              >
                <div>
                  <div className="text-5xl mb-4 transform hover:scale-110 transition-transform">
                    {emoji}
                  </div>
                  <h3 className="font-bold text-lg font-display text-[#1a2744] mb-1">
                    {lang === "bn" ? q.title_bn : q.title_en}
                  </h3>
                  <p className="text-xs text-[#5b6b8a] font-bn">
                    {q.questions.length} {t("প্রশ্ন", "questions")}
                  </p>
                </div>

                <div className="mt-4 px-4 py-1.5 rounded-full bg-[#f0f8ff] text-[#0284c7] font-bold text-xs">
                  {t("খেলুন", "Play")}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── RESULT SCREEN ── */
  if (stage === "done" && quiz) {
    const score = answers.filter(Boolean).length;
    const total = quiz.questions.length;
    const percent = Math.round((score / total) * 100);
    const emoji = percent === 100 ? "🏆" : percent >= 60 ? "🌟" : "💪";

    return (
      <div className="max-w-md mx-auto w-full text-center">
        <div className="bg-white rounded-3xl p-8 border border-[#e0eaf5] shadow-xl">
          <div className="text-7xl mb-4 animate-bounce">{emoji}</div>
          <h2 className="text-2xl font-extrabold font-display text-[#1a2744] mb-2">
            {percent === 100
              ? t("অসাধারণ! তুমি মহাকাশ বিশেষজ্ঞ!", "Amazing! Space Expert!")
              : percent >= 60
              ? t("খুব ভালো! চমৎকার খেলেছো!", "Great job! Well played!")
              : t("ভালো চেষ্টা! আবার খেলো!", "Good try! Play again!")}
          </h2>

          <div className="my-6 p-4 rounded-2xl bg-[#f0f8ff] border border-[#bae6fd]">
            <div className="text-5xl font-black text-[#0284c7] font-display">
              {score} / {total}
            </div>
            <p className="text-xs font-bold text-[#5b6b8a] mt-2">
              {percent}% {t("সঠিক উত্তর", "Correct")}
            </p>
          </div>

          <button
            onClick={restart}
            className="btn-primary-grad w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t("আবার খেলুন", "Play Again")}</span>
          </button>
        </div>
      </div>
    );
  }

  /* ── PLAYING QUIZ ── */
  if (!quiz) return null;
  const question = quiz.questions[qIdx];
  const isBn = lang === "bn";
  const optText = (i: number) => (isBn ? question.options_bn[i] : question.options_en[i]);

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0eaf5] shadow-xl">
        
        {/* Quiz Progress Row */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-[#5b6b8a]">
            {t("প্রশ্ন", "Question")} {qIdx + 1} / {quiz.questions.length}
          </span>

          <div className="flex gap-1.5">
            {quiz.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i < qIdx
                    ? answers[i] ? "w-4 bg-emerald-500" : "w-4 bg-red-400"
                    : i === qIdx
                    ? "w-6 bg-[#0284c7]"
                    : "w-2 bg-[#e0eaf5]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Heading */}
        <h3 className="text-xl sm:text-2xl font-bold text-[#1a2744] mb-6 font-display">
          {isBn ? question.q_bn : question.q_en}
        </h3>

        {/* Options List */}
        <div className="space-y-3 mb-6">
          {[0, 1, 2, 3].map((i) => {
            const isCorrect = i === question.correct;
            const isSelected = i === selected;
            const showState = selected !== null;

            return (
              <button
                key={i}
                onClick={() => pickAnswer(i)}
                disabled={showState}
                className={`w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${
                  showState && isCorrect
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm"
                    : showState && isSelected && !isCorrect
                    ? "bg-red-50 border-red-400 text-red-700 shadow-sm"
                    : "bg-[#f0f8ff] border-[#e0eaf5] text-[#1a2744] hover:border-[#38bdf8] hover:bg-[#e3f2fd]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-white border border-[#bae6fd] flex items-center justify-center text-xs font-bold text-[#0284c7]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{optText(i)}</span>
                </div>

                {showState && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {showState && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Banner */}
        {showExplain && (
          <div className="p-4 rounded-2xl bg-[#fff9c4] border border-[#fde68a] text-sm font-bn mb-6 text-[#1a2744]">
            <span className="font-bold text-[#f59e0b] mr-1">💡 {t("ব্যাখ্যা", "Explanation")}:</span>
            {isBn ? question.explain_bn : question.explain_en}
          </div>
        )}

        {/* Next Button */}
        {showExplain && (
          <button
            onClick={next}
            className="btn-primary-grad w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            <span>{qIdx < quiz.questions.length - 1 ? t("পরের প্রশ্ন", "Next Question") : t("ফলাফল দেখুন", "See Result")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
