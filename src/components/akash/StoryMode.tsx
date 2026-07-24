"use client";

import { useState, useCallback } from "react";
import { useAkash, useVoice } from "@/lib/akash-context";
import { STORIES, type SpaceTopic } from "@/lib/akash-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Volume2, Square, BookOpen, ChevronRight, RotateCcw, Zap, Database,
} from "lucide-react";

interface StoryApiResponse {
  title: string;
  chapters: { bn: string; en: string }[];
  source: string;
  fallback: "live" | "cache" | "curated";
  latencyMs: number;
  topic: string;
}

export function StoryMode() {
  const { lang, t } = useAkash();
  const { speak, stop } = useVoice();
  const [selectedStory, setSelectedStory] = useState<{
    title: string;
    chapters: { bn: string; en: string }[];
    fallback: "live" | "cache" | "curated";
    source: string;
  } | null>(null);
  const [chapter, setChapter] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickStory = useCallback(
    async (topic: SpaceTopic) => {
      setLoading(true);
      setChapter(0);
      stop();
      setSpeaking(false);

      // First try the curated library (synchronous, instant)
      const curated = STORIES.find((s) => s.topic === topic);
      if (curated) {
        // Use curated — instant, reliable
        setSelectedStory({
          title: lang === "bn" ? curated.title_bn : curated.title_en,
          chapters: curated.chapters,
          fallback: "curated",
          source: "AKASH curated story library",
        });
        setLoading(false);
        return;
      }

      // No curated match — call /api/story for live generation
      try {
        const response = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, lang, mode: "auto" }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: StoryApiResponse = await response.json();
        setSelectedStory({
          title: data.title,
          chapters: data.chapters,
          fallback: data.fallback,
          source: data.source,
        });
      } catch (err) {
        // Fallback to first curated story
        const fallback = STORIES[0];
        setSelectedStory({
          title: lang === "bn" ? fallback.title_bn : fallback.title_en,
          chapters: fallback.chapters,
          fallback: "curated",
          source: `AKASH fallback (${err instanceof Error ? err.message : "error"})`,
        });
      } finally {
        setLoading(false);
      }
    },
    [lang, stop]
  );

  const next = () => {
    if (!selectedStory) return;
    if (chapter < selectedStory.chapters.length - 1) {
      setChapter(chapter + 1);
      stop();
      setSpeaking(false);
    } else {
      setSelectedStory(null);
      setChapter(0);
      stop();
      setSpeaking(false);
    }
  };

  const restart = () => {
    setChapter(0);
    stop();
    setSpeaking(false);
  };

  const toggleSpeak = (text: string) => {
    if (speaking) {
      stop();
      setSpeaking(false);
    } else {
      speak(text, lang);
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), text.length * 80);
    }
  };

  // Library view
  const storyEmoji: Record<string, string> = {
    moon: "🌙", mars: "🔴", sun: "☀️", earth: "🌍", jupiter: "🪐",
    saturn: "🪐", black_hole: "🕳️", galaxy: "🌌", star: "⭐", comet: "☄️",
  };
  const storyGradient: Record<string, string> = {
    moon: "linear-gradient(135deg, rgba(192,197,208,0.15), rgba(126,197,237,0.08))",
    mars: "linear-gradient(135deg, rgba(217,84,77,0.15), rgba(232,93,122,0.08))",
    sun: "linear-gradient(135deg, rgba(214,186,101,0.15), rgba(245,224,138,0.08))",
    default: "linear-gradient(135deg, rgba(139,111,240,0.15), rgba(94,58,202,0.08))",
  };

  if (!selectedStory) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-10 akash-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4 akash-float"
            style={{ background: "linear-gradient(135deg, rgba(94,58,202,0.25), rgba(139,111,240,0.15))", border: "1px solid rgba(139,111,240,0.4)" }}>
            <BookOpen className="w-7 h-7" style={{ color: "#8b6ff0" }} />
          </div>
          <h2 className="text-4xl font-black mb-3 font-space akash-gradient-cosmic">
            {t("গল্পের মহাকাশ", "Story Cosmos")}
          </h2>
          <p className="text-akash-muted font-bn text-base">
            {t(
              "একটা গল্প বেছে নাও — আকাশ তোমাকে গল্প শোনাবে",
              "Pick a story — AKASH will narrate a magical space tale"
            )}
          </p>
        </div>

        {loading && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{ background: "rgba(139,111,240,0.1)", border: "1px solid rgba(139,111,240,0.25)" }}>
              <div className="akash-loading-dots flex items-center gap-1">
                <span /><span /><span />
              </div>
              <span className="text-sm font-bn" style={{ color: "#8b6ff0" }}>
                {t("গেমা গল্প বানাচ্ছে...", "Gemma is crafting a story...")}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {STORIES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => pickStory(s.topic)}
              disabled={loading}
              className="group text-left relative overflow-hidden rounded-2xl p-6 transition-all duration-300 disabled:opacity-50"
              style={{
                background: storyGradient[s.topic] ?? storyGradient.default,
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                animationDelay: `${idx * 0.07}s`,
              }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)" }} />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(8px)" }}>
                  {storyEmoji[s.topic] ?? "✨"}
                </div>
                <ChevronRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1"
                  style={{ color: "rgba(255,255,255,0.4)" }} />
              </div>
              <h3 className={`text-lg font-bold text-akash-star mb-1.5 relative z-10 ${lang === "bn" ? "font-bn" : "font-space"}`}>
                {lang === "bn" ? s.title_bn : s.title_en}
              </h3>
              <p className="text-xs relative z-10" style={{ color: "rgba(168,184,204,0.8)" }}>
                {s.chapters.length} {t("অধ্যায়", "chapters")} · {t("কিউরেটেড লাইব্রেরি", "curated library")}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-akash-muted font-bn">
            {t(
              "৩টি হাতে-লেখা গল্প পাওয়া যাচ্ছে। অন্যান্য বিষয়ের জন্য গেমা লাইভ গল্প তৈরি করবে।",
              "3 hand-crafted stories available. For other topics, Gemma will generate live."
            )}
          </p>
        </div>
      </div>
    );
  }

  // Story reader view
  const currentChapter = selectedStory.chapters[chapter];
  const chapterText = lang === "bn" ? currentChapter.bn : currentChapter.en;
  const isLive = selectedStory.fallback === "live" || selectedStory.fallback === "cache";
  const progress = ((chapter + 1) / selectedStory.chapters.length) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 akash-fade-up"
        style={{
          background: "rgba(7,9,31,0.85)",
          border: "1px solid rgba(139,111,240,0.25)",
          backdropFilter: "blur(32px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(94,58,202,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
        {/* Decorative orbit */}
        <div className="absolute -right-24 -top-24 w-72 h-72 akash-orbit opacity-20 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(94,58,202,0.12), transparent 70%)" }} />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: "rgba(214,186,101,0.1)", color: "#d6ba65", border: "1px solid rgba(214,186,101,0.25)" }}>
                  {t("অধ্যায়", "Chapter")} {chapter + 1}/{selectedStory.chapters.length}
                </span>
                {isLive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: "rgba(214,186,101,0.1)", color: "#d6ba65", border: "1px solid rgba(214,186,101,0.3)" }}>
                    <Zap className="w-2.5 h-2.5" /> Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: "rgba(139,111,240,0.1)", color: "#8b6ff0", border: "1px solid rgba(139,111,240,0.3)" }}>
                    <Database className="w-2.5 h-2.5" /> Curated
                  </span>
                )}
              </div>
              <h3 className={`text-2xl md:text-3xl font-black text-akash-star ${lang === "bn" ? "font-bn" : "font-space"}`}>
                {selectedStory.title}
              </h3>
            </div>
            <button
              onClick={restart}
              className="p-2 rounded-xl transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6a8ba8" }}
              aria-label={t("আবার শুরু", "Restart")}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full mb-8 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #5e3aca, #8b6ff0)" }} />
          </div>

          {/* Chapter text */}
          <div className="min-h-[180px] mb-8">
            <p
              className={`text-lg md:text-xl leading-[1.85] text-akash-star akash-fade-up ${
                lang === "bn" ? "font-bn" : "font-space"
              }`}
              key={chapter}
            >
              {chapterText}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => toggleSpeak(chapterText)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={speaking
                ? { background: "linear-gradient(135deg, #d6ba65, #f5e08a)", color: "#030510", boxShadow: "0 0 20px rgba(214,186,101,0.4)" }
                : { background: "rgba(214,186,101,0.08)", border: "1px solid rgba(214,186,101,0.25)", color: "#d6ba65" }}
            >
              {speaking ? (
                <>
                  <div className="akash-voice-wave flex items-center gap-px" style={{ color: "#030510" }}>
                    <span style={{ height: "10px" }} />
                    <span style={{ height: "14px" }} />
                    <span style={{ height: "8px" }} />
                  </div>
                  <Square className="w-3.5 h-3.5" />
                  <span>{t("থামাও", "Stop")}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{t("শোনাও", "Listen")}</span>
                </>
              )}
            </button>

            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #5e3aca, #8b6ff0)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(94,58,202,0.4)",
              }}
            >
              {chapter < selectedStory.chapters.length - 1 ? (
                <>
                  {t("পরের অধ্যায়", "Next chapter")}
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <><span>{t("গল্প শেষ ✨", "Finish ✨")}</span></>
              )}
            </button>
          </div>

          <div className="mt-5 text-[10px] font-mono uppercase tracking-widest" style={{ color: "rgba(106,139,168,0.6)" }}>
            {t("সূত্র", "Source")}: {selectedStory.source}
          </div>
        </div>
      </div>
    </div>
  );
}
