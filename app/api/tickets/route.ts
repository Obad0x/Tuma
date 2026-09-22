import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import { isSameOrigin } from "@/lib/http";
import { upsertUser } from "@/lib/ledger";
import { createTicket, listTicketsForUser } from "@/lib/tickets";

export const runtime = "nodejs";

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.xUserId || !user.username) return null;
  return upsertUser({
    xUserId: user.xUserId,
    username: user.username,
    name: user.name ?? null,
    image: user.image ?? null,
  });
}

export async function GET() {
  if (!dbEnabled) return NextResponse.json({ tickets: [] });
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  return NextResponse.json({ tickets: await listTicketsForUser(userId) });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  if (!dbEnabled) {
    return NextResponse.json({ error: "Support is unavailable right now." }, { status: 503 });
  }
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const subject = String(body.subject ?? "").trim().slice(0, 120);
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const category = String(body.category ?? "general").slice(0, 40);
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const ticket = await createTicket({ userId, subject, category, body: message });
  return NextResponse.json({ id: ticket?.id });
}
