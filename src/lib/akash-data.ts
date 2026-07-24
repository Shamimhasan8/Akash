/**
 * AKASH — curated bilingual space knowledge corpus
 *
 * This is the "curated + simulated" knowledge base that powers AKASH's live demo.
 * In production, these answers would come from a fine-tuned Gemma-2-2B-it model
 * grounded by a ChromaDB RAG pipeline over Bangla Wikipedia + NASA Space Place
 * translations. For the 48-hour MVP, we ship a hand-crafted corpus of ~50 of the
 * most-asked kid space questions, ensuring demo reliability regardless of API
 * rate limits or network conditions.
 *
 * Each entry is bilingual (Bangla + English) so AKASH can toggle language instantly.
 */

export interface SpaceFact {
  id: string;
  topic: SpaceTopic;
  question_bn: string;
  question_en: string;
  answer_bn: string;
  answer_en: string;
  source: string;
  keywords: string[];
}

export type SpaceTopic =
  | "sun"
  | "moon"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "venus"
  | "mercury"
  | "neptune"
  | "uranus"
  | "black_hole"
  | "galaxy"
  | "star"
  | "comet"
  | "meteor"
  | "rocket"
  | "astronaut"
  | "iss"
  | "big_bang"
  | "eclipse";

export const TOPICS: { id: SpaceTopic; bn: string; en: string; emoji: string; color: string }[] = [
  { id: "sun", bn: "সূর্য", en: "Sun", emoji: "☀", color: "#f5b945" },
  { id: "moon", bn: "চাঁদ", en: "Moon", emoji: "🌙", color: "#c0c5d0" },
  { id: "earth", bn: "পৃথিবী", en: "Earth", emoji: "🌍", color: "#5da9e9" },
  { id: "mars", bn: "মঙ্গল", en: "Mars", emoji: "🔴", color: "#d9544d" },
  { id: "jupiter", bn: "বৃহস্পতি", en: "Jupiter", emoji: "🟠", color: "#d99457" },
  { id: "saturn", bn: "শনি", en: "Saturn", emoji: "🪐", color: "#e0c271" },
  { id: "venus", bn: "শুক্র", en: "Venus", emoji: "🟡", color: "#e8d485" },
  { id: "mercury", bn: "বুধ", en: "Mercury", emoji: "⚫", color: "#9a9a9a" },
  { id: "neptune", bn: "নেপচুন", en: "Neptune", emoji: "🔵", color: "#4d6fd9" },
  { id: "uranus", bn: "ইউরেনাস", en: "Uranus", emoji: "🩵", color: "#7ec5ed" },
  { id: "black_hole", bn: "কৃষ্ণ গহ্বর", en: "Black Hole", emoji: "🕳", color: "#1a1a1a" },
  { id: "galaxy", bn: "ছায়াপথ", en: "Galaxy", emoji: "🌌", color: "#9b6cf0" },
  { id: "star", bn: "নক্ষত্র", en: "Star", emoji: "⭐", color: "#f5e08a" },
  { id: "comet", bn: "ধূমকেতু", en: "Comet", emoji: "☄", color: "#a0e0f0" },
  { id: "meteor", bn: "উল্কা", en: "Meteor", emoji: "🌠", color: "#ffb380" },
  { id: "rocket", bn: "রকেট", en: "Rocket", emoji: "🚀", color: "#e0e0e0" },
  { id: "astronaut", bn: "মহাকাশচারী", en: "Astronaut", emoji: "👨‍🚀", color: "#f5f3ea" },
  { id: "iss", bn: "আন্তর্জাতিক মহাকাশ স্টেশন", en: "ISS", emoji: "🛰", color: "#c0c5d0" },
  { id: "big_bang", bn: "বিগ ব্যাং", en: "Big Bang", emoji: "💥", color: "#ff6b6b" },
  { id: "eclipse", bn: "গ্রহণ", en: "Eclipse", emoji: "🌑", color: "#404060" },
];

