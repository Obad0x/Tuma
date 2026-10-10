/// Request hardening helpers for state-changing API routes.

/// Rejects cross-site POSTs (CSRF defense-in-depth on top of SameSite cookies).
/// Allows same-origin browser requests and server-to-server calls with no Origin.
export function isSameOrigin(request: Request): boolean {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return true;
}

import { createHash, timingSafeEqual } from "node:crypto";

/// Compares a provided secret in constant time (hashes first so length is not leaked).
export function secretMatches(provided: string | null, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/// Best-effort client IP (Vercel/most proxies set x-forwarded-for).
export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

const memoryHits = new Map<string, number[]>();

/// Small in-memory limiter used as a fallback when no database is configured.
export function memoryRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (memoryHits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  memoryHits.set(key, recent);
  return recent.length > limit;
}
