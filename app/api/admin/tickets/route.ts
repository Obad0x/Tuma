import { NextResponse } from "next/server";
import { TicketAuthor, TicketStatus } from "@prisma/client";
import { isAdminRequest } from "@/lib/admin-auth";
import { dbEnabled } from "@/lib/db";
import { isSameOrigin } from "@/lib/http";
import { addTicketMessage, getTicket, listAllTickets, setTicketStatus } from "@/lib/tickets";

export const runtime = "nodejs";

/// Admin API for the console (and future admin subdomain).
export async function GET(request: Request) {
  if (!dbEnabled) return NextResponse.json({ tickets: [] });
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ tickets: await listAllTickets() });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  if (!dbEnabled) {
    return NextResponse.json({ error: "No database configured." }, { status: 503 });
  }
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    id?: unknown;
    status?: unknown;
    message?: unknown;
  };
  const id = typeof body.id === "string" ? body.id : "";
  const status = typeof body.status === "string" ? body.status : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";
  const validStatus = ["OPEN", "PENDING", "CLOSED"].includes(status);
  if (!id || (!message && !validStatus)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (message) {
    const ticket = await getTicket(id);
    if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    // An admin message moves the ticket to PENDING; an explicit status below wins.
    await addTicketMessage(id, TicketAuthor.ADMIN, message);
  }
  if (validStatus) await setTicketStatus(id, status as TicketStatus);

  return NextResponse.json({ ok: true });
}
