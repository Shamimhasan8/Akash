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
  live: { icon: Zap, label: "Gemma 4", color: "#d97706" },
  cache: { icon: Zap, label: "Cached", color: "#0284c7" },
  curated: { icon: Database, label: "Curated", color: "#6366f1" },
  polite: { icon: AlertCircle, label: "Fallback", color: "#6e6e73" },
};

export function AskMode() {
  const { lang, t } = useAkash();
  const { speak, stop } = useVoice();
  const { isListening, startListening, stopListening, error: micError } = useSpeechRecognition();
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
      lang === "bn" ? "সূর্য কী?" : "What is the Sun?",
      lang === "bn" ? "surjo ki?" : "surjo ki?",
      lang === "bn" ? "চাঁদ কেন আকার বদলায়?" : "Why does the Moon change shape?",
      lang === "bn" ? "kemon acho?" : "kemon acho?",
      lang === "bn" ? "কৃষ্ণ গহ্বর কী?" : "What is a black hole?",
    ],
    [lang]
  );

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(lang, (text) => {
        setInput(text);
      });
    }
  };

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;

      setError(null);
      const userMsg: Msg = { role: "user", text: q };
      setMessages((m) => [...m, userMsg]);
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
        const botMsg: Msg = {
          role: "assistant",
          text: data.answer,
          source: data.source,
          fallback: data.fallback,
          latencyMs: data.latencyMs,
        };
        setMessages((m) => [...m, botMsg]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: t(
              `দুঃখিত, এই মুহূর্তে উত্তর দেওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করো।`,
              `Sorry, I couldn't answer right now. Please try again in a moment.`
            ),
            fallback: "polite",
            source: "Error",
          },
        ]);
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
    <div className="flex flex-col max-w-3xl mx-auto w-full" style={{ height: "calc(100vh - 380px)", minHeight: "440px" }}>
      {/* Messages Scroll View */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 pb-3" style={{ scrollbarWidth: "thin" }}>
        {messages.map((m, i) => {
          const id = `msg-${i}`;
          const meta = m.fallback ? FALLBACK_META[m.fallback] : null;
          const MetaIcon = meta?.icon;
          const isUser = m.role === "user";

          return (
            <div key={id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                style={isUser
                  ? { background: "#1d1d1f", border: "1px solid #1d1d1f", color: "#ffffff" }
                  : { background: "#ffffff", border: "1px solid rgba(0,0,0,0.12)", color: "#d97706" }
                }
              >
                {isUser ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-[#d97706]" />}
              </div>

              {/* Bubble */}
              <div
                className="rounded-3xl px-5 py-4 max-w-[85%] relative transition-all"
                style={isUser
                  ? {
                      background: "#1d1d1f",
                      color: "#ffffff",
                      boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                    }
                  : {
                      background: "#ffffff",
                      color: "#1d1d1f",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
                    }
                }
              >
                <p className={`text-[0.93rem] leading-relaxed ${isUser ? "text-white" : "text-[#1d1d1f]"} ${!isUser ? "font-bn" : ""}`}>
                  {m.text}
                </p>

                {!isUser && (
                  <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 border-t border-black/5 flex-wrap">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#6e6e73]">
                      {meta && MetaIcon && (
                        <span className="flex items-center gap-1 font-bold" style={{ color: meta.color }}>
                          <MetaIcon className="w-2.5 h-2.5" />
                          {meta.label}
                        </span>
                      )}
                      {m.latencyMs !== undefined && (
                        <span>⚡ {(m.latencyMs / 1000).toFixed(1)}s</span>
                      )}
                      {m.source && (
                        <span className="truncate max-w-[150px]">· {m.source}</span>
                      )}
                    </div>

                    {/* Audio Listen Trigger */}
                    <button
                      onClick={() => toggleSpeak(m.text, id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all duration-200 shadow-sm"
                      style={speakingId === id
                        ? { background: "#1d1d1f", color: "#ffffff" }
                        : { background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f" }
                      }
                    >
                      {speakingId === id ? (
                        <>
                          <Square className="w-2.5 h-2.5 text-white" />
                          <span className="text-white">{t("থামাও", "Stop")}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-[#d97706]" />
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
            <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/10 text-[#d97706] shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-3xl px-5 py-4 bg-white border border-black/10 shadow-sm">
              <div className="akash-loading-dots flex items-center gap-1 mb-1">
                <span /><span /><span />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#6e6e73] font-medium">
                {t("গেমা ভাবছে...", "Gemma is thinking...")}
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Mic Active Status */}
      {isListening && (
        <div className="my-2 px-4 py-2 rounded-full text-xs font-bn flex items-center justify-between bg-white border border-red-200 text-red-600 shadow-sm apple-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>{t("শুনছি... কথা বলো", "Listening... speak now")} ({lang === "bn" ? "বাংলা/Banglish" : "English"})</span>
          </div>
          <button onClick={stopListening} className="underline text-[10px] font-mono">
            {t("থামাও", "Stop")}
          </button>
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 my-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => send(s)}
            disabled={loading}
            className="apple-chip disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Apple White Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2"
      >
        <div className="flex-1 relative">
          <button
            type="button"
            onClick={handleMicClick}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 hover:scale-105"
            style={isListening
              ? { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }
              : { background: "transparent", color: "#6e6e73" }
            }
            title={t("বাংলা, English বা Banglish-এ কথা বলো", "Speak in Bangla, English, or Banglish")}
          >
            {isListening ? <MicOff className="w-4 h-4 animate-spin text-red-500" /> : <Mic className="w-4 h-4 hover:text-[#1d1d1f]" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? t("শুনছি... বলো...", "Listening... speak...") : t("মহাকাশ নিয়ে প্রশ্ন করো (Bangla / English / Banglish)...", "Ask in Bangla, English, or Banglish...")}
            disabled={loading}
            className="w-full h-12 pl-11 pr-4 text-sm font-bn apple-input outline-none"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || loading}
          className="h-12 w-12 rounded-full font-bold flex-shrink-0 transition-all duration-300 shadow-md"
          style={{
            background: input.trim() && !loading ? "#1d1d1f" : "#e5e5ea",
            color: input.trim() && !loading ? "#ffffff" : "#8e8e93",
            border: "none",
          }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