export const SPACE_FACTS: SpaceFact[] = [
  {
    id: "sun_what",
    topic: "sun",
    question_bn: "সূর্য কী?",
    question_en: "What is the Sun?",
    answer_bn:
      "সূর্য (Sun) হলো একটি বিশাল জ্বলন্ত নক্ষত্র, যা আমাদের সৌরজগতের (Solar System) কেন্দ্রে আছে। এটি একটি বলের মতো গরম গ্যাস দিয়ে তৈরি, এবং এর ভেতরে থাকা হাইড্রোজেন গ্যাস জ্বলে বিশাল আলো ও তাপ তৈরি করে। সূর্য ছাড়া পৃথিবীতে কোনো জীবন থাকতো না — গাছ খাবার তৈরি করতে পারতো না, আর আমরা সবাই ঠান্ডায় জমে যেতাম।",
    answer_en:
      "The Sun is a huge burning star at the center of our Solar System. It is a giant ball of hot gas, and the hydrogen inside it burns to create enormous light and heat. Without the Sun, there would be no life on Earth — plants could not make food, and we would all freeze.",
    source: "NASA Space Place",
    keywords: ["sun", "surjo", "সূর্য", "star", "solar"],
  },
  {
    id: "sun_size",
    topic: "sun",
    question_bn: "সূর্য কত বড়?",
    question_en: "How big is the Sun?",
    answer_bn:
      "সূর্য পৃথিবীর চেয়ে প্রায় ১০৯ গুণ চওড়া! ভেতরে প্রায় ১৩ লক্ষ পৃথিবী ঢুকে যেতে পারে। কিন্তু মহাকাশে সূর্য এত দূরে আছে (প্রায় ১৫ কোটি কিলোমিটার) যে আকাশে একটা ছোট বলের মতো দেখায়।",
    answer_en:
      "The Sun is about 109 times wider than Earth! About 1.3 million Earths could fit inside it. But it is so far away in space (about 150 million km) that it looks like a small ball in the sky.",
    source: "NASA Space Place",
    keywords: ["sun", "size", "big", "বড়", "আকার"],
  },
  {
    id: "sun_temp",
    topic: "sun",
    question_bn: "সূর্যের তাপমাত্রা কত?",
    question_en: "How hot is the Sun?",
    answer_bn:
      "সূর্যের বাইরের দিকের তাপমাত্রা প্রায় ৫,৫০০ ডিগ্রি সেলসিয়াস — এত গরম যে কোনো জিনিস চোখের পলকে গলে যাবে। আর ভেতরে? প্রায় ১৫ লক্ষ ডিগ্রি! কল্পনা করা কঠিন এত গরম। তাই কখনো খালি চোখে সূর্যের দিকে তাকানো যাবে না।",
    answer_en:
      "The Sun's surface is about 5,500°C — so hot that anything would melt instantly. And inside? About 15 million degrees! It's hard to imagine such heat. That's why we should never look at the Sun directly.",
    source: "NASA Space Place",
    keywords: ["sun", "hot", "temperature", "তাপ", "গরম"],
  },
  {
    id: "moon_what",
    topic: "moon",
    question_bn: "চাঁদ কী?",
    question_en: "What is the Moon?",
    answer_bn:
      "চাঁদ (Moon) হলো পৃথিবীর একমাত্র প্রাকৃতিক উপগ্রহ — মানে পৃথিবীর চারপাশে ঘোরে এমন একটা পাথরের বল। চাঁদ নিজে আলো তৈরি করতে পারে না, সূর্যের আলো চাঁদে পড়ে আর সেটা আমরা দেখি। চাঁদ পৃথিবী থেকে প্রায় ৪ লক্ষ কিলোমিটার দূরে।",
    answer_en:
      "The Moon is Earth's only natural satellite — a ball of rock that orbits around Earth. The Moon doesn't make its own light; we see it because sunlight bounces off it. The Moon is about 400,000 km away from Earth.",
    source: "NASA Space Place",
    keywords: ["moon", "chad", "চাঁদ", "satellite"],
  },
  {
    id: "moon_phases",
    topic: "moon",
    question_bn: "চাঁদের কেন আকার বদলায়?",
    question_en: "Why does the Moon change shape?",
    answer_bn:
      "চাঁদ আসলে আকার বদলায় না — আমরা শুধু সূর্যের আলো পড়া অংশটা দেখি। চাঁদ পৃথিবীর চারপাশে ঘোরার সময় সূর্যের আলো পড়া অংশ বদলায়, তাই চাঁদ একসময় পূর্ণ গোলক (পূর্ণিমা), আরেক সময় অর্ধচন্দ্র (অষ্টমী), আবার সরু কাঁটার মতো (অমাবস্যা) দেখায়। পুরো চক্র ২৯.৫ দিনে শেষ হয়।",
    answer_en:
      "The Moon doesn't actually change shape — we just see the part that sunlight hits. As the Moon orbits Earth, the lit part we see changes, so the Moon looks full (full moon), half (half moon), or like a thin sliver (new moon). The whole cycle takes 29.5 days.",
    source: "NASA Space Place",
    keywords: ["moon", "phases", "আকার", "shape"],
  },
  {
    id: "moon_gravity",
    topic: "moon",
    question_bn: "চাঁদে মানুষ কেন ভাসে?",
    question_en: "Why do people float on the Moon?",
    answer_bn:
      "চাঁদের অনুগ্রহ (gravity) পৃথিবীর থেকে অনেক কম — মাত্র ৬ ভাগের ১ ভাগ! তাই চাঁদে মানুষ হালকা বোধ করে আর লাফ দিলে অনেক উঁচুতে যায়। যদি পৃথিবীতে তুমি ১ মিটার লাফ দাও, চাঁদে সেই লাফ হবে ৬ মিটার! নীল আর্মস্ট্রং ১৯৬৯ সালে প্রথম চাঁদে পা রাখেন।",
    answer_en:
      "The Moon's gravity is much weaker than Earth's — only 1/6th as strong! So people feel lighter on the Moon and jump much higher. If you jump 1 meter on Earth, you'd jump 6 meters on the Moon! Neil Armstrong first stepped on the Moon in 1969.",
    source: "NASA Apollo Archive",
    keywords: ["moon", "gravity", "ভাসে", "float", "jump"],
  },
  {
    id: "earth_what",
    topic: "earth",
    question_bn: "পৃথিবী কী?",
    question_en: "What is Earth?",
    answer_bn:
      "পৃথিবী (Earth) হলো সৌরজগতের তৃতীয় গ্রহ আর আমাদের ঘর। এটাই একমাত্র গ্রহ যেখানে আমরা জানি জীবন আছে। পৃথিবীর ৭১% পানি আর ২৯% মাটি। পৃথিবী সূর্যের চারপাশে ৩৬৫ দিনে একবার ঘোরে — এটাই এক বছর। আর নিজের চারপাশে ২৪ ঘণ্টায় ঘোরে — এটাই এক দিন।",
    answer_en:
      "Earth is the third planet from the Sun and our home. It is the only planet we know has life. Earth is 71% water and 29% land. Earth orbits the Sun once every 365 days — that's one year. And it spins on its axis once every 24 hours — that's one day.",
    source: "NASA Earth Observatory",
    keywords: ["earth", "prithibi", "পৃথিবী", "home", "planet"],
  },
  {
    id: "earth_day_night",
    topic: "earth",
    question_bn: "দিন আর রাত কেন হয়?",
    question_en: "Why do we have day and night?",
    answer_bn:
      "পৃথিবী সূর্যের চারপাশে ঘোরার সময় নিজের চারপাশেও ঘোরে — একটা টপের মতো। যেদিকে সূর্য থাকে সেদিকে দিন, আর অন্যদিকে রাত। পৃথিবী ২৪ ঘণ্টায় একবার ঘুরে শেষ করে, তাই প্রতিদিন দিন-রাত হয়।",
    answer_en:
      "As Earth orbits the Sun, it also spins on its axis — like a top. The side facing the Sun has day, and the other side has night. Earth completes one spin every 24 hours, so we get day and night every day.",
    source: "NASA Space Place",
    keywords: ["earth", "day", "night", "দিন", "রাত"],
  },
  {
    id: "mars_what",
    topic: "mars",
    question_bn: "মঙ্গল কেন লাল?",
    question_en: "Why is Mars red?",
    answer_bn:
      "মঙ্গল (Mars) গ্রহের মাটিতে প্রচুর আয়রন (iron) আছে, আর সেই আয়রন বাতাসের অক্সিজেনের সাথে মিশে মরচে (rust) ধরে। মরচে দেখতে লাল-বাদামি হয়, তাই গোটা গ্রহটা লাল দেখায়। মঙ্গলকে 'লাল গ্রহ' (Red Planet) বলা হয়। মঙ্গলের আকার পৃথিবীর অর্ধেক।",
    answer_en:
      "Mars has a lot of iron in its soil, and that iron mixes with oxygen in the air to form rust. Rust looks reddish-brown, so the whole planet appears red. Mars is called the 'Red Planet'. Mars is about half the size of Earth.",
    source: "NASA Mars Mission",
    keywords: ["mars", "mongol", "মঙ্গল", "red", "লাল"],
  },
  {
    id: "mars_life",
    topic: "mars",
    question_bn: "মঙ্গলে কি জীবন আছে?",
    question_en: "Is there life on Mars?",
    answer_bn:
      "এখনো পর্যন্ত মঙ্গলে কোনো জীবন পাওয়া যায়নি। কিন্তু বিজ্ঞানীরা মঙ্গলে রোবট পাঠিয়ে খোঁজ করছেন — সেখানে আগে পানি ছিল কিনা, সেখানে অণুজীব (microbes) থাকতে পারে কিনা। ভবিষ্যতে মানুষ মঙ্গলে যাওয়ার পরিকল্পনা আছে — হয়তো ২০৩০ সালের দিকে!",
    answer_en:
      "So far, no life has been found on Mars. But scientists are sending robots to search — whether there used to be water, whether microbes could live there. There are plans to send humans to Mars in the future — maybe around 2030!",
    source: "NASA Mars 2020",
    keywords: ["mars", "life", "জীবন", "microbe"],
  },
  {
    id: "jupiter_what",
    topic: "jupiter",
    question_bn: "বৃহস্পতি কত বড়?",
    question_en: "How big is Jupiter?",
    answer_bn:
      "বৃহস্পতি (Jupiter) সৌরজগতের সবচেয়ে বড় গ্রহ — এত বড় যে ভেতরে ১,৩০০টা পৃথিবী ঢুকে যাবে! কিন্তু বৃহস্পতি পাথর দিয়ে তৈরি না — এটা মূলত গ্যাস দিয়ে তৈরি। তাই বৃহস্পতিতে দাঁড়ানো যাবে না। বৃহস্পতিতে একটা বিশাল লাল দাগ আছে — এটা একটা বড় ঘূর্ণিঝড় যা ৩০০ বছর ধরে চলছে!",
    answer_en:
      "Jupiter is the largest planet in our Solar System — so big that 1,300 Earths could fit inside! But Jupiter is not made of rock — it's mostly gas. So you cannot stand on Jupiter. Jupiter has a giant red spot — it's a huge storm that has been going for 300 years!",
    source: "NASA Juno Mission",
    keywords: ["jupiter", "brihospati", "বৃহস্পতি", "big", "gas"],
  },
  {
    id: "saturn_rings",
    topic: "saturn",
    question_bn: "শনির চারপাশে বলয় কেন আছে?",
    question_en: "Why does Saturn have rings?",
    answer_bn:
      "শনি (Saturn) গ্রহের চারপাশে বরফ আর পাথরের কোটি কোটি টুকরো ঘুরছে — এগুলোই বলয় (rings)। এই টুকরোগুলো আসলে ধূমকেতু, উল্কা আর চাঁদের ভাঙা অংশ। বলয়গুলো অনেক চওড়া কিন্তু খুবই পাতলা — কিছু জায়গায় মাত্র ১০ মিটার পুরু! শনি ছাড়া বৃহস্পতি, ইউরেনাস আর নেপচুনেরও বলয় আছে।",
    answer_en:
      "Saturn has billions of pieces of ice and rock orbiting around it — these form the rings. These pieces are actually broken bits of comets, meteors, and moons. The rings are very wide but very thin — only 10 meters thick in some places! Jupiter, Uranus, and Neptune also have rings.",
    source: "NASA Cassini Mission",
    keywords: ["saturn", "shoni", "শনি", "rings", "বলয়"],
  },
  {
    id: "black_hole_what",
    topic: "black_hole",
    question_bn: "কৃষ্ণ গহ্বর কী?",
    question_en: "What is a black hole?",
    answer_bn:
      "কৃষ্ণ গহ্বর (Black Hole) হলো মহাকাশের এমন একটা জায়গা যেখানে অনুগ্রহ (gravity) এত শক্তিশালী যে কিছুই বের হতে পারে না — এমনকি আলোও! কৃষ্ণ গহ্বর তৈরি হয় যখন একটা বিশাল নক্ষত্র মারা যায় আর নিজের ভেতরে ধসে পড়ে। ভয়ের কিছু নেই — পৃথিবী থেকে অনেক অনেক দূরে।",
    answer_en:
      "A black hole is a place in space where gravity is so strong that nothing can escape — not even light! Black holes form when a huge star dies and collapses in on itself. Don't worry — they are very, very far from Earth.",
    source: "NASA Black Hole Field Guide",
    keywords: ["black hole", "krishno bilor", "কৃষ্ণ গহ্বর"],
  },
  {
    id: "star_what",
    topic: "star",
    question_bn: "নক্ষত্র কী?",
    question_en: "What is a star?",
    answer_bn:
      "নক্ষত্র (Star) হলো মহাকাশের একটা বিশাল জ্বলন্ত গ্যাসের বল — সূর্যও একটা নক্ষত্র। নক্ষত্রের ভেতরে হাইড্রোজেন গ্যাস জ্বলে আলো আর তাপ তৈরি করে। রাতের আকাশে আমরা যে হাজার হাজার নক্ষত্র দেখি, সেগুলো সূর্যের মতোই — শুধু অনেক দূরে।",
    answer_en:
      "A star is a huge burning ball of gas in space — the Sun is also a star. Inside a star, hydrogen gas burns to make light and heat. The thousands of stars we see in the night sky are just like our Sun — only much farther away.",
    source: "NASA Star Field Guide",
    keywords: ["star", "nokkhotro", "নক্ষত্র"],
  },
  {
    id: "comet_what",
    topic: "comet",
    question_bn: "ধূমকেতু কী?",
    question_en: "What is a comet?",
    answer_bn:
      "ধূমকেতু (Comet) হলো একটা বরফের বল যা মহাকাশে ঘোরে। সূর্যের কাছে এলে বরফ গলে যায় আর পেছনে একটা লেজ তৈরি হয় — দেখতে অনেকটা ঝাড়ুর মতো। ধূমকেতুকে বাংলায় 'লেজের তারা' বলা যায়। হ্যালির ধূমকেতু ৭৬ বছরে একবার দেখা যায় — পরেরবার ২০৬১ সালে!",
    answer_en:
      "A comet is a ball of ice that orbits in space. When it gets close to the Sun, the ice melts and forms a tail behind it — looking like a broom. Halley's Comet is visible once every 76 years — next time in 2061!",
    source: "NASA Comet Field Guide",
    keywords: ["comet", "dhumketu", "ধূমকেতু"],
  },
  {
    id: "meteor_what",
    topic: "meteor",
    question_bn: "তারা খসা কী?",
    question_en: "What is a shooting star?",
    answer_bn:
      "রাতের আকাশে যখন একটা তারা খসে যাওয়ার মতো দেখায়, সেটা আসলে তারা না — সেটা উল্কা (meteor)! মহাকাশের ছোট পাথর পৃথিবীর বাতাসে এলে ঘর্ষণে জ্বলে ওঠে। বাংলায় বলি 'তারা খসলো'। মনে রাখবে — আসল নক্ষত্র কখনো খসে না, সেগুলো অনেক দূরে আছে।",
    answer_en:
      "When a star seems to fall in the night sky, it's not actually a star — it's a meteor! A small space rock enters Earth's atmosphere and burns up from friction. Remember — real stars never fall, they are very far away.",
    source: "NASA Meteoroid Office",
    keywords: ["meteor", "ulka", "উল্কা", "shooting star"],
  },
  {
    id: "rocket_what",
    topic: "rocket",
    question_bn: "রকেট কীভাবে উড়ে?",
    question_en: "How does a rocket fly?",
    answer_bn:
      "রকেট পেছন দিক দিয়ে গরম গ্যাস বের করে — আর সেই ধাক্কায় সামনের দিকে যায়। এটাকে বলে 'থ্রাস্ট' (thrust)। রকেটের ভেতরে জ্বালানি পোড়ে, গরম গ্যাস বিশাল বেগে পেছনে বের হয়, আর রকেট সামনে যায় — ঠিক যেমন বেলুন ছেড়ে দিলে ছুটে যায়। রকেট মহাকাশে যাওয়ার একমাত্র উপায়।",
    answer_en:
      "A rocket pushes hot gas out from the back — and the push sends it forward. This is called 'thrust'. Fuel burns inside the rocket, hot gas rushes out the back at huge speed, and the rocket moves forward — just like when you let go of a filled balloon. Rockets are the only way to reach space.",
    source: "NASA Rocket Science",
    keywords: ["rocket", "rokot", "রকেট", "thrust"],
  },
  {
    id: "astronaut_what",
    topic: "astronaut",
    question_bn: "মহাকাশচারী কী?",
    question_en: "What is an astronaut?",
    answer_bn:
      "মহাকাশচারী (Astronaut) হলেন সেই মানুষ যিনি মহাকাশে কাজ করতে যান। তারা বিশেষ মহাকাশযানে চড়ে যান, স্পেস স্যুট পরেন, আর আন্তর্জাতিক মহাকাশ স্টেশনে (ISS) গবেষণা করেন। মহাকাশে তারা ভাসে, বিশেষ খাবার খান, আর পৃথিবীকে ছোট গোলকের মতো দেখেন। ভারতের রাকেশ শর্মা ১৯৮৪ সালে প্রথম ভারতীয় হিসেবে মহাকাশে গেছেন।",
    answer_en:
      "An astronaut is a person who goes to space to work. They ride in special spacecraft, wear space suits, and do research on the International Space Station (ISS). In space they float, eat special food, and see Earth as a small globe. Rakesh Sharma was the first Indian in space in 1984.",
    source: "NASA Astronaut Biography",
    keywords: ["astronaut", "mohakashchari", "মহাকাশচারী"],
  },
  {
    id: "iss_what",
    topic: "iss",
    question_bn: "আন্তর্জাতিক মহাকাশ স্টেশন কী?",
    question_en: "What is the International Space Station?",
    answer_bn:
      "আন্তর্জাতিক মহাকাশ স্টেশন (ISS) হলো পৃথিবীর উপরে মহাকাশে একটা বিশাল গবেষণাগার — পৃথিবী থেকে মাত্র ৪০০ কিলোমিটার উপরে! সেখানে সবসময় ৭ জন মহাকাশচারী থাকেন, বিজ্ঞানের গবেষণা করেন। ISS পৃথিবীর চারপাশে ৯০ মিনিটে একবার ঘোরে — মানে এক দিনে ১৬টা সূর্যোদয় দেখা যায়!",
    answer_en:
      "The International Space Station (ISS) is a huge laboratory in space, just 400 km above Earth! Seven astronauts always live there, doing science research. The ISS orbits Earth every 90 minutes — that means 16 sunrises every day!",
    source: "NASA ISS Program",
    keywords: ["iss", "space station", "মহাকাশ স্টেশন"],
  },
  {
    id: "big_bang_what",
    topic: "big_bang",
    question_bn: "বিগ ব্যাং কী?",
    question_en: "What is the Big Bang?",
    answer_bn:
      "বিগ ব্যাং (Big Bang) হলো মহাবিশ্বের জন্মের গল্প। প্রায় ১৩৮ কোটি বছর আগে পুরো মহাবিশ্ব একটা ছোট্ট বিন্দুতে ছিল। হঠাৎ সেটা বিশাল বিস্ফোরণে ছড়িয়ে পড়ল — আর তখন থেকে মহাবিশ্ব বড় হতে হতে আজকের রূপ পেয়েছে। নক্ষত্র, গ্রহ, আর আমরা সবাই — সবই বিগ ব্যাং থেকে এসেছি।",
    answer_en:
      "The Big Bang is the story of how the universe was born. About 13.8 billion years ago, the entire universe was in one tiny point. Suddenly it expanded in a huge explosion — and the universe has been growing ever since. Stars, planets, and us — everything came from the Big Bang.",
    source: "ESA Planck Mission",
    keywords: ["big bang", "বিগ ব্যাং", "universe", "মহাবিশ্ব"],
  },
  {
    id: "galaxy_what",
    topic: "galaxy",
    question_bn: "ছায়াপথ কী?",
    question_en: "What is a galaxy?",
    answer_bn:
      "ছায়াপথ (Galaxy) হলো কোটি কোটি নক্ষত্রের একটা বিশাল সমষ্টি — সবাই একসাথে ঘোরে। আমাদের ছায়াপথের নাম 'আকাশগঙ্গা' (Milky Way)। এতে ১০০ থেকে ৪০০ শত কোটি নক্ষত্র আছে! আকাশগঙ্গা ছাড়া মহাবিশ্বে আরও কোটি কোটি ছায়াপথ আছে। রাতের আকাশে যে সাদা দুধের মতো দাগ দেখি, সেটাই আকাশগঙ্গা।",
    answer_en:
      "A galaxy is a huge collection of billions of stars — all moving together. Our galaxy is called the 'Milky Way'. It has 100 to 400 billion stars! Beyond the Milky Way, there are billions of other galaxies. The white milky band we see in the night sky is the Milky Way.",
    source: "ESA Galaxy Catalog",
    keywords: ["galaxy", "chayapoth", "ছায়াপথ", "milky way"],
  },
  {
    id: "eclipse_what",
    topic: "eclipse",
    question_bn: "গ্রহণ কী?",
    question_en: "What is an eclipse?",
    answer_bn:
      "সূর্যগ্রহণ (Solar Eclipse) হয় যখন চাঁদ সূর্য আর পৃথিবীর মাঝে চলে আসে, আর পৃথিবীতে চাঁদের ছায়া পড়ে। চাঁদগ্রহণ (Lunar Eclipse) হয় যখন পৃথিবী সূর্য আর চাঁদের মাঝে আসে, আর চাঁদে পৃথিবীর ছায়া পড়ে। সূর্যগ্রহণের সময় কখনো খালি চোখে সূর্যের দিকে তাকানো যাবে না!",
    answer_en:
      "A solar eclipse happens when the Moon comes between the Sun and Earth, casting its shadow on Earth. A lunar eclipse happens when Earth comes between the Sun and Moon, casting its shadow on the Moon. During a solar eclipse, never look at the Sun directly!",
    source: "NASA Eclipse Field Guide",
    keywords: ["eclipse", "grohon", "গ্রহণ", "solar", "lunar"],
  },
  {
    id: "venus_what",
    topic: "venus",
    question_bn: "শুক্র কেন উজ্জ্বল?",
    question_en: "Why is Venus so bright?",
    answer_bn:
      "শুক্র (Venus) হলো আকাশের সবচেয়ে উজ্জ্বল গ্রহ — ভোরের আকাশে 'ভোরের তারা' বা সন্ধ্যায় 'সন্ধ্যাতারা' নামে পরিচিত। শুক্র উজ্জ্বল কারণ এর চারপাশে পুরু মেঘের আস্তরণ — সেই মেঘ সূর্যের আলো ভালোভাবে প্রতিফলিত করে। কিন্তু ভেতরে শুক্র পৃথিবীর চেয়ে অনেক গরম — ৪৬৫ ডিগ্রি সেলসিয়াস!",
    answer_en:
      "Venus is the brightest planet in the sky — known as the 'Morning Star' or 'Evening Star'. Venus is bright because it has thick clouds around it — those clouds reflect sunlight well. But inside, Venus is much hotter than Earth — 465°C!",
    source: "NASA Venus Fact Sheet",
    keywords: ["venus", "shukro", "শুক্র", "bright"],
  },
  {
    id: "mercury_what",
    topic: "mercury",
    question_bn: "বুধ গ্রহের বিশেষত্ব কী?",
    question_en: "What is special about Mercury?",
    answer_bn:
      "বুধ (Mercury) সূর্যের সবচেয়ে কাছের গ্রহ আর সৌরজগতের সবচেয়ে ছোট গ্রহ। বুধে একদিন পৃথিবীর ৫৯ দিনের সমান! কারণ বুধ খুব ধীরে নিজের চারপাশে ঘোরে। সূর্যের কাছে হওয়ায় দিনে খুব গরম (৪৩০°C), আর রাতে খুব ঠান্ডা (-১৮০°C) — মেঘ না থাকায় তাপ ধরে রাখতে পারে না।",
    answer_en:
      "Mercury is the closest planet to the Sun and the smallest planet in the Solar System. One day on Mercury equals 59 Earth days! Because Mercury spins very slowly. Being close to the Sun, it's very hot in day (430°C) and very cold at night (-180°C) — no clouds to hold heat.",
    source: "NASA Mercury Mission",
    keywords: ["mercury", "budh", "বুধ", "small"],
  },
  {
    id: "neptune_what",
    topic: "neptune",
    question_bn: "নেপচুন কত দূরে?",
    question_en: "How far is Neptune?",
    answer_bn:
      "নেপচুন (Neptune) সূর্য থেকে সবচেয়ে দূরের গ্রহ — প্রায় ৪৫ শত কোটি কিলোমিটার দূরে! নেপচুনে এক বছর পৃথিবীর ১৬৫ বছরের সমান — মানে নেপচুন ১৮৪৬ সালে আবিষ্কারের পর ২০১১ সালে সূর্যের চারপাশে প্রথমবার পূর্ণ ঘোরা শেষ করে। নেপচুন গাঢ় নীল রঙের, কারণ বায়ুমণ্ডলে মিথেন গ্যাস আছে।",
    answer_en:
      "Neptune is the farthest planet from the Sun — about 4.5 billion km away! One year on Neptune equals 165 Earth years — meaning since its discovery in 1846, Neptune completed its first orbit in 2011. Neptune is deep blue because of methane gas in its atmosphere.",
    source: "NASA Neptune Fact Sheet",
    keywords: ["neptune", "neputon", "নেপচুন", "far"],
  },
  {
    id: "uranus_what",
    topic: "uranus",
    question_bn: "ইউরেনাস কেন হেলে ঘোরে?",
    question_en: "Why does Uranus rotate on its side?",
    answer_bn:
      "ইউরেনাস (Uranus) অদ্ভুত — এটা নিজের চারপাশে সোজা না ঘুরে পাশ ফিরে ঘোরে! বিজ্ঞানীরা মনে করেন লম্বা সময় আগে একটা বড় বস্তু ইউরেনাসে ধাক্কা মেরে এটাকে হেলিয়ে দিয়েছিল। ইউরেনাসের এক দিন পৃথিবীর ১৭ ঘণ্টার সমান, কিন্তু এক বছর পৃথিবীর ৮৪ বছরের সমান!",
    answer_en:
      "Uranus is strange — it rotates on its side instead of upright! Scientists think a large object crashed into Uranus long ago, tipping it over. One day on Uranus is 17 Earth hours, but one year is 84 Earth years!",
    source: "NASA Uranus Fact Sheet",
    keywords: ["uranus", "urenas", "ইউরেনাস", "tilt"],
  },
];

