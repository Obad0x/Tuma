"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type Message = { id: string; author: "USER" | "ADMIN"; body: string; createdAt: string };
type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: "OPEN" | "PENDING" | "CLOSED";
  email: string | null;
  createdAt: string;
  updatedAt: string;
  user: { username: string; name: string | null } | null;
  messages: Message[];
};

const card = "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900";
const label = "text-xs uppercase tracking-wide text-zinc-500";
const input =
  "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";
const primary =
  "rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";
const secondary =
  "rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800";

const STATUS_CLASS: Record<Ticket["status"], string> = {
  OPEN: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  CLOSED: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200",
};

export function AdminTickets() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isFetching, error: queryError } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as { tickets?: Ticket[]; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not load tickets.");
      return body.tickets ?? [];
    },
  });

  const tickets = data ?? [];
  const displayError = error ?? (queryError instanceof Error ? queryError.message : null);

  async function update(id: string, patch: { message?: string; status?: string }) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not update the ticket.");
        return;
      }
      if (patch.message) setReplies((current) => ({ ...current, [id]: "" }));
      await queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    } catch {
      setError("Could not update the ticket.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={card}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className={label}>Support tickets ({tickets.length})</h2>
        <button
          onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin-tickets"] })}
          className={secondary}
          disabled={isFetching}
        >
          {isFetching ? "Loading…" : "Refresh"}
        </button>
      </div>

      {displayError ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{displayError}</p> : null}

      {!isFetching && tickets.length === 0 ? (
        <p className="text-sm text-zinc-500">No tickets yet.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="text-xs text-zinc-500">
                    {ticket.user ? `@${ticket.user.username}` : ticket.email ?? "anonymous"} ·{" "}
                    {ticket.category} · {new Date(ticket.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[ticket.status]}`}>
                  {ticket.status}
                </span>
              </div>

              <ul className="mt-3 space-y-2">
                {ticket.messages.map((message) => (
                  <li
                    key={message.id}
                    className={`rounded-lg p-2 text-sm ${
                      message.author === "ADMIN"
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "bg-zinc-50 dark:bg-zinc-900"
                    }`}
                  >
                    <p className="text-xs font-semibold text-zinc-500">
                      {message.author} · {new Date(message.createdAt).toLocaleString("en-US")}
                    </p>
                    <p className="whitespace-pre-wrap">{message.body}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={replies[ticket.id] ?? ""}
                  onChange={(event) =>
                    setReplies((current) => ({ ...current, [ticket.id]: event.target.value }))
                  }
                  placeholder="Reply to the customer…"
                  className={`${input} flex-1`}
                />
                <button
                  onClick={() => void update(ticket.id, { message: replies[ticket.id] ?? "" })}
                  disabled={busy === ticket.id || !(replies[ticket.id] ?? "").trim()}
                  className={primary}
                >
                  Send reply
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {(["OPEN", "PENDING", "CLOSED"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => void update(ticket.id, { status })}
                    disabled={busy === ticket.id || ticket.status === status}
                    className={secondary}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
