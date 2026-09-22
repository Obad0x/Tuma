"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { signIn, useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { AppShell } from "./app-shell";

type TicketMessage = { id: string; author: "USER" | "ADMIN"; body: string; createdAt: string };
type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: "OPEN" | "PENDING" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

const CATEGORIES = ["general", "payment", "claim", "refund", "wallet", "account"];

const STATUS_STYLE: Record<Ticket["status"], string> = {
  OPEN: "bg-sky-50 text-sky-700",
  PENDING: "bg-amber-50 text-amber-700",
  CLOSED: "bg-surface-container-high text-on-surface-variant",
};

export function SupportView() {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const { data } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets");
      if (!res.ok) return { tickets: [] as Ticket[] };
      return (await res.json()) as { tickets: Ticket[] };
    },
    enabled: status === "authenticated",
  });

  const tickets = data?.tickets ?? [];

  async function create(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, message }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not create ticket.");
        return;
      }
      setSubject("");
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(ticketId: string) {
    if (!reply.trim()) return;
    await fetch(`/api/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    setReply("");
    await queryClient.invalidateQueries({ queryKey: ["tickets"] });
  }

  return (
    <AppShell active="support">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Support</h1>
          <p className="text-sm text-on-surface-variant">
            Open a ticket and our team will reply. Track the status here.
          </p>
        </div>

        {status === "loading" ? (
          <p className="text-sm text-on-surface-variant">Checking your session…</p>
        ) : status !== "authenticated" ? (
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 sm:flex-row sm:items-center">
            <p className="text-sm text-on-surface">Sign in with X to open a support ticket.</p>
            <button
              onClick={() => signIn("twitter")}
              className="rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary"
            >
              Sign in with 𝕏
            </button>
          </div>
        ) : (
          <>
            <form
              onSubmit={create}
              className="flex flex-col gap-4 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface">Subject</span>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    maxLength={120}
                    placeholder="Brief summary"
                    className="rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface">Category</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none"
                  >
                    {CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-on-surface">How can we help?</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={4000}
                  rows={4}
                  placeholder="Describe the issue, include a payment id if relevant."
                  className="resize-none rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none"
                />
              </label>
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
              <button
                type="submit"
                disabled={busy || !subject.trim() || !message.trim()}
                className="self-end rounded-full bg-primary-container px-5 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit ticket"}
              </button>
            </form>

            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                Your tickets
              </span>
              {tickets.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No tickets yet.</p>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5"
                  >
                    <button
                      onClick={() => setOpenId(openId === ticket.id ? null : ticket.id)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <div>
                        <p className="font-semibold text-on-surface">{ticket.subject}</p>
                        <p className="text-xs text-on-surface-variant">
                          {ticket.category} · {new Date(ticket.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </button>

                    {openId === ticket.id ? (
                      <div className="mt-4 flex flex-col gap-3 border-t border-surface-container pt-4">
                        {ticket.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-xl p-3 text-sm ${
                              msg.author === "ADMIN"
                                ? "bg-primary-fixed/40 text-on-surface"
                                : "bg-surface-container text-on-surface"
                            }`}
                          >
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                              {msg.author === "ADMIN" ? "Tuma Support" : "You"}
                            </p>
                            <p>{msg.body}</p>
                          </div>
                        ))}
                        {ticket.status !== "CLOSED" ? (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              value={reply}
                              onChange={(event) => setReply(event.target.value)}
                              placeholder="Write a reply…"
                              className="flex-1 rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface outline-none"
                            />
                            <button
                              onClick={() => sendReply(ticket.id)}
                              disabled={!reply.trim()}
                              className="rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary disabled:opacity-50"
                            >
                              Reply
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
