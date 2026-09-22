import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import { isSameOrigin } from "@/lib/http";
import { getSettings, upsertSettings, upsertUser } from "@/lib/ledger";

export const runtime = "nodejs";

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.xUserId || !user.username || !dbEnabled) return null;
  return upsertUser({
    xUserId: user.xUserId,
    username: user.username,
    name: user.name ?? null,
    image: user.image ?? null,
  });
}

export async function GET() {
  if (!dbEnabled) return NextResponse.json({ settings: null });
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ settings: null });
  return NextResponse.json({ settings: await getSettings(userId) });
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  if (!dbEnabled) return NextResponse.json({ persisted: false });
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const bool = (v: unknown) => (typeof v === "boolean" ? v : undefined);

  const patch: Record<string, unknown> = {};
  const displayName = str(body.displayName, 80);
  const bio = str(body.bio, 160);
  const currency = str(body.currency, 8);
  const avatar = str(body.avatar, 500);
  const visibility = str(body.visibility, 20);
  if (displayName !== undefined) patch.displayName = displayName;
  if (bio !== undefined) patch.bio = bio;
  if (currency !== undefined) patch.currency = currency;
  if (avatar !== undefined) patch.avatar = avatar;
  if (visibility !== undefined) patch.visibility = visibility;
  for (const key of ["notifications", "companion", "notifySecurity", "discoverable", "directorySearch"]) {
    const value = bool(body[key]);
    if (value !== undefined) patch[key] = value;
  }

  await upsertSettings(userId, patch);
  return NextResponse.json({ persisted: true });
}
