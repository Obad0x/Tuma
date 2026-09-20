import Link from "next/link";
import { ConnectButton } from "./connect-button";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Tuma
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Send
            </Link>
            <Link href="/payments" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Payments
            </Link>
            <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Admin
            </Link>
          </nav>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
