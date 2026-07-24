"use client";

import { useState } from "react";
import { AkashProvider, useAkash } from "@/lib/akash-context";
import { Button } from "@/components/ui/button";
import {
  Sparkles, BookOpen, Brain, Map as MapIcon,
  Languages, Github, Rocket, ShieldCheck,
} from "lucide-react";
import { AskMode } from "@/components/akash/AskMode";
import { StoryMode } from "@/components/akash/StoryMode";
import { QuizMode } from "@/components/akash/QuizMode";
import { StarMap } from "@/components/akash/StarMap";

type Mode = "ask" | "story" | "quiz" | "map";

function AKASHApp() {
  const { lang, toggleLang, t } = useAkash();
  const [mode, setMode] = useState<Mode>("ask");

  const modes: {
    id: Mode;
    icon: typeof Sparkles;
    label_bn: string;
    label_en: string;
  }[] = [
    { id: "ask", icon: Sparkles, label_bn: "জিজ্ঞাসা", label_en: "Ask AI" },
    { id: "story", icon: BookOpen, label_bn: "মহাকাশ গল্প", label_en: "Stories" },
    { id: "quiz", icon: Brain, label_bn: "কুইজ মাস্টার", label_en: "Quiz" },
    { id: "map", icon: MapIcon, label_bn: "তারার মানচিত্র", label_en: "Star Map" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden text-[#1d1d1f]">
      {/* Subtle Starfield */}
      <div className="akash-starfield" aria-hidden />

      {/* Header */}
      <header className="relative z-20 pt-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-black/10 flex items-center justify-center shadow-md backdrop-blur-xl">
              <Sparkles className="w-4.5 h-4.5 text-[#d97706]" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#1d1d1f] leading-none">
                AKASH
              </div>
              <div className="text-[10px] tracking-widest mt-1 text-[#6e6e73] font-bn">
                {t("শিশুদের মহাকাশ বন্ধু", "Kids' Space Tutor")}
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-[11px] font-medium text-[#6e6e73] shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6366f1]" />
              <span>Gemma 4</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="h-9 px-4 rounded-full font-semibold text-xs transition-all duration-300 bg-white hover:bg-[#f5f5f7] border border-black/10 text-[#1d1d1f] shadow-sm"
            >
              <Languages className="w-3.5 h-3.5 mr-1.5 text-[#d97706]" />
              {lang === "bn" ? "EN" : "বাংলা"}
            </Button>

            <a
              href="https://github.com/Shamimhasan8/Akash"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/10 text-[#6e6e73] hover:text-[#1d1d1f] transition-all duration-300 shadow-sm"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero (Steve Jobs minimalist white presentation) */}
      {mode === "ask" && (
        <section className="relative z-10 px-4 sm:px-6 pt-10 md:pt-14 pb-6 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1 rounded-full bg-white border border-black/10 text-[11px] font-medium text-[#6e6e73] shadow-sm">
              <Rocket className="w-3 h-3 text-[#d97706]" />
              <span>{t("বাংলা · English · Banglish সমর্থিত", "Supports Bangla, English & Banglish")}</span>
            </div>

            {/* Apple White Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-3 apple-headline font-bn leading-[1.05]">
              {t("মহাকাশের গল্প, বাংলায় শিখি", "Stories of Space, Learned in Bangla")}
            </h1>

            <p className="text-sm sm:text-base text-[#6e6e73] max-w-lg mx-auto mb-6 font-bn leading-relaxed">
              {t(
                "গেমা ৪ দ্বারা চালিত শিশুদের মহাকাশ শিক্ষক। যেকোনো ভাষায় প্রশ্ন করো — বাংলা, English, বা Banglish!",
                "Powered by Gemma 4. Ask questions in Bangla, English, or Banglish!"
              )}
            </p>

            {/* Micro feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[
                t("🎙️ ভয়েস ইনপুট (Voice)", "🎙️ Voice Input & TTS"),
                t("✨ লাইভ গেমা (Gemma 4)", "✨ Live Gemma 4"),
                t("🛡️ শিশু-নিরাপদ (Kid-Safe)", "🛡️ Kid-Safe AI"),
              ].map((label) => (
                <span key={label} className="apple-chip text-xs">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Apple White Segmented Switcher */}
      <nav className="relative z-20 px-4 sm:px-6 pb-6 pt-2">
        <div className="max-w-md mx-auto">
          <div className="apple-pill-nav grid grid-cols-4 gap-1">
            {modes.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  id={`mode-btn-${m.id}`}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${
                    active
                      ? "bg-[#1d1d1f] text-white shadow-md scale-[1.02]"
                      : "text-[#6e6e73] hover:text-[#1d1d1f]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-[#6e6e73]"}`} />
                  <span className={`text-[11px] font-bn ${active ? "font-bold" : ""}`}>
                    {lang === "bn" ? m.label_bn : m.label_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          {mode === "ask" && <AskMode />}
          {mode === "story" && <StoryMode />}
          {mode === "quiz" && <QuizMode />}
          {mode === "map" && <StarMap />}
        </div>
      </main>

      {/* Minimal White Footer */}
      <footer className="relative z-10 border-t border-black/5 bg-white/80 backdrop-blur-xl mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6e6e73]">
          <div className="flex items-center gap-2 font-bn">
            <span>{t("চালিত", "Powered by")} Gemma 4 AI</span>
            <span>·</span>
            <span>{t("বাংলাদেশের শিশুদের জন্য", "Built for Kids of Bangladesh")}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://kaggle.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1d1d1f] transition-colors">Kaggle</a>
            <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="hover:text-[#1d1d1f] transition-colors">Hugging Face</a>
            <a href="https://github.com/Shamimhasan8/Akash" target="_blank" rel="noopener noreferrer" className="hover:text-[#1d1d1f] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AkashProvider>
      <AKASHApp />
    </AkashProvider>
  );
}
