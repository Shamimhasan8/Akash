/**
 * AKASH — /api/health endpoint
 *
 * GET /api/health
 * Returns the current health of the AKASH backend:
 *  - HF API connectivity (live model reachable?)
 *  - Token configured?
 *  - Cache size?
 *  - Current model + config
 *
 * Used by:
 *  - Deployment platforms (Vercel, HF Spaces) for uptime checks
 *  - The writeup's "is the demo alive?" link
 *  - Manual debugging during the 48-hour sprint
 */

import { NextResponse } from "next/server";
import { checkHealth, getConfig } from "@/lib/huggingface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getConfig();
  const startMs = Date.now();

  // Skip live health check if no token configured (avoid slow timeout)
  if (!config.tokenConfigured) {
    return NextResponse.json(
      {
        status: "degraded",
        ok: false,
        reason: "HF_TOKEN not configured",
        config,
        latencyMs: Date.now() - startMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  // Run live health check (with 15s timeout)
  const health = await checkHealth();

  const status = health.ok ? "ok" : "degraded";
  const statusCode = health.ok ? 200 : 503;

  return NextResponse.json(
    {
      status,
      ok: health.ok,
      ...health,
      latencyMs: Date.now() - startMs,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
