"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-on-surface">
      <p className="text-6xl font-black tracking-tight text-primary">500</p>
      <h1 className="mt-4 text-xl font-bold">The server tripped over a semicolon.</h1>
      <p className="mt-2 max-w-md text-sm text-on-surface-variant">
        Nothing was lost — your funds are still safe on-chain. Try again, and if it keeps happening, open a
        support ticket.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary"
        >
          Try again
        </button>
        <Link
          href="/support"
          className="rounded-full border border-surface-container-high px-6 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
        >
          Support
        </Link>
      </div>
    </main>
  );
}
