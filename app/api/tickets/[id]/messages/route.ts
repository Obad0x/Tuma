import { NextResponse } from "next/server";
import { TicketAuthor } from "@prisma/client";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import { isSameOrigin } from "@/lib/http";
import { upsertUser } from "@/lib/ledger";
import { addTicketMessage, getTicket } from "@/lib/tickets";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: RouteContext<"/api/tickets/[id]/messages">) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  if (!dbEnabled) {
    return NextResponse.json({ error: "Support is unavailable right now." }, { status: 503 });
  }

  const session = await auth();
  const user = session?.user;
  if (!user?.xUserId || !user.username) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }
  const userId = await upsertUser({
    xUserId: user.xUserId,
    username: user.username,
    name: user.name ?? null,
    image: user.image ?? null,
  });

  const { id } = await ctx.params;
  const ticket = await getTicket(id);
  if (!ticket || ticket.userId !== userId) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { body?: unknown };
  const text = String(body.body ?? "").trim().slice(0, 4000);
  if (!text) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const message = await addTicketMessage(id, TicketAuthor.USER, text);
  return NextResponse.json({ message });
}
