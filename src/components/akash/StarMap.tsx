"use client";

import { useState } from "react";
import { useAkash, useVoice } from "@/lib/akash-context";
import { SPACE_FACTS, TOPICS, type SpaceTopic } from "@/lib/akash-data";
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
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 font-display text-[#1a2744]">
          {t("সৌরজগৎ ও তারার মানচিত্র", "Solar System & Star Map")}
        </h2>
        <p className="text-[#5b6b8a] font-bn text-base max-w-lg mx-auto">
          {t(
            "যেকোনো গ্রহে ক্লিক করে তার সম্পর্কে দারুণ সব তথ্য জানো!",
            "Click on any planet to explore fascinating facts about it!"
          )}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0eaf5] shadow-xl relative overflow-hidden">
        {/* Interactive SVG Solar System Map */}
        <div className="relative w-full overflow-x-auto bg-gradient-to-b from-[#0a1130] to-[#15244d] rounded-2xl p-4 shadow-inner">
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
                stroke="rgba(56,189,248,0.3)"
                strokeWidth="0.25"
                strokeDasharray="0.6 0.6"
              />
            ))}

            {/* Sun Glow */}
            <defs>
              <radialGradient id="sunGlow">
                <stop offset="0%" stopColor="#fff7b0" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
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
              <animate attributeName="r" values="9;9.6;9" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* Other Bodies */}
            {BODIES.slice(1).map((b) => (
              <g
                key={b.id}
                className="cursor-pointer transition-transform hover:scale-125"
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
                  className={selectedTopic === b.id ? "stroke-white stroke-[0.5]" : ""}
                />
                {/* Label */}
                <text
                  x={b.cx}
                  y={b.cy + b.r + 3.5}
                  fontSize="2.2"
                  fontWeight="bold"
                  fill={selectedTopic === b.id ? "#38bdf8" : "#e2e8f0"}
                  textAnchor="middle"
                  className="font-bn"
                >
                  {lang === "bn" ? (TOPICS.find((tp) => tp.id === b.id)?.bn ?? "") : (TOPICS.find((tp) => tp.id === b.id)?.en ?? "")}
                </text>
              </g>
            ))}

            {/* Twinkling Stars */}
            {[
              [5, 15], [12, 85], [25, 10], [38, 92], [55, 8], [70, 95],
              [85, 12], [102, 88], [120, 8], [140, 92], [160, 15], [175, 85],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.4" fill="white" opacity="0.8">
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

        {/* Fact Card Popup */}
        {fact && topicInfo && (
          <div className="mt-6 p-6 rounded-2xl bg-[#f0f8ff] border border-[#bae6fd] relative animate-fade-in">
            <button
              onClick={() => {
                setSelectedTopic(null);
                stop();
                setSpeaking(false);
              }}
              className="absolute top-4 right-4 p-1 rounded-full text-[#8896b3] hover:text-[#1a2744] hover:bg-[#e3f2fd]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl p-2 rounded-2xl bg-white border border-[#bae6fd] shadow-sm">
                {topicInfo.emoji}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0284c7] font-display">
                  {lang === "bn" ? topicInfo.bn : topicInfo.en}
                </h3>
                <p className="text-xs text-[#5b6b8a] uppercase tracking-wider font-semibold mt-0.5">
                  {t("সূত্র", "Source")}: {fact.source}
                </p>
              </div>
            </div>

            <p className="text-base text-[#1a2744] leading-relaxed font-bn mb-4">
              {lang === "bn" ? fact.answer_bn : fact.answer_en}
            </p>

            <button
              onClick={() => toggleSpeak(lang === "bn" ? fact.answer_bn : fact.answer_en)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                speaking
                  ? "bg-[#1a2744] text-white"
                  : "bg-[#0284c7] text-white hover:bg-[#0369a1]"
              }`}
            >
              {speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {speaking ? t("থামাও", "Stop") : t("তথ্যটি শোনো", "Listen")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
