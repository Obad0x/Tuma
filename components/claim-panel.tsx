"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { isAddress } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { ARC_EXPLORER, USDC_ADDRESS, arcTestnet } from "@/lib/arc";
import type { PaymentView } from "@/lib/chain";
import { shortAddress } from "@/lib/format";
import { ConnectButton } from "./connect-button";

const primary =
  "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";
const secondary =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 border border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800";
const card =
  "space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900";

const STATUS_LABEL: Record<number, string> = { 0: "Open", 1: "Claimed", 2: "Refunded" };

export function ClaimPanel({
  id,
  payment,
  loadError,
}: {
  id: string;
  payment: PaymentView | null;
  loadError: boolean;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();

  const [recipient, setRecipient] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (loadError) {
    return (
      <div className={card}>
        <p className="text-sm text-red-600 dark:text-red-400">
          Could not load this payment right now. Check your connection and refresh the page.
        </p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className={card}>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This payment does not exist. Double-check the link you were sent.
        </p>
      </div>
    );
  }

  const username = session?.user?.username?.toLowerCase() ?? null;
  const target = recipient.trim() || address || "";
  const validTarget = isAddress(target);

  async function handleClaim() {
    if (!validTarget) {
      setError("Enter a valid wallet address.");
      return;
    }
    setError(null);
    setClaiming(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, recipient: target }),
      });
      const data = (await res.json().catch(() => ({}))) as { txHash?: string; error?: string };
      if (!res.ok || !data.txHash) {
        setError(data.error ?? "Claim failed. Please try again.");
        return;
      }
      setTxHash(data.txHash);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className={card}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-bold tracking-tight">{payment.amount} USDC</p>
            <p className="text-sm text-zinc-500">for @{payment.handle}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              payment.status === 0
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
            }`}
          >
            {STATUS_LABEL[payment.status] ?? "Unknown"}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">From</dt>
            <dd className="font-mono">{shortAddress(payment.sender, 6)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Claimable until</dt>
            <dd>{payment.expiryLabel}</dd>
          </div>
        </dl>
      </div>

      {txHash ? (
        <div className={card}>
          <h2 className="text-lg font-semibold">Claimed 🎉</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The USDC was sent to{" "}
            <span className="font-mono">{shortAddress(target, 6)}</span>.
          </p>
          <a
            href={`${ARC_EXPLORER}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={secondary}
          >
            View transaction on ArcScan
          </a>
          <p className="text-xs text-zinc-500">
            To see the balance, add <strong>Arc Testnet</strong> (chain id 5042002) to your wallet and
            import the USDC token at <span className="font-mono">{USDC_ADDRESS}</span>.
          </p>
        </div>
      ) : payment.status === 1 ? (
        <div className={card}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This payment has already been claimed.
          </p>
        </div>
      ) : payment.status === 2 ? (
        <div className={card}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This payment was refunded to the sender.
          </p>
        </div>
      ) : payment.expired ? (
        <div className={card}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This payment expired. Only the sender can refund it now.
          </p>
        </div>
      ) : sessionStatus === "loading" ? (
        <div className={card}>
          <p className="text-sm text-zinc-500">Checking your X session…</p>
        </div>
      ) : !username ? (
        <div className={card}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sign in with X to prove you own @{payment.handle}.
          </p>
          <button
            onClick={() => signIn("twitter", { callbackUrl: window.location.href })}
            className={primary}
          >
            Sign in with X
          </button>
        </div>
      ) : username !== payment.handle.toLowerCase() ? (
        <div className={card}>
          <p className="text-sm text-red-600 dark:text-red-400">
            You&apos;re signed in as @{username} but this payment is for @{payment.handle}.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: window.location.href })}
            className={secondary}
          >
            Sign out and switch account
          </button>
        </div>
      ) : (
        <div className={card}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Confirmed: you&apos;re @{username}. Where should we send the USDC?
          </p>

          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address ? `Use ${shortAddress(address)} or paste another` : "0x… wallet address"}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <ConnectButton />
            {isConnected && chainId !== arcTestnet.id ? (
              <button
                onClick={() => switchChain({ chainId: arcTestnet.id })}
                disabled={switching}
                className="font-medium underline"
              >
                {switching ? "Switching…" : "Switch to Arc Testnet"}
              </button>
            ) : null}
            {isConnected && address ? (
              <span>
                Using connected wallet{" "}
                <span className="font-mono">{shortAddress(address)}</span>
              </span>
            ) : null}
          </div>

          <button onClick={handleClaim} disabled={claiming || !validTarget} className={primary}>
            {claiming ? "Claiming…" : "Claim USDC"}
          </button>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
