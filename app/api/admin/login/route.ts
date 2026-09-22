import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { isSameOrigin, secretMatches } from "@/lib/http";

export const runtime = "nodejs";

/// Exchange the admin secret for a short-lived httpOnly console cookie.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { secret?: unknown };
  const secret = typeof body.secret === "string" ? body.secret : null;
  if (!secretMatches(secret, process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, secret as string, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return NextResponse.json({ ok: true });
}
