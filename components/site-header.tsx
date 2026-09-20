import Link from "next/link";
import { ConnectButton } from "./connect-button";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Tuma
        </Link>
        <ConnectButton />
      </div>
    </header>
  );
}
