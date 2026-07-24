"use client";

import { useState, useMemo, useCallback } from "react";
import { useAkash, useVoice } from "@/lib/akash-context";
import { SPACE_FACTS } from "@/lib/akash-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Volume2, Square, Send, Sparkles, User, Zap, Database, AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  live: { icon: Zap, label: "Live Gemma", color: "text-akash-gold" },
  cache: { icon: Zap, label: "Cached", color: "text-akash-cyan" },
  curated: { icon: Database, label: "Curated", color: "text-akash-purple-bright" },
  polite: { icon: AlertCircle, label: "Fallback", color: "text-akash-muted" },
};

export function AskMode() {
  const { lang, t } = useAkash();
  const { speak, stop } = useVoice();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: t(
        "নমস্কার! আমি আকাশ — তোমার মহাকাশ বন্ধু। যেকোনো প্রশ্ন করো, আমি বাংলায় উত্তর দেব।",
        "Hello! I'm AKASH — your space friend. Ask me anything, and I'll answer in Bangla or English."
      ),
      fallback: "curated",
      source: "AKASH",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(
    () => SPACE_FACTS.slice(0, 4).map((f) => (lang === "bn" ? f.question_bn : f.question_en)),
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
        // Show error inline as a system message
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: t(
              `দুঃখিত, এই মুহূর্তে উত্তর দেওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করো। (ত্রুটি: ${msg})`,
              `Sorry, I couldn't answer right now. Please try again in a moment. (Error: ${msg})`
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
      setTimeout(() => setSpeakingId(null), text.length * 80);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <ScrollArea
        className="flex-1 min-h-0 mb-4 pr-2"
        style={{ maxHeight: "calc(100vh - 340px)" }}
      >
        <div className="space-y-4 p-1">
          {messages.map((m, i) => {
            const id = `msg-${i}`;
            const meta = m.fallback ? FALLBACK_META[m.fallback] : null;
            const MetaIcon = meta?.icon;
            return (
              <div
                key={id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${
                    m.role === "user"
                      ? "bg-akash-purple/20 border-akash-purple/40"
                      : "bg-akash-gold/20 border-akash-gold/50"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-4 h-4 text-akash-purple-bright" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-akash-gold-bright" />
                  )}
                </div>
                <div
                  className={`akash-glass rounded-2xl px-4 py-3 max-w-[85%] akash-stream-in ${
                    m.role === "user" ? "bg-akash-purple/15" : ""
                  }`}
                >
                  <p
                    className={`text-akash-star leading-relaxed ${
                      m.role === "user" ? "" : "font-bn"
                    }`}
                  >
                    {m.text}
                  </p>
                  {m.role === "assistant" && (
                    <div className="mt-2 pt-2 border-t border-akash-border/40 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-[10px] text-akash-muted uppercase tracking-wider">
                        {MetaIcon && (
                          <span className={`flex items-center gap-1 ${meta.color}`}>
                            <MetaIcon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        )}
                        {m.latencyMs !== undefined && (
                          <span>· {(m.latencyMs / 1000).toFixed(1)}s</span>
                        )}
                        {m.source && (
                          <span className="truncate max-w-[200px]">· {m.source}</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleSpeak(m.text, id)}
                        className="text-akash-gold hover:text-akash-gold-bright transition-colors"
                        aria-label={t("শোনাও", "Play audio")}
                      >
                        {speakingId === id ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
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
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border bg-akash-gold/20 border-akash-gold/50">
                <Sparkles className="w-4 h-4 text-akash-gold-bright akash-pulse-glow rounded-full" />
              </div>
              <div className="akash-glass rounded-2xl px-4 py-4">
                <div className="akash-loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="text-[10px] text-akash-muted mt-2 uppercase tracking-wider">
                  {t("গেমা ভাবছে...", "Gemma is thinking...")}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-akash-purple/10 border border-akash-purple/30 text-xs text-akash-purple-bright">
          {t("সর্বশেষ অনুরোধে ত্রুটি — কিউরেটেড উত্তর দেখানো হচ্ছে।", "Last request errored — showing fallback.")}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => send(s)}
            disabled={loading}
            className="akash-glass px-3 py-1.5 rounded-full text-xs text-akash-star-dim hover:text-akash-gold hover:border-akash-gold/60 transition-all font-bn disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("মহাকাশ নিয়ে প্রশ্ন করো...", "Ask about space...")}
          disabled={loading}
          className="flex-1 bg-akash-card border-akash-border text-akash-star placeholder:text-akash-muted font-bn h-12 rounded-xl"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || loading}
          className="bg-akash-gold hover:bg-akash-gold-bright text-akash-night h-12 w-12 rounded-xl akash-pulse-glow"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
