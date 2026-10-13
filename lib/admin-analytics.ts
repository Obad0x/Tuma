import { getDb } from "./db";

/// Aggregated, database-backed analytics for the admin console. Returns null when
/// no database is configured. Everything is computed in JS from a few narrow
/// queries so it also works on hosts without raw-SQL aggregate support.

export type DailyPoint = { date: string; payments: number; volumeUsdc: number; users: number };
export type RankedItem = { label: string; count: number; volumeUsdc: number };
export type NoteItem = { handle: string; note: string; createdAt: string };

export type AdminAnalytics = {
  users: { total: number; new7d: number; new30d: number; active30d: number };
  payments: {
    total: number;
    open: number;
    claimed: number;
    refunded: number;
    volumeUsdc: number;
    avgUsdc: number;
  };
  tickets: { total: number; open: number; pending: number; closed: number };
  daily: DailyPoint[];
  topHandles: RankedItem[];
  topSenders: RankedItem[];
  notes: NoteItem[];
};

const DAY = 86_400_000;
const TREND_DAYS = 14;

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dayStart(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function tally(rows: Array<{ key: string; amount: number }>): RankedItem[] {
  const grouped = new Map<string, { count: number; volumeUsdc: number }>();
  for (const row of rows) {
    if (!row.key) continue;
    const current = grouped.get(row.key) ?? { count: 0, volumeUsdc: 0 };
    current.count += 1;
    current.volumeUsdc += row.amount;
    grouped.set(row.key, current);
  }
  return [...grouped.entries()]
    .map(([label, value]) => ({ label, ...value }))
    .sort((a, b) => b.count - a.count || b.volumeUsdc - a.volumeUsdc)
    .slice(0, 8);
}

export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
  const db = getDb();
  if (!db) return null;

  const [users, payments, tickets] = await Promise.all([
    db.user.findMany({ select: { id: true, createdAt: true } }),
    db.payment.findMany({
      select: {
        handle: true,
        sender: true,
        amountUsdc: true,
        status: true,
        note: true,
        userId: true,
        createdAt: true,
      },
    }),
    db.ticket.findMany({ select: { status: true } }),
  ]);

  const now = Date.now();
  const cutoff7 = now - 7 * DAY;
  const cutoff30 = now - 30 * DAY;

  const volumeUsdc = payments.reduce((sum, payment) => sum + toNumber(payment.amountUsdc), 0);

  const buckets = new Map<number, DailyPoint>();
  for (let offset = TREND_DAYS - 1; offset >= 0; offset--) {
    const key = dayStart(now - offset * DAY);
    buckets.set(key, {
      date: new Date(key).toISOString().slice(5, 10),
      payments: 0,
      volumeUsdc: 0,
      users: 0,
    });
  }
  for (const payment of payments) {
    const bucket = buckets.get(dayStart(payment.createdAt.getTime()));
    if (bucket) {
      bucket.payments += 1;
      bucket.volumeUsdc += toNumber(payment.amountUsdc);
    }
  }
  for (const user of users) {
    const bucket = buckets.get(dayStart(user.createdAt.getTime()));
    if (bucket) bucket.users += 1;
  }

  const notes = payments
    .filter((payment) => payment.note?.trim())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
    .map((payment) => ({
      handle: payment.handle,
      note: payment.note!.trim(),
      createdAt: payment.createdAt.toISOString(),
    }));

  const ticketCount = (status: string) => tickets.filter((ticket) => ticket.status === status).length;
  const active30d = new Set(
    payments
      .filter((payment) => payment.userId && payment.createdAt.getTime() >= cutoff30)
      .map((payment) => payment.userId),
  ).size;

  return {
    users: {
      total: users.length,
      new7d: users.filter((user) => user.createdAt.getTime() >= cutoff7).length,
      new30d: users.filter((user) => user.createdAt.getTime() >= cutoff30).length,
      active30d,
    },
    payments: {
      total: payments.length,
      open: payments.filter((payment) => payment.status === "OPEN").length,
      claimed: payments.filter((payment) => payment.status === "CLAIMED").length,
      refunded: payments.filter((payment) => payment.status === "REFUNDED").length,
      volumeUsdc,
      avgUsdc: payments.length > 0 ? volumeUsdc / payments.length : 0,
    },
    tickets: {
      total: tickets.length,
      open: ticketCount("OPEN"),
      pending: ticketCount("PENDING"),
      closed: ticketCount("CLOSED"),
    },
    daily: [...buckets.values()],
    topHandles: tally(
      payments.map((payment) => ({ key: payment.handle, amount: toNumber(payment.amountUsdc) })),
    ),
    topSenders: tally(
      payments.map((payment) => ({ key: payment.sender, amount: toNumber(payment.amountUsdc) })),
    ),
    notes,
  };
}
