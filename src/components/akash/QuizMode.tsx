"use client";

import { useState, useCallback } from "react";
import { useAkash } from "@/lib/akash-context";
import { QUIZZES, type SpaceTopic } from "@/lib/akash-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

      // For quizzes, prefer curated (answers are manually verified)
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

      // No curated quiz for this topic — try /api/quiz for live generation
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
        // Fallback to first curated quiz
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

  // Topic select
  if (stage === "select") {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <Brain className="w-12 h-12 text-akash-cyan-bright mx-auto mb-3 akash-float" />
          <h2 className="text-3xl font-bold akash-gradient-gold mb-2 font-bn">
            {t("কুইজ মাস্টার", "Quiz Master")}
          </h2>
          <p className="text-akash-muted font-bn">
            {t(
              "একটা বিষয় বেছে নাও — প্রশ্নের উত্তর দাও",
              "Pick a topic — answer the questions"
            )}
          </p>
        </div>

        {loading && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full akash-glass">
              <div className="akash-loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="text-sm text-akash-muted font-bn">
                {t("গেমা কুইজ বানাচ্ছে...", "Gemma is making a quiz...")}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUIZZES.map((q) => {
            const emoji =
              q.topic === "moon" ? "🌙"
              : q.topic === "sun" ? "☀"
              : q.topic === "mars" ? "🔴"
              : q.topic === "black_hole" ? "🕳"
              : "✨";
            return (
              <button
                key={q.topic}
                onClick={() => startQuiz(q.topic)}
                disabled={loading}
                className="akash-glass p-5 text-center hover:scale-[1.04] transition-transform disabled:opacity-50"
              >
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className={`font-bold text-akash-star ${lang === "bn" ? "font-bn" : ""}`}>
                  {lang === "bn" ? q.title_bn : q.title_en}
                </h3>
                <p className="text-xs text-akash-muted mt-1">
                  {q.questions.length} {t("প্রশ্ন", "questions")} · {t("যাচাইকৃত", "verified")}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-akash-muted font-bn inline-flex items-center gap-1">
            <Database className="w-3 h-3" />
            {t(
              "সব কুইজের উত্তর হাতে যাচাই করা — শিশুদের জন্য নিরাপদ।",
              "All quiz answers are manually verified — safe for kids."
            )}
          </p>
        </div>
      </div>
    );
  }

  // Result screen
  if (stage === "done" && quiz) {
    const score = answers.filter(Boolean).length;
    const total = quiz.questions.length;
    const percent = Math.round((score / total) * 100);
    const emoji = percent === 100 ? "🏆" : percent >= 60 ? "🌟" : "💪";
    const msg =
      percent === 100
        ? t("অসাধারণ! তুমি মহাকাশ বিশেষজ্ঞ!", "Amazing! You're a space expert!")
        : percent >= 60
        ? t("খুব ভালো! আরেকটু চেষ্টা করো।", "Great job! Try a bit more.")
        : t("চমৎকার চেষ্টা! আবার খেলো।", "Great try! Play again.");

    return (
      <div className="max-w-md mx-auto w-full text-center">
        <Card className="akash-glass-strong p-8">
          <div className="text-7xl mb-4 akash-float">{emoji}</div>
          <h2 className="text-3xl font-bold akash-gradient-gold mb-2 font-bn">{msg}</h2>
          <div className="my-6">
            <div className="text-5xl font-bold text-akash-gold-bright">
              {score}/{total}
            </div>
            <p className="text-akash-muted mt-2">
              {percent}% {t("সঠিক", "correct")}
            </p>
          </div>
          <Button onClick={restart} className="bg-akash-gold hover:bg-akash-gold-bright text-akash-night">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("আবার খেলো", "Play again")}
          </Button>
        </Card>
      </div>
    );
  }

  // Playing
  if (!quiz) return null;
  const question = quiz.questions[qIdx];
  const isBn = lang === "bn";
  const optText = (i: number) => (isBn ? question.options_bn[i] : question.options_en[i]);

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-akash-muted">
          {t("প্রশ্ন", "Question")} {qIdx + 1}/{quiz.questions.length}
        </div>
        <div className="flex gap-1">
          {quiz.questions.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1 rounded-full ${
                i < qIdx
                  ? answers[i]
                    ? "bg-akash-gold"
                    : "bg-akash-purple"
                  : i === qIdx
                  ? "bg-akash-cyan"
                  : "bg-akash-muted/30"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="akash-glass-strong p-6 md:p-8 mb-5">
        <h3 className={`text-xl md:text-2xl font-bold text-akash-star mb-6 ${isBn ? "font-bn" : ""}`}>
          {isBn ? question.q_bn : question.q_en}
        </h3>

        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => {
            const isCorrect = i === question.correct;
            const isSelected = i === selected;
            const showState = selected !== null;

            return (
              <button
                key={i}
                onClick={() => pickAnswer(i)}
                disabled={showState}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                  showState && isCorrect
                    ? "bg-akash-gold/20 border-akash-gold text-akash-gold-bright"
                    : showState && isSelected && !isCorrect
                    ? "bg-akash-purple/20 border-akash-purple text-akash-purple-bright"
                    : "akash-glass text-akash-star hover:border-akash-gold/60"
                } ${isBn ? "font-bn" : ""}`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-sm">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {optText(i)}
                </span>
                {showState && isCorrect && <CheckCircle2 className="w-5 h-5 text-akash-gold" />}
                {showState && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-akash-purple-bright" />
                )}
              </button>
            );
          })}
        </div>

        {showExplain && (
          <div className="mt-5 p-4 rounded-xl bg-akash-card border border-akash-border akash-fade-up">
            <p className={`text-sm text-akash-star-dim ${isBn ? "font-bn" : ""}`}>
              <span className="text-akash-gold font-bold">
                {answers[answers.length - 1] ? "✓ " : "→ "}
              </span>
              {isBn ? question.explain_bn : question.explain_en}
            </p>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-[10px] text-akash-muted uppercase tracking-wider">
          {t("সূত্র", "Source")}: {quiz.source}
        </div>
        {showExplain && (
          <Button
            onClick={next}
            className="bg-akash-cyan hover:bg-akash-cyan-bright text-akash-night"
          >
            {qIdx < quiz.questions.length - 1 ? (
              <>
                {t("পরের প্রশ্ন", "Next question")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-1" />
                {t("ফলাফল দেখো", "See result")}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
