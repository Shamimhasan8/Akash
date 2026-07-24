# AKASH — GitHub & Vercel Deployment Guide

> Bengali Space Tutor for Kids · Powered by `google/gemma-4-12b-it` via Hugging Face Inference API

---

## 1. Push to GitHub

### Step 1 — Create a new GitHub repository
1. Go to https://github.com/new
2. Repository name: `akash-bangla-space-tutor` (or whatever you prefer)
3. Set to **Public** (required for Kaggle hackathon judges to view code)
4. **Do NOT** initialize with a README (your code already has one)
5. Click **Create repository**

### Step 2 — Initialize git and push
Run these commands in your project folder:

```bash
cd C:\Users\Adil\Downloads\AKASH

git init
git add .
git commit -m "Initial commit: AKASH Bengali Space Tutor — Build with Gemma 2026"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/akash-bangla-space-tutor.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 2. Add GitHub Secret: `HF_TOKEN`

Your Hugging Face token must be stored as a **GitHub Secret** so CI/CD can build the project and Vercel can use it at runtime.

1. Open your repository on GitHub
2. Go to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `HF_TOKEN`
5. Value: `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`
6. Click **Add secret**

> ⚠️ **Security**: Never put the raw token in your code or commit it to git.  
> The `.env` file is in `.gitignore` so it will never be pushed.

---

## 3. Deploy to Vercel

### Option A — Vercel Dashboard (easiest)

1. Go to https://vercel.com/new
2. Click **Import Git Repository** → select your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. **Add Environment Variables** (before deploying):

| Variable | Value |
|---|---|
| `HF_TOKEN` | `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` |
| `HF_MODEL` | `google/gemma-4-12b-it` |
| `HF_PROVIDER` | `auto` |
| `AKASH_USE_LIVE_MODEL` | `true` |
| `AKASH_REQUEST_TIMEOUT_MS` | `60000` |
| `AKASH_MAX_TOKENS` | `300` |
| `AKASH_TEMPERATURE` | `0.7` |
| `AKASH_ENABLE_CACHE` | `true` |
| `DATABASE_URL` | `file:./dev.db` |

5. Click **Deploy**

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

When prompted, link to the GitHub repo and paste the environment variables.

---

## 4. Verify deployment

After deploy, check these URLs:

```
https://your-app.vercel.app/
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/ask   (POST)
```

The `/api/health` endpoint should return:
```json
{
  "status": "ok",
  "ok": true,
  "model": "google/gemma-4-12b-it",
  "tokenConfigured": true
}
```

---

## 5. Important Notes

### Hugging Face model access
- You must have **accepted the Gemma license** at:  
  https://huggingface.co/google/gemma-4-12b-it
- The token needs **READ** scope only

### API timeouts
- `vercel.json` sets `maxDuration: 60` for all AI routes
- Hugging Face cold starts can take 30–60 seconds on first call
- Subsequent calls use the in-memory LRU cache and are much faster

### Fallback behavior
When the live HF model is unavailable (rate-limit, cold start timeout), the API automatically falls back to the curated answer library (`src/lib/curated.ts`), so the app always returns a response.

### SQLite / Prisma
The Prisma DB is not used by any AI route. `DATABASE_URL` must be set to pass the build, but it doesn't need to point to a real database.

---

## 6. Project Architecture

```
AKASH (Next.js 16 App Router)
├── src/app/
│   ├── page.tsx          ← Main UI (4 modes: Ask / Story / Quiz / Star Map)
│   └── api/
│       ├── ask/          ← POST /api/ask  → Gemma Q&A in Bangla
│       ├── story/        ← POST /api/story → Space stories for kids
│       ├── quiz/         ← POST /api/quiz  → Space quiz questions
│       └── health/       ← GET  /api/health → Uptime check
├── src/lib/
│   ├── huggingface.ts    ← HF Inference API client (retries, cache, timeout)
│   ├── curated.ts        ← Offline fallback answer library
│   └── akash-data.ts     ← Bilingual space knowledge corpus
├── src/components/akash/ ← UI: AskMode, StoryMode, QuizMode, StarMap
├── vercel.json           ← Vercel config (maxDuration for AI routes)
└── .github/workflows/ci.yml ← GitHub Actions CI (build check)
```

---

## 7. Kaggle Notebook

The notebook `gemma-unified-notebook-1.ipynb` demonstrates:
1. **Synthetic Q&A generation** — Gemma generates Bangla space Q&A pairs
2. **Bangla translation** — NASA facts translated via Gemma
3. **Self-evaluation** — Gemma scores its outputs for kid-friendliness

This notebook proves 100% Gemma compliance — no other LLMs used.
