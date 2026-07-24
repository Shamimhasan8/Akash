"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Lang = "bn" | "en";

interface AkashCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (bn: string, en: string) => string;
}

const Ctx = createContext<AkashCtx | null>(null);

export function AkashProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "bn";
    const stored = localStorage.getItem("akash-lang");
    return stored === "bn" || stored === "en" ? stored : "bn";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("akash-lang", l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "bn" ? "en" : "bn");
  }, [lang, setLang]);

  const t = useCallback((bn: string, en: string) => (lang === "bn" ? bn : en), [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAkash() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAkash must be used within AkashProvider");
  return ctx;
}

/** Speak text via Web Speech API. Bangla voice if available, else English fallback. */
export function useVoice() {
  const speak = useCallback((text: string, lang: Lang = "bn") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1.1;
    utter.volume = 1;

    // Try to find a Bangla voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === "bn") {
      const bnVoice =
        voices.find((v) => v.lang === "bn-IN" || v.lang === "bn_BD" || v.lang.startsWith("bn")) ||
        voices.find((v) => v.lang.startsWith("hi")) ||  // Hindi fallback (similar phonetics)
        voices.find((v) => v.lang.startsWith("en-IN")); // Indian English
      if (bnVoice) utter.voice = bnVoice;
      utter.lang = "bn-IN";
    } else {
      const enVoice = voices.find((v) => v.lang === "en-US" || v.lang === "en-GB");
      if (enVoice) utter.voice = enVoice;
      utter.lang = "en-US";
    }

    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
