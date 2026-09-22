import { NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/// Machine-readable health check (same checks as /status). Handy for debugging
/// a deployment: `curl https://<app>/api/health`.
export async function GET() {
  const checks = await getSystemStatus();
  const ok = checks.every((check) => check.status === "operational");
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
