"use client";

import { useState } from "react";
import { useAkash, useVoice } from "@/lib/akash-context";
import { SPACE_FACTS, TOPICS, type SpaceTopic } from "@/lib/akash-data";
import { Card } from "@/components/ui/card";
import { Volume2, Square, X } from "lucide-react";

interface Body {
  id: SpaceTopic;
  cx: number;
  cy: number;
  r: number;
  fill: string;
  glow?: string;
  ring?: boolean;
}

const BODIES: Body[] = [
  { id: "sun", cx: 50, cy: 50, r: 9, fill: "#f5b945", glow: "rgba(245,185,69,0.7)" },
  { id: "mercury", cx: 65, cy: 50, r: 1.5, fill: "#9a9a9a" },
  { id: "venus", cx: 75, cy: 50, r: 2.5, fill: "#e8d485" },
  { id: "earth", cx: 86, cy: 50, r: 2.8, fill: "#5da9e9", glow: "rgba(93,169,233,0.4)" },
  { id: "mars", cx: 97, cy: 50, r: 2, fill: "#d9544d" },
  { id: "jupiter", cx: 112, cy: 50, r: 5, fill: "#d99457" },
  { id: "saturn", cx: 130, cy: 50, r: 4.5, fill: "#e0c271", ring: true },
  { id: "uranus", cx: 145, cy: 50, r: 3.2, fill: "#7ec5ed" },
  { id: "neptune", cx: 158, cy: 50, r: 3, fill: "#4d6fd9" },
];

export function StarMap() {
  const { lang, t } = useAkash();
  const { speak, stop } = useVoice();
  const [selectedTopic, setSelectedTopic] = useState<SpaceTopic | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const fact = selectedTopic
    ? SPACE_FACTS.find((f) => f.topic === selectedTopic)
    : null;

  const topicInfo = selectedTopic ? TOPICS.find((tp) => tp.id === selectedTopic) : null;

  const pickBody = (b: Body) => {
    setSelectedTopic(b.id);
    stop();
    setSpeaking(false);
  };

  const toggleSpeak = (text: string) => {
    if (speaking) {
      stop();
      setSpeaking(false);
    } else {
      speak(text, lang);
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), text.length * 80);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold akash-gradient-cosmic mb-2 font-bn">
          {t("নক্ষত্র মানচিত্র", "Star Map")}
        </h2>
        <p className="text-akash-muted font-bn">
          {t(
            "যেকোনো গ্রহে ট্যাপ করে তার সম্পর্কে জানো",
            "Tap any planet to learn about it"
          )}
        </p>
      </div>

      <Card className="akash-glass-strong p-6 md:p-8 relative overflow-hidden">
        {/* SVG Solar System */}
        <div className="relative w-full overflow-x-auto">
          <svg viewBox="0 0 180 100" className="w-full min-w-[600px] h-auto" style={{ aspectRatio: "180/100" }}>
            {/* Orbits */}
            {[15, 25, 36, 47, 62, 80, 95, 108].map((r, i) => (
              <ellipse
                key={i}
                cx="50"
                cy="50"
                rx={r}
                ry={r * 0.6}
                fill="none"
                stroke="rgba(214,186,101,0.15)"
                strokeWidth="0.2"
                strokeDasharray="0.5 0.5"
              />
            ))}

            {/* Sun glow */}
            <defs>
              <radialGradient id="sunGlow">
                <stop offset="0%" stopColor="#f5e08a" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#d6ba65" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#d6ba65" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="earthGlow">
                <stop offset="0%" stopColor="#5da9e9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#5da9e9" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="50" cy="50" r="20" fill="url(#sunGlow)" />

            {/* Sun */}
            <circle
              cx="50"
              cy="50"
              r="9"
              fill="#f5b945"
              className="cursor-pointer"
              onClick={() => pickBody(BODIES[0])}
            >
              <animate attributeName="r" values="9;9.5;9" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* Other bodies */}
            {BODIES.slice(1).map((b) => (
              <g
                key={b.id}
                className="cursor-pointer"
                onClick={() => pickBody(b)}
              >
                {b.glow && (
                  <circle cx={b.cx} cy={b.cy} r={b.r * 2.5} fill={b.glow} opacity="0.3" />
                )}
                {b.ring && (
                  <ellipse
                    cx={b.cx}
                    cy={b.cy}
                    rx={b.r * 1.8}
                    ry={b.r * 0.6}
                    fill="none"
                    stroke="#e0c271"
                    strokeWidth="0.3"
                    opacity="0.7"
                  />
                )}
                <circle
                  cx={b.cx}
                  cy={b.cy}
                  r={b.r}
                  fill={b.fill}
                  className={selectedTopic === b.id ? "ring-2 ring-akash-gold" : ""}
                />
                {/* Label */}
                <text
                  x={b.cx}
                  y={b.cy + b.r + 3}
                  fontSize="2"
                  fill={selectedTopic === b.id ? "#d6ba65" : "#7a9bb8"}
                  textAnchor="middle"
                  className="font-sans"
                >
                  {lang === "bn" ? (TOPICS.find((tp) => tp.id === b.id)?.bn ?? "") : (TOPICS.find((tp) => tp.id === b.id)?.en ?? "")}
                </text>
              </g>
            ))}

            {/* Decorative stars */}
            {[
              [5, 15], [12, 85], [25, 10], [38, 92], [55, 8], [70, 95],
              [85, 12], [102, 88], [120, 8], [140, 92], [160, 15], [175, 85],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.3" fill="white" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur={`${2 + (i % 3)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>
        </div>

        {/* Fact popup */}
        {fact && topicInfo && (
          <Card className="akash-glass mt-5 p-5 akash-fade-up relative">
            <button
              onClick={() => {
                setSelectedTopic(null);
                stop();
                setSpeaking(false);
              }}
              className="absolute top-3 right-3 text-akash-muted hover:text-akash-gold"
              aria-label={t("বন্ধ করো", "Close")}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <div className="text-4xl">{topicInfo.emoji}</div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold text-akash-gold-bright ${lang === "bn" ? "font-bn" : ""}`}>
                  {lang === "bn" ? topicInfo.bn : topicInfo.en}
                </h3>
                <p className="text-xs text-akash-muted uppercase tracking-wider mt-1">
                  {t("সূত্র", "Source")}: {fact.source}
                </p>
              </div>
            </div>

            <p className={`text-akash-star leading-relaxed mb-3 ${lang === "bn" ? "font-bn" : ""}`}>
              {lang === "bn" ? fact.answer_bn : fact.answer_en}
            </p>

            <button
              onClick={() => toggleSpeak(lang === "bn" ? fact.answer_bn : fact.answer_en)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                speaking
                  ? "bg-akash-gold text-akash-night"
                  : "akash-glass text-akash-gold hover:border-akash-gold/60"
              }`}
            >
              {speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {speaking ? t("থামাও", "Stop") : t("শোনাও", "Listen")}
            </button>
          </Card>
        )}
      </Card>

      <p className="text-center text-xs text-akash-muted mt-4 font-bn">
        {t(
          "সৌরজগতের সব গ্রহ সূর্যের চারপাশে ঘোরে। আসল দূরত্ব ও আকার এখানে দেখানো হয়নি।",
          "All planets in our Solar System orbit the Sun. Real distances and sizes are not to scale."
        )}
      </p>
    </div>
  );
}
