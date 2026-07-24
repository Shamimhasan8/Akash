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

/** Speak text via Web Speech API. Strictly Bangla voice — no Hindi fallback. */
export function useVoice() {
  const speak = useCallback((text: string, lang: Lang = "bn") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.88;
    utter.pitch = 1.05;
    utter.volume = 1;

    const applyVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      if (lang === "bn") {
        // Bangla voices only — strictly no Hindi
        const bnVoice =
          voices.find((v) => v.lang === "bn-BD") ||        // Bangla Bangladesh (preferred)
          voices.find((v) => v.lang === "bn-IN") ||        // Bangla India
          voices.find((v) => v.lang.startsWith("bn")) ||   // any Bangla locale
          null;                                             // no fallback to Hindi

        if (bnVoice) {
          utter.voice = bnVoice;
          utter.lang = bnVoice.lang;
        } else {
          // Set lang tag for browser TTS even without a matching voice object
          utter.lang = "bn-BD";
        }
      } else {
        // English
        const enVoice =
          voices.find((v) => v.lang === "en-US" && v.name.includes("Natural")) ||
          voices.find((v) => v.lang === "en-US") ||
          voices.find((v) => v.lang === "en-GB") ||
          voices.find((v) => v.lang.startsWith("en")) ||
          null;

        if (enVoice) utter.voice = enVoice;
        utter.lang = "en-US";
      }

      window.speechSynthesis.speak(utter);
    };

    // Voices may not be loaded yet — wait if needed
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      applyVoice();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", applyVoice, { once: true });
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}

/** Web Speech API Recognition (Speech to Text for Bangla & English). */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback((lang: Lang = "bn", onResult?: (text: string) => void) => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === "bn" ? "bn-BD" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        if (onResult && current.trim()) {
          onResult(current);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start voice recognition");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, startListening, stopListening };
}


