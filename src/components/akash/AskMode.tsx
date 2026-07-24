"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useAkash, useVoice } from "@/lib/akash-context";
import { SPACE_FACTS } from "@/lib/akash-data";
import { Button } from "@/components/ui/button";
import {
  Volume2, Square, Send, Sparkles, User, Zap, Database, AlertCircle, Mic,
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

const FALLBACK_META: Record<string, { icon: typeof Zap; label: string; color: string; bg: string }> = {
  live: { icon: Zap, label: "Live Gemma", color: "#d6ba65", bg: "rgba(214,186,101,0.12)" },
  cache: { icon: Zap, label: "Cached", color: "#4da8da", bg: "rgba(77,168,218,0.12)" },
  curated: { icon: Database, label: "Curated", color: "#8b6ff0", bg: "rgba(139,111,240,0.12)" },
  polite: { icon: AlertCircle, label: "Fallback", color: "#6a8ba8", bg: "rgba(106,139,168,0.12)" },
};

export function AskMode() {
  const { lang, t } = useAkash();
  const { speak, stop } = useVoice();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: t(
        "নমস্কার! আমি আকাশ — তোমার মহাকাশ বন্ধু। যেকোনো প্রশ্ন করো, আমি বাংলায় বা ইংরেজিতে উত্তর দেব! 🚀",
        "Hello! I'm AKASH — your space friend! Ask me anything about space and I'll answer in Bangla or English. 🚀"
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
    () => SPACE_FACTS.slice(0, 5).map((f) => (lang === "bn" ? f.question_bn : f.question_en)),
    [lang]
  );

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
    <div className="flex flex-col max-w-3xl mx-auto w-full" style={{ height: "calc(100vh - 380px)", minHeight: "420px" }}>
      {/* Chat messages */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5 pb-2" style={{ scrollbarWidth: "thin" }}>
        {messages.map((m, i) => {
          const id = `msg-${i}`;
          const meta = m.fallback ? FALLBACK_META[m.fallback] : null;
          const MetaIcon = meta?.icon;
          const isUser = m.role === "user";

          return (
            <div key={id} className={`flex gap-3 akash-fade-up ${isUser ? "flex-row-reverse" : ""}`}
              style={{ animationDelay: `${i * 0.04}s` }}>
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold"
                style={isUser
                  ? { background: "linear-gradient(135deg, rgba(94,58,202,0.3), rgba(139,111,240,0.2))", border: "1px solid rgba(139,111,240,0.4)" }
                  : { background: "linear-gradient(135deg, rgba(214,186,101,0.25), rgba(245,224,138,0.15))", border: "1px solid rgba(214,186,101,0.5)" }
                }
              >
                {isUser
                  ? <User className="w-4.5 h-4.5" style={{ color: "#8b6ff0" }} />
                  : <Sparkles className="w-4.5 h-4.5" style={{ color: "#f5e08a" }} />
                }
              </div>

              {/* Bubble */}
              <div
                className="rounded-2xl px-4 py-3.5 max-w-[85%] relative"
                style={isUser
                  ? {
                      background: "linear-gradient(135deg, rgba(94,58,202,0.18), rgba(94,58,202,0.08))",
                      border: "1px solid rgba(139,111,240,0.3)",
                      backdropFilter: "blur(20px)",
                    }
                  : {
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(214,186,101,0.18)",
                      backdropFilter: "blur(24px)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
                    }
                }
              >
                <p className={`text-[0.9rem] leading-relaxed text-akash-star ${!isUser ? "font-bn" : ""}`}>
                  {m.text}
                </p>

                {!isUser && (
                  <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 flex-wrap"
                    style={{ borderTop: "1px solid rgba(214,186,101,0.15)" }}>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider flex-wrap">
                      {meta && MetaIcon && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full font-bold"
                          style={{ color: meta.color, background: meta.bg, fontSize: "9px" }}
                        >
                          <MetaIcon className="w-2.5 h-2.5" />
                          {meta.label}
                        </span>
                      )}
                      {m.latencyMs !== undefined && (
                        <span style={{ color: "#6a8ba8" }}>⚡ {(m.latencyMs / 1000).toFixed(1)}s</span>
                      )}
                      {m.source && (
                        <span className="truncate max-w-[160px]" style={{ color: "#6a8ba8" }}>
                          · {m.source}
                        </span>
                      )}
                    </div>

                    {/* Voice button */}
                    <button
                      onClick={() => toggleSpeak(m.text, id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 text-[10px] font-bold"
                      style={speakingId === id
                        ? { background: "rgba(214,186,101,0.2)", color: "#f5e08a", border: "1px solid rgba(214,186,101,0.5)" }
                        : { background: "rgba(255,255,255,0.04)", color: "#6a8ba8", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                      aria-label={t("শোনাও", "Play audio")}
                    >
                      {speakingId === id ? (
                        <>
                          <div className="akash-voice-wave flex items-center gap-px" style={{ color: "#f5e08a" }}>
                            <span style={{ height: "10px" }} />
                            <span style={{ height: "14px" }} />
                            <span style={{ height: "8px" }} />
                            <span style={{ height: "12px" }} />
                            <span style={{ height: "6px" }} />
                          </div>
                          <Square className="w-2.5 h-2.5" />
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          {t("শোনো", "Listen")}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(214,186,101,0.25), rgba(245,224,138,0.15))", border: "1px solid rgba(214,186,101,0.5)" }}>
              <Sparkles className="w-4.5 h-4.5 animate-spin" style={{ color: "#f5e08a" }} />
            </div>
            <div className="rounded-2xl px-5 py-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(214,186,101,0.18)", backdropFilter: "blur(24px)" }}>
              <div className="akash-loading-dots flex items-center gap-1 mb-2">
                <span /><span /><span />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#6a8ba8" }}>
                {t("আকাশ ভাবছে...", "AKASH is thinking...")}
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="my-2 px-3 py-2 rounded-xl text-xs font-bn"
          style={{ background: "rgba(232,93,122,0.08)", border: "1px solid rgba(232,93,122,0.25)", color: "#e85d7a" }}>
          {t("সর্বশেষ অনুরোধে ত্রুটি — কিউরেটেড উত্তর দেখানো হচ্ছে।", "Last request errored — showing fallback.")}
        </div>
      )}

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 my-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => send(s)}
            disabled={loading}
            className="akash-chip disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2.5"
      >
        <div className="flex-1 relative">
          <Mic className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "rgba(106,139,168,0.5)" }} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("মহাকাশ নিয়ে প্রশ্ন করো...", "Ask me anything about space...")}
            disabled={loading}
            className="w-full h-12 pl-10 pr-4 text-sm font-bn akash-input outline-none"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || loading}
          className="h-12 w-12 rounded-xl font-bold flex-shrink-0 transition-all duration-300"
          style={{
            background: input.trim() && !loading
              ? "linear-gradient(135deg, #d6ba65, #f5e08a)"
              : "rgba(255,255,255,0.06)",
            color: input.trim() && !loading ? "#030510" : "#6a8ba8",
            border: "none",
            boxShadow: input.trim() && !loading ? "0 0 20px rgba(214,186,101,0.4)" : "none",
          }}
        >
          <Send className="w-4.5 h-4.5" />
        </Button>
      </form>
    </div>
  );
}
