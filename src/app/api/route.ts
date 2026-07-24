import { NextResponse } from "next/server";
import { getConfig } from "@/lib/huggingface";

export const runtime = "nodejs";

export async function GET() {
  const config = getConfig();
  return NextResponse.json({
    name: "AKASH API",
    version: "1.0.0",
    description: "Bengali Space Tutor for Kids — Backend API",
    endpoints: {
      "/api/ask": "POST — Ask AKASH a space question in Bangla or English",
      "/api/story": "POST — Get a story about a space topic",
      "/api/quiz": "POST — Get a 5-question quiz about a space topic",
      "/api/health": "GET — Health check (HF API reachable, token configured, cache size)",
    },
    config: {
      model: config.model,
      liveModelEnabled: config.liveModelEnabled,
      cacheEnabled: config.cacheEnabled,
      tokenConfigured: config.tokenConfigured,
    },
    docs: "Visit /api/ask, /api/story, /api/quiz, or /api/health via GET for endpoint-specific docs.",
  });
}