/**
 * Story Mode — short, narrative explanations featuring Luna, a friendly Moon kid.
 * Used by the Story (Golper Mohakash) mode.
 */
export const STORIES: { id: string; topic: SpaceTopic; title_bn: string; title_en: string; chapters: { bn: string; en: string }[] }[] = [
  {
    id: "luna_moon",
    topic: "moon",
    title_bn: "লুনা চাঁদে থাকে",
    title_en: "Luna Lives on the Moon",
    chapters: [
      {
        bn: "আমার নাম লুনা। আমি চাঁদে থাকি। হ্যাঁ হ্যাঁ, সত্যি! চাঁদ পৃথিবীর একমাত্র উপগ্রহ, আর আমার বাবা-মা এখানকার একটা ছোট বিজ্ঞান স্টেশনে কাজ করেন।",
        en: "My name is Luna. I live on the Moon. Yes, really! The Moon is Earth's only satellite, and my parents work at a small science station here.",
      },
      {
        bn: "চাঁদে লাফ দিলে আমি পৃথিবীর চেয়ে ৬ গুণ উঁচুতে যাই! কারণ চাঁদের অনুগ্রহ (gravity) কম। একদিন আমি লাফ দিয়ে আমাদের বাড়ির ছাদে উঠে গেলাম — মা রেগে গেলেন!",
        en: "When I jump on the Moon, I go 6 times higher than on Earth! Because the Moon's gravity is weaker. One day I jumped all the way to our roof — Mom was upset!",
      },
      {
        bn: "চাঁদে কোনো বাতাস নেই, কোনো পানি নেই, কোনো গাছ নেই। শুধু ধূসর ধূলো আর পাথর। কিন্তু আকাশ সবসময় কালো — দিনেও! কারণ বাতাস নেই তাই আলো ছড়ায় না।",
        en: "There is no air, no water, no trees on the Moon. Just gray dust and rocks. But the sky is always black — even in daytime! Because there is no air, light doesn't scatter.",
      },
      {
        bn: "পৃথিবী থেকে আমার বন্ধু ফোনে বলে — 'লুনা, চাঁদ আজ পূর্ণিমা!' আমি হাসি। কারণ আমি তো সেখানেই আছি! চাঁদ নিজে আলো দেয় না — সূর্যের আলো চাঁদে পড়ে, আর সেটা আমরা পৃথিবী থেকে দেখি।",
        en: "My friend on Earth calls and says — 'Luna, the Moon is full today!' I laugh. Because I'm on the Moon! The Moon doesn't make its own light — sunlight falls on it, and we see that from Earth.",
      },
    ],
  },
  {
    id: "mars_mia",
    topic: "mars",
    title_bn: "মিয়া মঙ্গলে যায়",
    title_en: "Mia Goes to Mars",
    chapters: [
      {
        bn: "আমি মিয়া। আমি মহাকাশচারী। আজ আমি মঙ্গলে নামলাম — লাল গ্রহে! মহাকাশযান ৭ মাস চলেছে।",
        en: "I am Mia. I am an astronaut. Today I landed on Mars — the Red Planet! My spacecraft traveled for 7 months.",
      },
      {
        bn: "মঙ্গল কেন লাল? কারণ এর মাটিতে আয়রন আছে, যা বাতাসে মরচে ধরে। মরচে লাল হয়, তাই গোটা গ্রহ লাল। আমি পায়ে নিচে নরম লাল ধূলো অনুভব করছি।",
        en: "Why is Mars red? Because its soil has iron, which rusts in the air. Rust is red, so the whole planet is red. I feel soft red dust under my feet.",
      },
      {
        bn: "মঙ্গলে দিন পৃথিবীর মতোই — ২৪ ঘণ্টা ৩৭ মিনিট। কিন্তু রাতে তাপমাত্রা -৬০ ডিগ্রি! আমার স্পেস স্যুট আমাকে গরম রাখে।",
        en: "A day on Mars is like Earth — 24 hours 37 minutes. But at night the temperature is -60°C! My spacesuit keeps me warm.",
      },
      {
        bn: "আমি একটা ছোট রোবট পাঠালাম পাথর খুঁজতে। বিজ্ঞানীরা বলছেন মঙ্গলে আগে পানি ছিল — হয়তো জীবনও! হয়তো একদিন মানুষ এখানে বসবাস করবে।",
        en: "I sent a small robot to find rocks. Scientists say Mars used to have water — maybe life! Maybe one day humans will live here.",
      },
    ],
  },
  {
    id: "sun_story",
    topic: "sun",
    title_bn: "সূর্যের গল্প",
    title_en: "The Story of the Sun",
    chapters: [
      {
        bn: "আমি সূর্য। আমি সৌরজগতের রাজা। আমি ছাড়া কেউ আলো পাবে না, কেউ গরম থাকবে না, কোনো গাছ বাড়বে না।",
        en: "I am the Sun. I am the king of the Solar System. Without me, no one gets light, no one stays warm, no plants grow.",
      },
      {
        bn: "আমি একটা বিশাল গ্যাসের বল — হাইড্রোজেন আর হিলিয়াম দিয়ে তৈরি। ভেতরে আমি ১৫ লক্ষ ডিগ্রি গরম! বাইরে ৫,৫০০ ডিগ্রি।",
        en: "I am a huge ball of gas — made of hydrogen and helium. Inside, I am 15 million degrees hot! Outside, 5,500 degrees.",
      },
      {
        bn: "আমি পৃথিবীর চেয়ে ১০৯ গুণ চওড়া। ভেতরে ১৩ লক্ষ পৃথিবী ঢুকে যাবে। কিন্তু তোমাদের কাছে ছোট দেখাই কারণ অনেক দূরে — ১৫ কোটি কিলোমিটার!",
        en: "I am 109 times wider than Earth. 1.3 million Earths could fit inside me. But I look small to you because I am very far — 150 million km!",
      },
      {
        bn: "আমি ৪৬ শত কোটি বছর ধরে জ্বলছি। আরও ৫০০ কোটি বছর জ্বলব। তারপর আমি বড় হয়ে লাল হয়ে যাব — কিন্তু সেটা অনেক দূরের গল্প।",
        en: "I have been burning for 4.6 billion years. I will burn for another 5 billion. Then I will grow big and turn red — but that is a faraway story.",
      },
    ],
  },
];

