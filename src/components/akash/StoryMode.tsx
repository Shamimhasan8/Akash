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
  if (!selectedStory) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <BookOpen className="w-12 h-12 text-akash-purple-bright mx-auto mb-3 akash-float" />
          <h2 className="text-3xl font-bold akash-gradient-cosmic mb-2 font-bn">
            {t("গল্পের মহাকাশ", "Story Cosmos")}
          </h2>
          <p className="text-akash-muted font-bn">
            {t(
              "একটা গল্প বেছে নাও — আকাশ তোমাকে গল্প শোনাবে",
              "Pick a story — AKASH will tell you a tale"
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
                {t("গেমা গল্প বানাচ্ছে...", "Gemma is crafting a story...")}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STORIES.map((s) => (
            <button
              key={s.id}
              onClick={() => pickStory(s.topic)}
              disabled={loading}
              className="akash-glass p-6 text-left group hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">
                  {s.topic === "moon" ? "🌙" : s.topic === "mars" ? "🔴" : s.topic === "sun" ? "☀" : "✨"}
                </span>
                <ChevronRight className="w-5 h-5 text-akash-muted group-hover:text-akash-gold transition-colors" />
              </div>
              <h3 className={`text-xl font-bold text-akash-star mb-2 ${lang === "bn" ? "font-bn" : ""}`}>
                {lang === "bn" ? s.title_bn : s.title_en}
              </h3>
              <p className="text-sm text-akash-muted">
                {s.chapters.length} {t("অধ্যায়", "chapters")} · {t("কিউরেটেড", "curated")}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-akash-muted font-bn">
            {t(
              "৩টি হাতে-লেখা গল্প পাওয়া যাচ্ছে। অন্যান্য topic-এর জন্য গেমা লাইভ গল্প তৈরি করবে।",
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

  return (
    <div className="max-w-3xl mx-auto w-full">
      <Card className="akash-glass-strong p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-60 h-60 akash-orbit opacity-30 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-akash-gold">
                  {t("গল্প", "Story")} · {chapter + 1}/{selectedStory.chapters.length}
                </span>
                {isLive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-akash-gold/15 text-akash-gold text-[10px] uppercase tracking-wider">
                    <Zap className="w-3 h-3" /> Live Gemma
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-akash-purple/15 text-akash-purple-bright text-[10px] uppercase tracking-wider">
                    <Database className="w-3 h-3" /> Curated
                  </span>
                )}
              </div>
              <h3 className={`text-2xl font-bold text-akash-star ${lang === "bn" ? "font-bn" : ""}`}>
                {selectedStory.title}
              </h3>
            </div>
            <button
              onClick={restart}
              className="text-akash-muted hover:text-akash-gold transition-colors"
              aria-label={t("আবার শুরু", "Restart")}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="min-h-[200px] mb-8">
            <p
              className={`text-lg md:text-xl leading-relaxed text-akash-star akash-fade-up ${
                lang === "bn" ? "font-bn" : ""
              }`}
              key={chapter}
            >
              {chapterText}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => toggleSpeak(chapterText)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                speaking
                  ? "bg-akash-gold text-akash-night"
                  : "akash-glass text-akash-gold hover:border-akash-gold/60"
              }`}
            >
              {speaking ? (
                <>
                  <Square className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("থামাও", "Stop")}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("শোনাও", "Listen")}</span>
                </>
              )}
            </button>

            <Button
              onClick={next}
              className="bg-akash-purple hover:bg-akash-purple-bright text-white"
            >
              {chapter < selectedStory.chapters.length - 1 ? (
                <>
                  {t("পরের অধ্যায়", "Next chapter")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                t("গল্প শেষ", "Finish")
              )}
            </Button>
          </div>

          <div className="mt-4 text-[10px] text-akash-muted uppercase tracking-wider">
            {t("সূত্র", "Source")}: {selectedStory.source}
          </div>
        </div>
      </Card>
    </div>
  );
}
