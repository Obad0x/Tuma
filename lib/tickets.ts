import { TicketAuthor, TicketStatus } from "@prisma/client";
import { getDb } from "./db";

export async function createTicket(input: {
  userId?: string | null;
  email?: string | null;
  subject: string;
  category?: string;
  body: string;
}) {
  const db = getDb();
  if (!db) return null;
  return db.ticket.create({
    data: {
      userId: input.userId ?? undefined,
      email: input.email ?? null,
      subject: input.subject,
      category: input.category ?? "general",
      messages: { create: { author: TicketAuthor.USER, body: input.body } },
    },
  });
}

export async function listTicketsForUser(userId: string) {
  const db = getDb();
  if (!db) return [];
  return db.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getTicket(id: string) {
  const db = getDb();
  if (!db) return null;
  return db.ticket.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } }, user: true },
  });
}

/// Adds a message; a user reply reopens the ticket, an admin reply marks it pending.
export async function addTicketMessage(
  ticketId: string,
  author: TicketAuthor,
  body: string,
) {
  const db = getDb();
  if (!db) return null;
  const [message] = await db.$transaction([
    db.ticketMessage.create({ data: { ticketId, author, body } }),
    db.ticket.update({
      where: { id: ticketId },
      data: { status: author === "ADMIN" ? TicketStatus.PENDING : TicketStatus.OPEN },
    }),
  ]);
  return message;
}

export async function listAllTickets() {
  const db = getDb();
  if (!db) return [];
  return db.ticket.findMany({
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } }, user: true },
  });
}

export async function setTicketStatus(id: string, status: TicketStatus) {
  const db = getDb();
  if (!db) return null;
  return db.ticket.update({ where: { id }, data: { status } }).catch(() => null);
}
