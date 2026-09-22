"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        setError("Invalid secret.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Tuma" className="h-8 w-8 rounded-lg object-cover" src="/images/tuma-logo.jpg" />
          <div>
            <h1 className="text-lg font-bold text-on-surface">Tuma Console</h1>
            <p className="text-xs text-on-surface-variant">Restricted access</p>
          </div>
        </div>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Admin secret
          </span>
          <input
            type="password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            autoComplete="off"
            className="w-full rounded-lg border border-surface-container-high bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none"
            placeholder="••••••••"
          />
        </label>
        {error ? <p className="mb-3 text-xs text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !secret}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
