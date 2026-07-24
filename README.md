# AKASH — Bengali Space Tutor for Kids

> Built with Gemma · Kaggle Build with Gemma hackathon · 2026
> Backend: Next.js 16 → Hugging Face Inference API → google/gemma-4-12b-it
> Frontend: Next.js 16 + Tailwind 4 + shadcn/ui (Midnight Cosmos theme)

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   # or: npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env and set HF_TOKEN to your real Hugging Face token
   # Get token from: https://huggingface.co/settings/tokens (READ access)
   # Accept Gemma license: https://huggingface.co/google/gemma-4-12b-it
   ```

3. Run the dev server:
   ```bash
   bun run dev
   # Open http://localhost:3000
   ```

4. Verify the backend:
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"ok","ok":true,...}
   ```

## Deploy

See DEPLOYMENT.md (in the parent download/ folder) for full Vercel + HF Spaces
deployment instructions.

## What's Inside

- `src/app/` — Next.js App Router (pages + API routes)
- `src/app/api/ask|story|quiz|health/` — Backend endpoints calling Gemma
- `src/components/akash/` — UI components for the 4 modes (Ask/Story/Quiz/StarMap)
- `src/lib/huggingface.ts` — HF Inference API client with retries + cache
- `src/lib/curated.ts` — Curated fallback library (when HF is down)
- `src/lib/akash-data.ts` — Bilingual Bangla/English space corpus
- `public/` — Static assets + PWA manifest

## 100% Gemma Compliance

No Gemini, no NLLB, no external LLMs. Only `google/gemma-4-12b-it` is used for
all AI calls (synthesis, fine-tuning, evaluation — see the 3 Kaggle notebooks).

Built with ❤️ by the AKASH Team · Mohakasher Golpo, Banglay Shikhi