/**
 * Quiz mode — auto-generated MCQ structure.
 * The /api/quiz endpoint would generate these from Gemma; for MVP we ship a curated set.
 */
export const QUIZZES: {
  topic: SpaceTopic;
  title_bn: string;
  title_en: string;
  questions: { q_bn: string; q_en: string; options_bn: string[]; options_en: string[]; correct: number; explain_bn: string; explain_en: string }[];
}[] = [
  {
    topic: "moon",
    title_bn: "চাঁদ কুইজ",
    title_en: "Moon Quiz",
    questions: [
      {
        q_bn: "চাঁদ কিসের উপগ্রহ?",
        q_en: "The Moon is a satellite of what?",
        options_bn: ["সূর্য", "পৃথিবী", "মঙ্গল", "বৃহস্পতি"],
        options_en: ["Sun", "Earth", "Mars", "Jupiter"],
        correct: 1,
        explain_bn: "চাঁদ পৃথিবীর একমাত্র প্রাকৃতিক উপগ্রহ।",
        explain_en: "The Moon is Earth's only natural satellite.",
      },
      {
        q_bn: "চাঁদে মানুষ পৃথিবীর চেয়ে কেন বেশি লাফায়?",
        q_en: "Why do people jump higher on the Moon than on Earth?",
        options_bn: ["চাঁদে বাতাস কম", "চাঁদের অনুগ্রহ কম", "চাঁদ ছোট", "চাঁদে পানি নেই"],
        options_en: ["Less air on Moon", "Less gravity on Moon", "Moon is smaller", "No water on Moon"],
        correct: 1,
        explain_bn: "চাঁদের অনুগ্রহ (gravity) পৃথিবীর ৬ ভাগের ১ ভাগ, তাই মানুষ হালকা বোধ করে।",
        explain_en: "The Moon's gravity is 1/6th of Earth's, so people feel lighter.",
      },
      {
        q_bn: "চাঁদ নিজে আলো তৈরি করে?",
        q_en: "Does the Moon make its own light?",
        options_bn: ["হ্যাঁ", "না", "শুধু রাতে", "শুধু পূর্ণিমায়"],
        options_en: ["Yes", "No", "Only at night", "Only on full moon"],
        correct: 1,
        explain_bn: "চাঁদ নিজে আলো তৈরি করে না — সূর্যের আলো চাঁদে পড়ে আর আমরা সেটা দেখি।",
        explain_en: "The Moon doesn't make its own light — sunlight bounces off it.",
      },
      {
        q_bn: "প্রথম চাঁদে পা রাখা মানুষ কে?",
        q_en: "Who first stepped on the Moon?",
        options_bn: ["রাকেশ শর্মা", "নীল আর্মস্ট্রং", "যুরি গ্যাগারিন", "ক্যাল আর্মস্ট্রং"],
        options_en: ["Rakesh Sharma", "Neil Armstrong", "Yuri Gagarin", "Cal Armstrong"],
        correct: 1,
        explain_bn: "নীল আর্মস্ট্রং ১৯৬৯ সালে অ্যাপোলো ১১ মিশনে প্রথম চাঁদে পা রাখেন।",
        explain_en: "Neil Armstrong first stepped on the Moon in 1969 on the Apollo 11 mission.",
      },
      {
        q_bn: "পৃথিবী থেকে চাঁদ কত দূরে?",
        q_en: "How far is the Moon from Earth?",
        options_bn: ["৪ হাজার কিমি", "৪০ হাজার কিমি", "৪ লক্ষ কিমি", "৪০ লক্ষ কিমি"],
        options_en: ["4 thousand km", "40 thousand km", "4 lakh km", "40 lakh km"],
        correct: 2,
        explain_bn: "চাঁদ পৃথিবী থেকে প্রায় ৪ লক্ষ কিলোমিটার দূরে।",
        explain_en: "The Moon is about 4 lakh km (400,000 km) from Earth.",
      },
    ],
  },
  {
    topic: "sun",
    title_bn: "সূর্য কুইজ",
    title_en: "Sun Quiz",
    questions: [
      {
        q_bn: "সূর্য কী দিয়ে তৈরি?",
        q_en: "What is the Sun made of?",
        options_bn: ["পাথর", "গ্যাস", "পানি", "বরফ"],
        options_en: ["Rock", "Gas", "Water", "Ice"],
        correct: 1,
        explain_bn: "সূর্য মূলত হাইড্রোজেন আর হিলিয়াম গ্যাস দিয়ে তৈরি।",
        explain_en: "The Sun is mostly made of hydrogen and helium gas.",
      },
      {
        q_bn: "সূর্য পৃথিবীর চেয়ে কত গুণ বড়?",
        q_en: "How many times wider is the Sun than Earth?",
        options_bn: ["১০ গুণ", "৫০ গুণ", "১০৯ গুণ", "১০০০ গুণ"],
        options_en: ["10 times", "50 times", "109 times", "1000 times"],
        correct: 2,
        explain_bn: "সূর্য পৃথিবীর চেয়ে প্রায় ১০৯ গুণ চওড়া।",
        explain_en: "The Sun is about 109 times wider than Earth.",
      },
      {
        q_bn: "সূর্যের ভেতরের তাপমাত্রা কত?",
        q_en: "What is the temperature inside the Sun?",
        options_bn: ["৫,৫০০ ডিগ্রি", "১ লক্ষ ডিগ্রি", "১৫ লক্ষ ডিগ্রি", "১ কোটি ডিগ্রি"],
        options_en: ["5,500 degrees", "1 lakh degrees", "15 lakh degrees", "1 crore degrees"],
        correct: 2,
        explain_bn: "সূর্যের ভেতরের তাপমাত্রা প্রায় ১৫ লক্ষ ডিগ্রি সেলসিয়াস!",
        explain_en: "The Sun's internal temperature is about 15 million degrees Celsius!",
      },
      {
        q_bn: "সূর্য কোন গ্রহের কেন্দ্রে আছে?",
        q_en: "What is at the center of the Solar System?",
        options_bn: ["পৃথিবী", "চাঁদ", "সূর্য", "বৃহস্পতি"],
        options_en: ["Earth", "Moon", "Sun", "Jupiter"],
        correct: 2,
        explain_bn: "সূর্য সৌরজগতের কেন্দ্রে আছে, সব গ্রহ তার চারপাশে ঘোরে।",
        explain_en: "The Sun is at the center of the Solar System, all planets orbit it.",
      },
    ],
  },
  {
    topic: "mars",
    title_bn: "মঙ্গল কুইজ",
    title_en: "Mars Quiz",
    questions: [
      {
        q_bn: "মঙ্গলকে কী বলা হয়?",
        q_en: "What is Mars called?",
        options_bn: ["নীল গ্রহ", "লাল গ্রহ", "সবুজ গ্রহ", "সাদা গ্রহ"],
        options_en: ["Blue Planet", "Red Planet", "Green Planet", "White Planet"],
        correct: 1,
        explain_bn: "মঙ্গলের মাটিতে আয়রন থাকায় মরচে ধরে লাল দেখায় — তাই 'লাল গ্রহ'।",
        explain_en: "Mars has iron in soil that rusts red — so it's the 'Red Planet'.",
      },
      {
        q_bn: "মঙ্গল সৌরজগতের কত নম্বর গ্রহ?",
        q_en: "Which planet number is Mars?",
        options_bn: ["২য়", "৩য়", "৪র্থ", "৫ম"],
        options_en: ["2nd", "3rd", "4th", "5th"],
        correct: 2,
        explain_bn: "মঙ্গল সূর্য থেকে দূরের দিকে ৪র্থ গ্রহ।",
        explain_en: "Mars is the 4th planet from the Sun.",
      },
      {
        q_bn: "মঙ্গলে কি জীবন পাওয়া গেছে?",
        q_en: "Has life been found on Mars?",
        options_bn: ["হ্যাঁ", "না", "শুধু গাছ", "শুধু পোকা"],
        options_en: ["Yes", "No", "Only plants", "Only insects"],
        correct: 1,
        explain_bn: "এখনো মঙ্গলে জীবন পাওয়া যায়নি, তবে বিজ্ঞানীরা খুঁজছেন।",
        explain_en: "No life has been found on Mars yet, but scientists are searching.",
      },
    ],
  },
  {
    topic: "black_hole",
    title_bn: "কৃষ্ণ গহ্বর কুইজ",
    title_en: "Black Hole Quiz",
    questions: [
      {
        q_bn: "কৃষ্ণ গহ্বর থেকে কী বের হতে পারে?",
        q_en: "What can escape from a black hole?",
        options_bn: ["আলো", "কিছুই না", "শব্দ", "বাতাস"],
        options_en: ["Light", "Nothing", "Sound", "Air"],
        correct: 1,
        explain_bn: "কৃষ্ণ গহ্বরের অনুগ্রহ এত শক্তিশালী যে কিছুই বের হতে পারে না — এমনকি আলোও।",
        explain_en: "A black hole's gravity is so strong that nothing can escape — not even light.",
      },
      {
        q_bn: "কৃষ্ণ গহ্বর কীভাবে তৈরি হয়?",
        q_en: "How does a black hole form?",
        options_bn: ["চাঁদ মরে গেলে", "বড় নক্ষত্র ধসে গেলে", "গ্রহ ফেটে গেলে", "রকেট পড়ে"],
        options_en: ["Moon dies", "Big star collapses", "Planet explodes", "Rocket crashes"],
        correct: 1,
        explain_bn: "বিশাল নক্ষত্র মারা গেলে নিজের ভেতরে ধসে কৃষ্ণ গহ্বর তৈরি হয়।",
        explain_en: "When a huge star dies and collapses, a black hole forms.",
      },
    ],
  },
];

/** Simulated streaming responses for Ask mode fallback when question not in corpus. */
export function fallbackAnswer(question: string, lang: "bn" | "en"): string {
  if (lang === "bn") {
    return `এটা চমৎকার প্রশ্ন! "${question}" — আমি এই বিষয়ে আরও শিখতে চাই। আমার বন্ধু গেমা এখনো সব বিষয়ে শেখেনি, কিন্তু আমরা দ্রুত শিখছি। চলো অন্য প্রশ্ন চেষ্টা করি — যেমন "কৃষ্ণ গহ্বর কী?", "চাঁদ কেন আকার বদলায়?", বা "সূর্য কত বড়?"`;
  }
  return `That's a great question! "${question}" — I'd love to learn more about this. My friend Gemma is still learning about all topics, but we're getting better fast. Let's try another question — like "What is a black hole?", "Why does the Moon change shape?", or "How big is the Sun?"`;
}
