"use client";

import { useState } from "react";
import { AkashProvider, useAkash } from "@/lib/akash-context";
import { Button } from "@/components/ui/button";
import {
  Sparkles, BookOpen, Brain, Map as MapIcon,
  Languages, Github, Heart, Rocket,
} from "lucide-react";
import { AskMode } from "@/components/akash/AskMode";
import { StoryMode } from "@/components/akash/StoryMode";
import { QuizMode } from "@/components/akash/QuizMode";
import { StarMap } from "@/components/akash/StarMap";

type Mode = "ask" | "story" | "quiz" | "map";

function AKASHApp() {
  const { lang, toggleLang, t } = useAkash();
  const [mode, setMode] = useState<Mode>("ask");

  const modes: { id: Mode; icon: typeof Sparkles; label_bn: string; label_en: string; color: string }[] = [
    { id: "ask", icon: Sparkles, label_bn: "জিজ্ঞাসা", label_en: "Ask", color: "akash-gold" },
    { id: "story", icon: BookOpen, label_bn: "গল্পের মহাকাশ", label_en: "Story", color: "akash-purple" },
    { id: "quiz", icon: Brain, label_bn: "কুইজ মাস্টার", label_en: "Quiz", color: "akash-cyan" },
    { id: "map", icon: MapIcon, label_bn: "নক্ষত্র মানচিত্র", label_en: "Star Map", color: "akash-gold" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Animated starfield background */}
      <div className="akash-starfield" aria-hidden />

      {/* Header */}
      <header className="relative z-10 border-b border-akash-border/30 backdrop-blur-md bg-akash-night/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-akash-gold-bright via-akash-gold to-akash-gold-deep akash-pulse-glow flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-akash-night" />
              {/* tiny orbiting planet */}
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-akash-cyan-bright shadow-[0_0_8px_rgba(126,197,237,0.8)] akash-spin-slow" style={{ transformOrigin: "20px 20px" }} />
            </div>
            <div>
              <div className="text-xl font-black tracking-wider text-akash-star leading-none">
                AKASH
              </div>
              <div className="text-[10px] text-akash-gold uppercase tracking-[0.3em] mt-0.5 font-bn">
                আকাশ · {t("শিশুদের মহাকাশ বন্ধু", "Kids' Space Friend")}
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="text-akash-star-dim hover:text-akash-gold hover:bg-akash-card border border-akash-border/50"
            >
              <Languages className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-bold">
                {lang === "bn" ? "EN" : "বাংলা"}
              </span>
            </Button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 rounded-md text-akash-muted hover:text-akash-gold hover:bg-akash-card transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero (only on ask mode + scroll top) */}
      {mode === "ask" && (
        <section className="relative z-10 px-4 sm:px-6 pt-10 md:pt-16 pb-6 text-center">
          <div className="max-w-4xl mx-auto akash-fade-up">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-akash-gold/30 bg-akash-gold/5 mb-5">
              <Rocket className="w-3 h-3 text-akash-gold" />
              <span className="text-[11px] uppercase tracking-widest text-akash-gold font-semibold">
                {t("বিল্ট উইথ গেমা", "Built with Gemma")} · {t("৩৭ মিলিয়ন শিশুর জন্য", "For 37M kids")}
              </span>
            </div>

            {/* Hero title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 leading-[0.95]">
              <span className="akash-gradient-cosmic">AKASH</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl mt-3 text-akash-gold font-bold font-bn akash-text-glow">
                {t("আকাশ", "আকাশ")}
              </span>
            </h1>

            {/* Bangla tagline */}
            <p className="text-lg sm:text-xl md:text-2xl text-akash-star-dim mb-2 font-bn italic">
              {t(
                "মহাকাশের গল্প, বাংলায় শিখি",
                "Stories of the cosmos, learned in Bangla"
              )}
            </p>

            <p className="text-sm sm:text-base text-akash-muted max-w-2xl mx-auto mb-8 font-bn">
              {t(
                "বাংলা ও ইংরেজিতে শিশুদের জন্য একটি মহাকাশ শিক্ষক — চালিত ফাইন-টিউনড গেমা ২ দ্বারা। অফলাইনে চলে, মোবাইলে কাজ করে, গ্রামের শিশুর কাছে পৌঁছায়।",
                "A bilingual space tutor for kids — powered by fine-tuned Gemma 2. Works offline, runs on mobile, reaches kids in villages."
              )}
            </p>
          </div>
        </section>
      )}

      {/* Mode switcher */}
      <nav className="relative z-10 px-4 sm:px-6 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-4 gap-2 p-1.5 rounded-2xl akash-glass">
            {modes.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl transition-all ${
                    active
                      ? `bg-${m.color} text-akash-night shadow-lg`
                      : "text-akash-star-dim hover:text-akash-gold hover:bg-akash-card"
                  }`}
                  style={
                    active
                      ? {
                          background:
                            m.color === "akash-gold"
                              ? "linear-gradient(135deg, #d6ba65, #f5e08a)"
                              : m.color === "akash-purple"
                              ? "linear-gradient(135deg, #5e3aca, #8b6ff0)"
                              : "linear-gradient(135deg, #4da8da, #7ec5ed)",
                          color: m.color === "akash-purple" ? "#fff" : "#050717",
                        }
                      : {}
                  }
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className={`text-[10px] sm:text-xs font-semibold ${lang === "bn" ? "font-bn" : ""}`}>
                    {lang === "bn" ? m.label_bn : m.label_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {mode === "ask" && <AskMode />}
          {mode === "story" && <StoryMode />}
          {mode === "quiz" && <QuizMode />}
          {mode === "map" && <StarMap />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-akash-border/30 backdrop-blur-md bg-akash-night/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-akash-muted">
          <div className="flex items-center gap-1.5 font-bn">
            <span>{t("তৈরি হয়েছে", "Built with")}</span>
            <Heart className="w-3 h-3 text-akash-gold fill-akash-gold" />
            <span>{t("গেমা ২ দিয়ে", "using Gemma 2")}</span>
            <span className="mx-1">·</span>
            <span>{t("বাংলাদেশের শিশুদের জন্য", "for kids of Bangladesh")}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://kaggle.com" target="_blank" rel="noopener noreferrer" className="hover:text-akash-gold transition-colors">
              Kaggle
            </a>
            <span>·</span>
            <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="hover:text-akash-gold transition-colors">
              Hugging Face
            </a>
            <span>·</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-akash-gold transition-colors">
              GitHub
            </a>
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
