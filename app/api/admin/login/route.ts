import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_SESSION_MS, createAdminSession } from "@/lib/admin-auth";
import { clientIp, isSameOrigin, memoryRateLimited, secretMatches } from "@/lib/http";
import { isRateLimited } from "@/lib/ledger";

export const runtime = "nodejs";

/// Exchange the admin secret for a short-lived, signed httpOnly console cookie.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const ip = clientIp(request);
  if ((await isRateLimited(`admin-login:${ip}`, 5, 300)) || memoryRateLimited(`admin-login:${ip}`, 5, 300_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { secret?: unknown };
  const secret = typeof body.secret === "string" ? body.secret : null;
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !secretMatches(secret, expected)) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 401 });
  }

  (await cookies()).set(ADMIN_COOKIE, createAdminSession(expected), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MS / 1000,
  });
  return NextResponse.json({ ok: true });
}
