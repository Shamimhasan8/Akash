"use client";

import { useState, useCallback } from "react";
import { useAkash, useVoice } from "@/lib/akash-context";
import { STORIES, type SpaceTopic } from "@/lib/akash-data";
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

const STORY_EMOJI: Record<string, string> = {
  moon: "🌙", mars: "🔴", sun: "☀️", earth: "🌍", jupiter: "🪐",
  saturn: "🪐", black_hole: "🕳️", galaxy: "🌌", star: "⭐", comet: "☄️",
};

export function StoryMode() {
  const { lang, t } = useAkash();
  const { speak, stop } = useVoice();
  const [selectedStory, setSelectedStory] = useState<{
    title: string;
    chapters: { bn: string; en: string }[];
    fallback: "live" | "cache" | "curated";
    source: string;
    topic?: string;
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

      const curated = STORIES.find((s) => s.topic === topic);
      if (curated) {
        setSelectedStory({
          title: lang === "bn" ? curated.title_bn : curated.title_en,
          chapters: curated.chapters,
          fallback: "curated",
          source: "AKASH curated story library",
          topic,
        });
        setLoading(false);
        return;
      }

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
          topic,
        });
      } catch (err) {
        const fallback = STORIES[0];
        setSelectedStory({
          title: lang === "bn" ? fallback.title_bn : fallback.title_en,
          chapters: fallback.chapters,
          fallback: "curated",
          source: `AKASH fallback (${err instanceof Error ? err.message : "error"})`,
          topic: fallback.topic,
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

  /* ── STORY LIBRARY VIEW ── */
  if (!selectedStory) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#f3e5f5] text-3xl mb-3 shadow-sm border border-[#e9d5ff]">
            📖
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 font-display text-[#1a2744]">
            {t("মহাকাশ গল্পের দুনিয়া", "Space Story World")}
          </h2>
          <p className="text-[#5b6b8a] font-bn text-base max-w-lg mx-auto">
            {t(
              "একটি গল্প বেছে নাও — আকাশ তোমাকে দারুণ সব গল্প শোনাবে!",
              "Pick a story — AKASH will narrate an amazing space tale for you!"
            )}
          </p>
        </div>

        {loading && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#e3f2fd] border border-[#bae6fd] text-[#0284c7]">
              <span className="text-xl">✨</span>
              <span className="text-sm font-bold font-bn">
                {t("গেমা গল্প তৈরি করছে...", "Gemma is generating a story...")}
              </span>
            </div>
          </div>
        )}

        {/* Story Cards Grid (Matching index.html) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {STORIES.map((s) => (
            <button
              key={s.id}
              onClick={() => pickStory(s.topic)}
              disabled={loading}
              className="astro-card text-left p-6 flex flex-col justify-between group hover:border-[#38bdf8] transition-all cursor-pointer"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#f0f8ff] border border-[#bae6fd] flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {STORY_EMOJI[s.topic] ?? "✨"}
                </div>
                <h3 className="text-xl font-bold font-display text-[#1a2744] mb-2 group-hover:text-[#0284c7] transition-colors">
                  {lang === "bn" ? s.title_bn : s.title_en}
                </h3>
                <p className="text-xs text-[#5b6b8a] font-bn">
                  {s.chapters.length} {t("অধ্যায়", "chapters")} · {t("মজার মহাকাশ শিক্ষা", "Fun Space Education")}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e0eaf5] flex items-center justify-between text-xs font-bold text-[#0284c7]">
                <span>{t("গল্প শুনুন", "Read Story")}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── STORY READER VIEW ── */
  const currentChapter = selectedStory.chapters[chapter];
  const chapterText = lang === "bn" ? currentChapter.bn : currentChapter.en;
  const progress = ((chapter + 1) / selectedStory.chapters.length) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-8 border border-[#e0eaf5] shadow-xl relative overflow-hidden">

        {/* Top Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#f3e5f5] text-[#7e22ce] text-xs font-bold mb-2">
              {t("অধ্যায়", "Chapter")} {chapter + 1} / {selectedStory.chapters.length}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#1a2744]">
              {selectedStory.title}
            </h3>
          </div>

          <button
            onClick={restart}
            className="p-2.5 rounded-full bg-[#f0f8ff] text-[#5b6b8a] hover:bg-[#e3f2fd] hover:text-[#0284c7] transition-all"
            title={t("আবার শুরু", "Restart")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-[#f0f8ff] mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#38bdf8] to-[#a855f7] transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Chapter Text Box (Matching index.html .story-text yellow border box) */}
        <div className="bg-[#fff9c4] border-l-4 border-[#f59e0b] p-6 rounded-2xl mb-8">
          <p className="text-lg sm:text-xl leading-relaxed text-[#1a2744] font-bn">
            {chapterText}
          </p>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#e0eaf5]">
          <button
            onClick={() => toggleSpeak(chapterText)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
              speaking
                ? "bg-[#1a2744] text-white"
                : "bg-[#fde68a] text-[#1a2744] hover:bg-[#f59e0b] hover:text-white"
            }`}
          >
            {speaking ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>{t("থামাও", "Stop")}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{t("গল্প শোনো", "Listen")}</span>
              </>
            )}
          </button>

          <button
            onClick={next}
            className="btn-primary-grad px-6 py-2.5 text-xs flex items-center gap-2"
          >
            {chapter < selectedStory.chapters.length - 1 ? (
              <>
                <span>{t("পরের অধ্যায়", "Next Chapter")}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <span>{t("গল্প শেষ ✨", "Finish ✨")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
