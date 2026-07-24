"use client";

import { useState } from "react";
import { AkashProvider, useAkash } from "@/lib/akash-context";
import { Button } from "@/components/ui/button";
import {
  Sparkles, BookOpen, Brain, Map as MapIcon,
  Languages, Github, Rocket, Star, Zap,
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
    gradient: string;
    glow: string;
    accent: string;
  }[] = [
    {
      id: "ask", icon: Sparkles,
      label_bn: "জিজ্ঞাসা", label_en: "Ask AI",
      gradient: "linear-gradient(135deg, #d6ba65, #f5e08a, #d6ba65)",
      glow: "rgba(214,186,101,0.4)",
      accent: "#d6ba65",
    },
    {
      id: "story", icon: BookOpen,
      label_bn: "মহাকাশ গল্প", label_en: "Stories",
      gradient: "linear-gradient(135deg, #5e3aca, #8b6ff0, #5e3aca)",
      glow: "rgba(94,58,202,0.4)",
      accent: "#8b6ff0",
    },
    {
      id: "quiz", icon: Brain,
      label_bn: "কুইজ মাস্টার", label_en: "Quiz",
      gradient: "linear-gradient(135deg, #4da8da, #7ec5ed, #4da8da)",
      glow: "rgba(77,168,218,0.4)",
      accent: "#7ec5ed",
    },
    {
      id: "map", icon: MapIcon,
      label_bn: "তারার মানচিত্র", label_en: "Star Map",
      gradient: "linear-gradient(135deg, #34c98a, #6fe8b0, #34c98a)",
      glow: "rgba(52,201,138,0.4)",
      accent: "#34c98a",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Animated starfield background */}
      <div className="akash-starfield" aria-hidden />

      {/* Nebula accents */}
      <div className="akash-nebula-gold pointer-events-none" style={{ top: "-100px", left: "-100px" }} />
      <div className="akash-nebula-purple pointer-events-none" style={{ bottom: "10%", right: "-150px" }} />
      <div className="akash-nebula-cyan pointer-events-none" style={{ top: "40%", left: "60%" }} />

      {/* Header */}
      <header className="relative z-10 border-b border-akash-border/20 backdrop-blur-2xl bg-akash-night/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center akash-pulse-glow"
                style={{ background: "linear-gradient(135deg, #8a6b2e, #d6ba65, #f5e08a, #d6ba65)" }}>
                <Sparkles className="w-5 h-5 text-akash-night" />
              </div>
              {/* orbiting dot */}
              <div
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full akash-spin-slow"
                style={{
                  background: "radial-gradient(circle, #7ec5ed, #4da8da)",
                  boxShadow: "0 0 8px rgba(126,197,237,0.9)",
                  transformOrigin: "22px 22px",
                }}
              />
            </div>
            <div>
              <div className="text-xl font-black tracking-widest text-akash-star leading-none font-space">
                AKASH
              </div>
              <div className="text-[10px] tracking-[0.28em] mt-0.5 font-bn akash-gradient-gold font-semibold">
                আকাশ · {t("শিশুদের মহাকাশ বন্ধু", "Kids' Space Tutor")}
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(52,201,138,0.1)", border: "1px solid rgba(52,201,138,0.25)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-akash-emerald animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#34c98a" }}>Live</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="h-9 px-3.5 rounded-xl font-bold text-xs transition-all duration-300"
              style={{
                background: "rgba(214,186,101,0.08)",
                border: "1px solid rgba(214,186,101,0.25)",
                color: "#d6ba65",
              }}
            >
              <Languages className="w-3.5 h-3.5 mr-1.5" />
              {lang === "bn" ? "EN" : "বাংলা"}
            </Button>

            <a
              href="https://github.com/Shamimhasan8/Akash"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 rounded-xl transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#6a8ba8",
              }}
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero (only on ask mode) */}
      {mode === "ask" && (
        <section className="relative z-10 px-4 sm:px-6 pt-12 md:pt-20 pb-8 text-center">
          <div className="max-w-4xl mx-auto akash-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 akash-badge">
              <Rocket className="w-3 h-3" />
              <span>{t("বিল্ট উইথ গেমা", "Built with Gemma")} · {t("৩৭ মিলিয়ন শিশুর জন্য", "For 37M Kids")}</span>
              <Star className="w-3 h-3 fill-current" />
            </div>

            {/* Hero title */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-5 leading-[0.9] font-space">
              <span className="akash-gradient-cosmic">AKASH</span>
            </h1>

            <div className="text-2xl sm:text-3xl font-bold font-bn mb-4 akash-gradient-gold">
              {t("আকাশ", "আকাশ")}
            </div>

            <p className="text-base sm:text-lg md:text-xl text-akash-star-dim mb-3 font-bn italic">
              {t(
                "মহাকাশের গল্প, বাংলায় শিখি",
                "Stories of Space, Learned in Bangla"
              )}
            </p>

            <p className="text-sm text-akash-muted max-w-xl mx-auto mb-10 font-bn leading-relaxed">
              {t(
                "বাংলা ও ইংরেজিতে শিশুদের জন্য একটি মহাকাশ শিক্ষক — চালিত গেমা দ্বারা।",
                "A bilingual space tutor for kids powered by Gemma AI — works online and offline."
              )}
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { icon: Zap, label: t("লাইভ AI", "Live AI") },
                { icon: Languages, label: t("দ্বিভাষিক", "Bilingual") },
                { icon: Star, label: t("শিশু-নিরাপদ", "Kid-safe") },
                { icon: Rocket, label: t("মহাকাশ গল্প", "Space Stories") },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="akash-chip">
                  <Icon className="w-3 h-3 mr-1.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mode switcher */}
      <nav className="relative z-10 px-4 sm:px-6 pb-5">
        <div className="max-w-2xl mx-auto">
          <div
            className="grid grid-cols-4 gap-2 p-1.5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(214,186,101,0.12)",
              backdropFilter: "blur(24px)",
            }}
          >
            {modes.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  id={`mode-btn-${m.id}`}
                  onClick={() => setMode(m.id)}
                  className="akash-mode-btn flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl relative"
                  style={
                    active
                      ? {
                          background: m.gradient,
                          color: "#030510",
                          boxShadow: `0 4px 20px ${m.glow}, 0 0 40px ${m.glow}`,
                          transform: "scale(1.02)",
                        }
                      : {
                          color: "#6a8ba8",
                        }
                  }
                >
                  <Icon
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={active ? { filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))" } : {}}
                  />
                  <span
                    className={`text-[9px] sm:text-[11px] font-bold leading-tight ${lang === "bn" ? "font-bn" : "font-space"}`}
                    style={active ? {} : {}}
                  >
                    {lang === "bn" ? m.label_bn : m.label_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 pb-10">
        <div className="max-w-7xl mx-auto">
          {mode === "ask" && <AskMode />}
          {mode === "story" && <StoryMode />}
          {mode === "quiz" && <QuizMode />}
          {mode === "map" && <StarMap />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-akash-border/15 backdrop-blur-2xl bg-akash-night/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-akash-muted">
          <div className="flex items-center gap-2 font-bn">
            <span className="text-akash-gold">✦</span>
            <span>{t("তৈরি হয়েছে", "Built with")} Gemma AI</span>
            <span className="text-akash-gold">·</span>
            <span>{t("বাংলাদেশের শিশুদের জন্য", "For Kids of Bangladesh")}</span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: "Kaggle", href: "https://kaggle.com" },
              { label: "Hugging Face", href: "https://huggingface.co" },
              { label: "GitHub", href: "https://github.com/Shamimhasan8/Akash" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-akash-gold transition-colors duration-200 font-medium"
              >
                {label}
              </a>
            ))}
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
