"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { TumaEscrowABI } from "@/lib/abi";
import { ARC_EXPLORER, ESCROW_ADDRESS, ESCROW_DEPLOY_BLOCK, arc } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { fetchSenderPayments, type SenderPayment } from "@/lib/events";
import { ConnectButton } from "./connect-button";

const primary =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";
const secondary =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 border border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800";

function statusLabel(payment: SenderPayment): string {
  if (payment.status === 1) return "Claimed";
  if (payment.status === 2) return "Refunded";
  return payment.expired ? "Expired" : "Open";
}

function statusClass(payment: SenderPayment): string {
  if (payment.status === 1) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
  if (payment.status === 2) return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200";
  return payment.expired
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    : "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200";
}

export function PaymentsList() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const enabled = !!publicClient && !!address && chainId === arc.id;
  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ["sender-payments", address, chainId],
    queryFn: () => fetchSenderPayments(publicClient!, address!),
    enabled,
  });

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  async function copyLink(id: string) {
    try {
      await navigator.clipboard.writeText(`${origin}/claim/${id}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setActionError("Could not copy. Select the link and copy it manually.");
    }
  }

  async function refund(id: string) {
    if (!publicClient) return;
    setActionError(null);
    setRefundingId(id);
    try {
      const hash = await writeContractAsync({
        abi: TumaEscrowABI,
        address: ESCROW_ADDRESS,
        functionName: "refund",
        args: [BigInt(id)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await refetch();
    } catch (e) {
      setActionError(friendlyError(e));
    } finally {
      setRefundingId(null);
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Connect the wallet you sent from to see your payments.
        </p>
        <ConnectButton />
      </div>
    );
  }

  if (chainId !== arc.id) {
    return (
      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Switch to Arc to see your payments.
        </p>
        <button
          onClick={() => switchChain({ chainId: arc.id })}
          disabled={switching}
          className={primary}
        >
          {switching ? "Switching…" : "Switch to Arc"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError ? <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p> : null}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading your payments…</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{friendlyError(error)}</p>
      ) : !payments || payments.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No payments yet. Send one from the{" "}
          <Link href="/send" className="font-medium underline">
            Send page
          </Link>
          .
        </div>
      ) : (
        payments.map((payment) => (
          <div
            key={payment.id}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-bold tracking-tight">{payment.amount} USDC</p>
                <p className="text-sm text-zinc-500">for @{payment.handle}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(payment)}`}
              >
                {statusLabel(payment)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span>
                {payment.status === 0 && !payment.expired
                  ? `Claimable until ${payment.expiryLabel}`
                  : payment.expired && payment.status === 0
                    ? `Expired ${payment.expiryLabel}`
                    : `Settled · ${payment.expiryLabel}`}
              </span>
              <a
                href={`${ARC_EXPLORER}/address/${ESCROW_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                #{payment.id}
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => copyLink(payment.id)} className={secondary}>
                {copiedId === payment.id ? "Copied!" : "Copy link"}
              </button>
              {payment.status === 0 && payment.expired ? (
                <button
                  onClick={() => refund(payment.id)}
                  disabled={refundingId === payment.id}
                  className={primary}
                >
                  {refundingId === payment.id ? "Refunding…" : "Refund"}
                </button>
              ) : null}
            </div>
          </div>
        ))
      )}

      {ESCROW_DEPLOY_BLOCK === 0n ? (
        <p className="text-xs text-zinc-400">
          Set <code className="font-mono">NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK</code> to make payment
          history load faster.
        </p>
      ) : null}
    </div>
  );
}
