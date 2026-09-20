"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { TumaEscrowABI } from "@/lib/abi";
import { ARC_EXPLORER, ESCROW_ADDRESS, arc } from "@/lib/arc";
import type { ProtocolOverview } from "@/lib/admin";
import type { PaymentView } from "@/lib/chain";
import { friendlyError } from "@/lib/errors";
import { shortAddress } from "@/lib/format";
import { ConnectButton } from "./connect-button";

const primary =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";
const secondary =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 border border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800";
const card =
  "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900";
const input =
  "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

const STATUS_LABEL: Record<number, string> = { 0: "Open", 1: "Claimed", 2: "Refunded" };

function statusLabel(payment: PaymentView): string {
  if (payment.status === 0 && payment.expired) return "Expired";
  return STATUS_LABEL[payment.status] ?? "Unknown";
}

function statusClass(payment: PaymentView): string {
  if (payment.status === 1) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
  if (payment.status === 2) return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200";
  return payment.expired
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    : "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200";
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={card}>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}

export function AdminDashboard({
  overview,
  payments,
}: {
  overview: ProtocolOverview;
  payments: PaymentView[];
}) {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "claimed" | "refunded" | "expired">(
    "all",
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [newOperator, setNewOperator] = useState("");
  const [releaseId, setReleaseId] = useState("");
  const [releaseTo, setReleaseTo] = useState("");

  const me = address?.toLowerCase();
  const isOwner = !!me && me === overview.owner.toLowerCase();
  const isOperator = !!me && me === overview.operator.toLowerCase();
  const onArc = chainId === arc.id;

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((payment) => {
      if (statusFilter === "open" && !(payment.status === 0 && !payment.expired)) return false;
      if (statusFilter === "expired" && !(payment.status === 0 && payment.expired)) return false;
      if (statusFilter === "claimed" && payment.status !== 1) return false;
      if (statusFilter === "refunded" && payment.status !== 2) return false;
      if (!q) return true;
      return (
        payment.handle.toLowerCase().includes(q) ||
        payment.sender.toLowerCase().includes(q) ||
        payment.id.includes(q)
      );
    });
  }, [payments, query, statusFilter]);

  async function copyLink(id: string) {
    try {
      await navigator.clipboard.writeText(`${origin}/claim/${id}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setActionError("Could not copy to clipboard.");
    }
  }

  function downloadCsv() {
    const header = "id,handle,sender,amount_usdc,status,expiry,claim_link";
    const rows = filtered.map((payment) =>
      [
        payment.id,
        payment.handle,
        payment.sender,
        payment.amount,
        statusLabel(payment),
        new Date(payment.expiry * 1000).toISOString(),
        `${origin}/claim/${payment.id}`,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tuma-payments-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function runAction(key: string, action: () => Promise<`0x${string}`>) {
    if (!publicClient) return;
    setActionError(null);
    setBusy(key);
    try {
      const hash = await action();
      await publicClient.waitForTransactionReceipt({ hash });
      router.refresh();
    } catch (e) {
      setActionError(friendlyError(e));
    } finally {
      setBusy(null);
    }
  }

  const setOperator = () =>
    runAction("operator", () =>
      writeContractAsync({
        abi: TumaEscrowABI,
        address: ESCROW_ADDRESS,
        functionName: "setOperator",
        args: [newOperator.trim() as `0x${string}`],
      }),
    );

  const forceRelease = () =>
    runAction("release", () =>
      writeContractAsync({
        abi: TumaEscrowABI,
        address: ESCROW_ADDRESS,
        functionName: "release",
        args: [BigInt(releaseId.trim()), releaseTo.trim() as `0x${string}`],
      }),
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-500">
          {overview.chainName} · chain {overview.chainId} · {payments.length} payments loaded
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.refresh()} className={secondary}>
            Refresh
          </button>
          <ConnectButton />
        </div>
      </div>

      {isConnected && !onArc ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <button
            onClick={() => switchChain({ chainId: arc.id })}
            disabled={switching}
            className="font-semibold underline"
          >
            {switching ? "Switching…" : "Switch to Arc Mainnet"}
          </button>{" "}
          to use admin actions.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Total payments" value={String(overview.totalPayments)} />
        <Stat label="Escrowed now" value={`${overview.escrowBalance} USDC`} hint="held by the contract" />
        <Stat label="Lifetime volume" value={`${overview.totalVolume} USDC`} hint="from loaded range" />
        <Stat label="Open" value={String(overview.open)} />
        <Stat label="Claimed" value={String(overview.claimed)} />
        <Stat label="Refunded" value={String(overview.refunded)} />
        <Stat label="Expired (refundable)" value={String(overview.expired)} />
        <Stat label="Operator balance" value={`${overview.operatorBalance} USDC`} hint="gas + operations" />
      </div>

      <div className={card}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Contracts
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Escrow</dt>
            <dd className="font-mono">
              <a
                href={`${ARC_EXPLORER}/address/${overview.escrow}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {overview.escrow}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">USDC</dt>
            <dd className="font-mono">{overview.usdc}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Owner</dt>
            <dd className="font-mono">{shortAddress(overview.owner, 8)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Operator</dt>
            <dd className="font-mono">{shortAddress(overview.operator, 8)}</dd>
          </div>
        </dl>
      </div>

      <div className={card}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Admin actions
        </h2>
        {!isConnected ? (
          <p className="text-sm text-zinc-500">Connect the owner or operator wallet to act.</p>
        ) : !onArc ? (
          <p className="text-sm text-zinc-500">Switch to Arc Mainnet to act.</p>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Update operator{" "}
                <span className={isOwner ? "text-emerald-600" : "text-zinc-400"}>
                  ({isOwner ? "owner" : "owner only"})
                </span>
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={newOperator}
                  onChange={(e) => setNewOperator(e.target.value)}
                  placeholder="0x… new operator address"
                  className={`${input} flex-1 font-mono`}
                />
                <button
                  onClick={setOperator}
                  disabled={busy === "operator" || !isOwner || !isAddress(newOperator.trim())}
                  className={primary}
                >
                  {busy === "operator" ? "Saving…" : "Set operator"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Force release{" "}
                <span className={isOperator ? "text-emerald-600" : "text-zinc-400"}>
                  ({isOperator ? "operator" : "operator only"})
                </span>
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={releaseId}
                  onChange={(e) => setReleaseId(e.target.value)}
                  placeholder="payment id"
                  inputMode="numeric"
                  className={`${input} sm:w-32`}
                />
                <input
                  value={releaseTo}
                  onChange={(e) => setReleaseTo(e.target.value)}
                  placeholder="0x… recipient"
                  className={`${input} flex-1 font-mono`}
                />
                <button
                  onClick={forceRelease}
                  disabled={
                    busy === "release" ||
                    !isOperator ||
                    !/^\d+$/.test(releaseId.trim()) ||
                    !isAddress(releaseTo.trim())
                  }
                  className={primary}
                >
                  {busy === "release" ? "Releasing…" : "Release"}
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                Bypasses the X check. Use only for support or testing; the contract still enforces
                operator-only, one release per payment.
              </p>
            </div>
          </div>
        )}
        {actionError ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{actionError}</p> : null}
      </div>

      <div className={card}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search handle, sender or id"
            className={`${input} flex-1`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={input}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="claimed">Claimed</option>
            <option value="refunded">Refunded</option>
            <option value="expired">Expired</option>
          </select>
          <button onClick={downloadCsv} className={secondary}>
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Handle</th>
                <th className="py-2 pr-3">Sender</th>
                <th className="py-2 pr-3 text-right">Amount</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Expiry</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-zinc-500">
                    No payments match.
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                  >
                    <td className="py-2 pr-3 font-mono text-xs">{payment.id}</td>
                    <td className="py-2 pr-3">@{payment.handle}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{shortAddress(payment.sender)}</td>
                    <td className="py-2 pr-3 text-right">{payment.amount}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(payment)}`}>
                        {statusLabel(payment)}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-zinc-500">{payment.expiryLabel}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => copyLink(payment.id)}
                        className="text-xs font-medium underline"
                      >
                        {copiedId === payment.id ? "Copied!" : "Copy link"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
