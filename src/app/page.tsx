"use client";

import { useState } from "react";
import { AkashProvider, useAkash } from "@/lib/akash-context";
import {
  Sparkles, BookOpen, Brain, Map as MapIcon,
  Languages, Github, Rocket, ShieldCheck, HelpCircle, Eye, Newspaper, Gamepad2, ChevronDown
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
    emoji: string;
  }[] = [
    { id: "ask",   icon: Sparkles, label_bn: "জিজ্ঞাসা AI",     label_en: "Ask AI",   emoji: "🤖" },
    { id: "story", icon: BookOpen, label_bn: "মহাকাশ গল্প",   label_en: "Stories",  emoji: "📖" },
    { id: "quiz",  icon: Brain,    label_bn: "কুইজ মাস্টার",  label_en: "Quiz",     emoji: "🧠" },
    { id: "map",   icon: MapIcon,  label_bn: "তারার মানচিত্র", label_en: "Star Map", emoji: "🗺️" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden text-[#1a2744]">

      {/* ── Fixed Vibrant Top Navbar (Matching AstroVerse index.html header) ── */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 py-3 bg-white/90 backdrop-blur-md border-b border-[#e0eaf5] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo — AstroVerse / AKASH */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode("ask")}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#a855f7] flex items-center justify-center text-xl shadow-md text-white">
              🚀
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black font-display text-[#0284c7] tracking-tight">
                AstroVerse <span className="text-xs font-normal text-[#8896b3]">· AKASH</span>
              </span>
              <span className="text-[10px] font-medium text-[#5b6b8a] font-bn">
                {t("বাংলাদেশের ১ম AI মহাকাশ প্ল্যাটফর্ম", "Bangladesh's #1 AI Space Platform")}
              </span>
            </div>
          </div>

          {/* Navigation Items (Matching index.html header badges) */}
          <div className="hidden lg:flex items-center gap-2">
            <button 
              onClick={() => setMode("ask")} 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === "ask" ? "bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white shadow-sm" : "text-[#5b6b8a] hover:bg-[#e3f2fd] hover:text-[#0284c7]"
              }`}
            >
              <span>🤖</span> {t("AI কে প্রশ্ন", "Ask AI")}
            </button>

            <button 
              onClick={() => setMode("map")} 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === "map" ? "bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white shadow-sm" : "text-[#5b6b8a] hover:bg-[#e3f2fd] hover:text-[#0284c7]"
              }`}
            >
              <span>🪐</span> {t("গ্রহ দেখুন", "Explore Space")}
            </button>

            <button 
              onClick={() => setMode("story")} 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === "story" ? "bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white shadow-sm" : "text-[#5b6b8a] hover:bg-[#e3f2fd] hover:text-[#0284c7]"
              }`}
            >
              <span>📖</span> {t("সংবাদ ও গল্প", "Stories & News")}
            </button>

            <button 
              onClick={() => setMode("quiz")} 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === "quiz" ? "bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white shadow-sm" : "text-[#5b6b8a] hover:bg-[#e3f2fd] hover:text-[#0284c7]"
              }`}
            >
              <span>🎮</span> {t("খেলা ও কুইজ", "Quiz Games")}
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f8ff] border border-[#bae6fd] text-[11px] font-semibold text-[#0284c7]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Gemma 4 AI</span>
            </div>

            {/* Language switch button */}
            <button
              onClick={toggleLang}
              className="h-9 px-4 rounded-full font-bold text-xs transition-all duration-300 bg-[#f0f8ff] hover:bg-[#e3f2fd] border border-[#bae6fd] text-[#0284c7] flex items-center gap-1.5 shadow-sm"
            >
              <Languages className="w-3.5 h-3.5 text-[#a855f7]" />
              {lang === "bn" ? "EN" : "বাংলা"}
            </button>

            <a
              href="https://github.com/Shamimhasan8/Akash"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
            >
              {t("লগইন", "Login")}
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION WITH 2D ANIMATED SOLAR SYSTEM BACKGROUND (matching index.html & image screenshot) ── */}
      <section className="astro-hero-bg px-4 sm:px-6 pt-10 pb-16 text-center">

        {/* Floating Astronaut & Satellite */}
        <div className="astronaut select-none">👩‍🚀</div>
        <div className="satellite select-none">🛰️</div>

        {/* 2D Interactive Solar System Orbit Animation */}
        <div className="solar-system" aria-hidden>
          <div className="sun"></div>
          <div className="orbit orbit-mercury"><div className="planet"></div></div>
          <div className="orbit orbit-venus"><div className="planet"></div></div>
          <div className="orbit orbit-earth"><div className="planet"></div></div>
          <div className="orbit orbit-mars"><div className="planet"></div></div>
          <div className="orbit orbit-jupiter"><div className="planet"></div></div>
          <div className="orbit orbit-saturn"><div className="planet"></div></div>
          <div className="orbit orbit-uranus"><div className="planet"></div></div>
          <div className="orbit orbit-neptune"><div className="planet"></div></div>
        </div>

        {/* Main Hero Content Overlay */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/90 border border-[#bae6fd] text-xs font-semibold text-[#0284c7] shadow-sm backdrop-blur-md">
            <span className="text-base">✨</span>
            <span>{t("বাংলাদেশের প্রথম AI-চালিত বাংলা মহাকাশ শিক্ষা প্ল্যাটফর্ম", "Bangladesh's First AI Space Learning Platform")}</span>
          </div>

          {/* Title from screenshot & index.html */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display leading-[1.15] mb-4 text-[#1a2744]">
            {t("মহাবিশ্ব ঘুরে দেখো", "Explore The Universe")} <br />
            <span className="astro-headline-grad">
              {t("AI এর সাথে শেখো", "Learn With AI")}
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#5b6b8a] max-w-xl mx-auto mb-8 font-bn leading-relaxed">
            {t(
              "AstroVerse — বাচ্চাদের ও স্কুল পড়ুয়াদের জন্য এক অসাধারণ মহাকাশ শেখার দুনিয়া। গল্প শোনো, কুইজ খেলো, গ্রহ ঘুরে দেখো আর AI কে যা খুশি জিজ্ঞেস করো!",
              "AstroVerse — An amazing space learning world for kids & students. Listen to stories, play quizzes, explore planets & ask AI anything!"
            )}
          </p>

          {/* Colorful Action Buttons Bar (Exactly like index.html screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <button
              onClick={() => setMode("ask")}
              className="btn-primary-grad px-6 py-3 text-sm flex items-center gap-2"
            >
              <span>🚀</span> {t("এখনই শেখা শুরু করুন", "Start Learning Now")}
            </button>

            <button
              onClick={() => setMode("ask")}
              className="btn-white-glass px-5 py-3 text-sm flex items-center gap-2"
            >
              <span>🤖</span> {t("AI কে প্রশ্ন করুন", "Ask AI Questions")}
            </button>

            <button
              onClick={() => setMode("map")}
              className="btn-yellow-grad px-5 py-3 text-sm flex items-center gap-2"
            >
              <span>⚡</span> {t("মহাকাশ ঘুরে দেখুন", "Explore Space")}
            </button>

            <button
              onClick={() => setMode("story")}
              className="btn-purple-grad px-5 py-3 text-sm flex items-center gap-2"
            >
              <span>📖</span> {t("আজকের সংবাদ", "Today's News")}
            </button>

            <button
              onClick={() => setMode("quiz")}
              className="btn-white-glass px-5 py-3 text-sm flex items-center gap-2"
            >
              <span>🎮</span> {t("খেলাতে খেলাতে শিখুন", "Learn With Games")}
            </button>
          </div>

          {/* Hero Stats Row (Matching index.html screenshot) */}
          <div className="grid grid-cols-4 gap-6 sm:gap-12 text-center pt-2">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#7e22ce] font-display">8</div>
              <div className="text-xs font-semibold text-[#5b6b8a] font-bn">{t("গ্রহ", "Planets")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#7e22ce] font-display">150+</div>
              <div className="text-xs font-semibold text-[#5b6b8a] font-bn">{t("তথ্য", "Facts")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#7e22ce] font-display">10</div>
              <div className="text-xs font-semibold text-[#5b6b8a] font-bn">{t("কুইজ", "Quizzes")}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#7e22ce] font-display">0</div>
              <div className="text-xs font-semibold text-[#5b6b8a] font-bn">{t("আপনার XP", "Your XP")}</div>
            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="mt-8 text-[#a855f7] animate-bounce-slow text-xl cursor-pointer" onClick={() => {
          const el = document.getElementById("main-content");
          el?.scrollIntoView({ behavior: "smooth" });
        }}>
          ⬇️
        </div>
      </section>

      {/* ── Mode Switcher Nav (Pill Bar) ── */}
      <nav id="main-content" className="relative z-20 px-4 sm:px-6 py-6 bg-[#f0f8ff] border-y border-[#e0eaf5]">
        <div className="max-w-xl mx-auto">
          <div className="bg-white p-1.5 rounded-full border border-[#bae6fd] shadow-md grid grid-cols-4 gap-1">
            {modes.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-bold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white shadow-md scale-[1.02]"
                      : "text-[#5b6b8a] hover:bg-[#e3f2fd] hover:text-[#0284c7]"
                  }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  <span className="text-[12px] font-bn">
                    {lang === "bn" ? m.label_bn : m.label_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-8 bg-[#ffffff]">
        <div className="max-w-6xl mx-auto">
          {mode === "ask"   && <AskMode />}
          {mode === "story" && <StoryMode />}
          {mode === "quiz"  && <QuizMode />}
          {mode === "map"   && <StarMap />}
        </div>
      </main>

      {/* ── Bright Colorful Footer ── */}
      <footer className="relative z-10 border-t border-[#e0eaf5] bg-[#f0f8ff] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5b6b8a]">
          <div className="flex items-center gap-2 font-bn">
            <span className="text-base">🚀</span>
            <span className="font-bold text-[#1a2744]">AstroVerse · AKASH</span>
            <span>·</span>
            <span>{t("চালিত Gemma 4 AI", "Powered by Gemma 4 AI")}</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <a href="https://kaggle.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0284c7]">Kaggle</a>
            <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="hover:text-[#0284c7]">Hugging Face</a>
            <a href="https://github.com/Shamimhasan8/Akash" target="_blank" rel="noopener noreferrer" className="hover:text-[#0284c7]">GitHub</a>
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
