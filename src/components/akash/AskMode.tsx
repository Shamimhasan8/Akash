"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useAkash, useVoice, useSpeechRecognition } from "@/lib/akash-context";
import { Button } from "@/components/ui/button";
import {
  Volume2, Square, Send, Sparkles, User, Zap, Database, AlertCircle, Mic, MicOff,
} from "lucide-react";

type Msg = {
  role: "user" | "assistant";
  text: string;
  source?: string;
  fallback?: "live" | "cache" | "curated" | "polite";
  latencyMs?: number;
};

interface AskApiResponse {
  answer: string;
  source: string;
  lang: "bn" | "en";
  fallback: "live" | "cache" | "curated" | "polite";
  latencyMs: number;
  topic?: string;
  model?: string;
  cached?: boolean;
  fallbackReason?: string;
}

const FALLBACK_META: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  live:     { icon: Zap,          label: "Gemma 4",  color: "#0284c7" },
  cache:    { icon: Zap,          label: "Cached",   color: "#a855f7" },
  curated:  { icon: Database,     label: "Curated",  color: "#6366f1" },
  polite:   { icon: AlertCircle,  label: "Fallback", color: "#8896b3" },
};

export function AskMode() {
  const { lang, t } = useAkash();
  const { speak, stop } = useVoice();
  const { isListening, startListening, stopListening } = useSpeechRecognition();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: t(
        "নমস্কার! আমি আকাশ — তোমার মহাকাশ বন্ধু। বাংলা, English বা Banglish-এ প্রশ্ন করো! 🚀",
        "Hello! I'm AKASH — your space friend! Ask me anything in Bangla, English, or Banglish! 🚀"
      ),
      fallback: "curated",
      source: "AKASH",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = useMemo(
    () => [
      lang === "bn" ? "☀️ সূর্য কী?" : "☀️ What is the Sun?",
      lang === "bn" ? "🌙 চাঁদ কেন আকার বদলায়?" : "🌙 Why does the Moon change shape?",
      lang === "bn" ? "🕳️ কৃষ্ণ গহ্বর কী?" : "🕳️ What is a black hole?",
      lang === "bn" ? "🔴 মঙ্গল গ্রহে মানুষ থাকতে পারবে?" : "🔴 Can humans live on Mars?",
    ],
    [lang]
  );

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(lang, (text) => setInput(text));
    }
  };

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;

      setError(null);
      setMessages((m) => [...m, { role: "user", text: q }]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, lang, mode: "auto" }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error ?? `HTTP ${response.status}`);
        }

        const data: AskApiResponse = await response.json();
        setMessages((m) => [...m, {
          role: "assistant",
          text: data.answer,
          source: data.source,
          fallback: data.fallback,
          latencyMs: data.latencyMs,
        }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setMessages((m) => [...m, {
          role: "assistant",
          text: t(
            `দুঃখিত, এই মুহূর্তে উত্তর দেওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করো।`,
            `Sorry, I couldn't answer right now. Please try again in a moment.`
          ),
          fallback: "polite",
          source: "Error",
        }]);
      } finally {
        setLoading(false);
      }
    },
    [loading, lang, t]
  );

  const toggleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      stop();
      setSpeakingId(null);
    } else {
      speak(text, lang);
      setSpeakingId(id);
      setTimeout(() => setSpeakingId(null), Math.min(text.length * 75, 30000));
    }
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full bg-white rounded-3xl border border-[#e0eaf5] shadow-lg overflow-hidden" style={{ height: "calc(100vh - 360px)", minHeight: "480px" }}>

      {/* ── Chat Header (Matching AstroVerse index.html .ai-header) ── */}
      <div className="bg-gradient-to-r from-[#38bdf8] to-[#a855f7] px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold border border-white/30">
            🤖
          </div>
          <div>
            <h3 className="font-extrabold text-base font-display leading-tight">
              {t("আকাশ AI মহাকাশ শিক্ষক", "AKASH AI Space Tutor")}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-white/90 font-bn">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              <span>{t("অনলাইন — প্রশ্ন করো যেকোনো কিছু!", "Online — Ask anything!")}</span>
            </div>
          </div>
        </div>

        <div className="text-xs px-3 py-1 rounded-full bg-white/20 font-semibold border border-white/30">
          ✨ Gemma 4
        </div>
      </div>

      {/* ── Messages Scroll View ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 bg-[#f0f8ff]/60">
        {messages.map((m, i) => {
          const id = `msg-${i}`;
          const meta = m.fallback ? FALLBACK_META[m.fallback] : null;
          const MetaIcon = meta?.icon;
          const isUser = m.role === "user";

          return (
            <div key={id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>

              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm ${
                  isUser ? "bg-gradient-to-br from-[#a855f7] to-[#ec4899] text-white" : "bg-white border border-[#bae6fd] text-[#0284c7]"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : "🤖"}
              </div>

              {/* Bubble (Light Theme Matching index.html) */}
              <div
                className={`px-5 py-4 max-w-[85%] rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white rounded-tr-none font-medium"
                    : "bg-white text-[#1a2744] border border-[#e0eaf5] rounded-tl-none font-bn"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {!isUser && (
                  <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 border-t border-[#e0eaf5] flex-wrap text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#8896b3]">
                      {meta && MetaIcon && (
                        <span className="flex items-center gap-1 font-bold" style={{ color: meta.color }}>
                          <MetaIcon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      )}
                      {m.latencyMs !== undefined && (
                        <span>⚡ {(m.latencyMs / 1000).toFixed(1)}s</span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleSpeak(m.text, id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        speakingId === id
                          ? "bg-[#1a2744] text-white"
                          : "bg-[#e3f2fd] text-[#0284c7] hover:bg-[#bae6fd]"
                      }`}
                    >
                      {speakingId === id ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>{t("থামাও", "Stop")}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#0284c7]" />
                          <span>{t("শোনো", "Listen")}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-[#bae6fd] flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-white border border-[#e0eaf5] px-5 py-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <p className="text-xs font-bold text-[#5b6b8a] font-bn">
                {t("গেমা ভাবছে...", "Gemma is thinking...")}
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Mic Status Banner */}
      {isListening && (
        <div className="px-4 py-2 bg-red-50 border-y border-red-200 text-red-600 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>{t("শুনছি... কথা বলো", "Listening... speak now")}</span>
          </div>
          <button onClick={stopListening} className="underline text-xs">
            {t("থামাও", "Stop")}
          </button>
        </div>
      )}

      {/* Suggestion Chips Bar */}
      <div className="p-3 bg-white border-t border-[#e0eaf5] flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => send(s.replace(/^[^\s]+\s/, ''))}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full bg-[#f0f8ff] hover:bg-[#e3f2fd] border border-[#bae6fd] text-[#0284c7] text-xs font-semibold transition-all hover:-translate-y-0.5 shadow-sm"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="p-3 bg-white border-t border-[#e0eaf5] flex gap-2"
      >
        <div className="flex-1 relative">
          <button
            type="button"
            onClick={handleMicClick}
            className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
              isListening ? "text-red-500 bg-red-100" : "text-[#5b6b8a] hover:text-[#0284c7]"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? t("শুনছি... বলো...", "Listening...") : t("মহাকাশ নিয়ে প্রশ্ন করো (বাংলা / English / Banglish)...", "Ask space question...")}
            disabled={loading}
            className="w-full h-12 pl-11 pr-4 rounded-full border border-[#e0eaf5] focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 text-sm font-bn outline-none transition-all"
          />
        </div>

        <Button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white font-bold flex-shrink-0 shadow-md hover:opacity-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
