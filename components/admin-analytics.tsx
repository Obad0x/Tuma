import type { AdminAnalytics, RankedItem } from "@/lib/admin-analytics";

const card = "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900";
const label = "text-xs uppercase tracking-wide text-zinc-500";

function Stat({ name, value, hint }: { name: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <p className={label}>{name}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}

function usdc(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`;
}

function Ranked({ title, items, address }: { title: string; items: RankedItem[]; address?: boolean }) {
  return (
    <div className={card}>
      <h3 className={`mb-3 ${label}`}>{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No data yet.</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-3">
              <span className={address ? "truncate font-mono text-xs" : "truncate"}>
                {address ? `${item.label.slice(0, 10)}…${item.label.slice(-4)}` : `@${item.label}`}
              </span>
              <span className="shrink-0 text-zinc-500">
                {item.count} · {usdc(item.volumeUsdc)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminAnalyticsPanel({
  analytics,
  source,
}: {
  analytics: AdminAnalytics | null;
  source?: string | null;
}) {
  if (!analytics) {
    return (
      <div className={card}>
        <h2 className={`mb-2 ${label}`}>Analytics</h2>
        <p className="text-sm text-zinc-500">
          No database configured{source ? ` (seen: ${source})` : ""}. Users, trends and ticket stats
          need Postgres.
        </p>
      </div>
    );
  }

  const maxDaily = Math.max(1, ...analytics.daily.map((point) => point.payments));

  return (
    <div className="space-y-6">
      <div className={card}>
        <h2 className={`mb-3 ${label}`}>Users</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat name="Total users" value={String(analytics.users.total)} />
          <Stat name="New (7d)" value={String(analytics.users.new7d)} />
          <Stat name="New (30d)" value={String(analytics.users.new30d)} />
          <Stat name="Active (30d)" value={String(analytics.users.active30d)} hint="sent a payment" />
        </div>
      </div>

      <div className={card}>
        <h2 className={`mb-3 ${label}`}>Payments (database)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat name="Total" value={String(analytics.payments.total)} />
          <Stat name="Open" value={String(analytics.payments.open)} />
          <Stat name="Claimed" value={String(analytics.payments.claimed)} />
          <Stat name="Refunded" value={String(analytics.payments.refunded)} />
          <Stat name="Volume" value={usdc(analytics.payments.volumeUsdc)} />
          <Stat name="Average" value={usdc(analytics.payments.avgUsdc)} />
        </div>
      </div>

      <div className={card}>
        <h2 className={`mb-3 ${label}`}>Tickets</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat name="Total" value={String(analytics.tickets.total)} />
          <Stat name="Open" value={String(analytics.tickets.open)} />
          <Stat name="Pending" value={String(analytics.tickets.pending)} />
          <Stat name="Closed" value={String(analytics.tickets.closed)} />
        </div>
      </div>

      <div className={card}>
        <h2 className={`mb-4 ${label}`}>Last 14 days</h2>
        <div className="flex h-32 items-end gap-1.5">
          {analytics.daily.map((point) => (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-zinc-800 dark:bg-zinc-200"
                style={{ height: `${Math.max(2, (point.payments / maxDaily) * 100)}%` }}
                title={`${point.date}: ${point.payments} payments, ${usdc(point.volumeUsdc)}, ${point.users} new users`}
              />
              <span className="text-[10px] text-zinc-400">{point.date.slice(3)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Bars = payments per day (hover for volume and new users).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Ranked title="Top recipient handles" items={analytics.topHandles} />
        <Ranked title="Top senders" items={analytics.topSenders} address />
      </div>

      <div className={card}>
        <h2 className={`mb-3 ${label}`}>Why people are sending (notes)</h2>
        {analytics.notes.length === 0 ? (
          <p className="text-sm text-zinc-500">No notes recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {analytics.notes.map((item, index) => (
              <li key={`${item.handle}-${index}`} className="flex flex-col gap-0.5">
                <span className="text-zinc-500">
                  @{item.handle} · {new Date(item.createdAt).toLocaleDateString("en-US")}
                </span>
                <span>“{item.note}”</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
