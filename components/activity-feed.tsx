"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AppNav } from "./app-nav";
import { useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
  type Connector,
} from "wagmi";
import { TumaEscrowABI } from "@/lib/abi";
import { ARC_EXPLORER, ESCROW_ADDRESS, USDC_ADDRESS, arc } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { fetchSenderOverview, type SenderPayment } from "@/lib/events";
import { shortAddress } from "@/lib/format";

const X_LOGO = "𝕏";

type Filter = "all" | "open" | "claimed" | "refunded";

function initials(handle: string): string {
  return handle.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "?";
}

function statusMeta(payment: SenderPayment): { label: string; className: string; dot: string } {
  if (payment.status === 1) {
    return { label: "Claimed", className: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" };
  }
  if (payment.status === 2) {
    return { label: "Refunded", className: "bg-surface-container-high text-on-surface-variant", dot: "bg-zinc-400" };
  }
  if (payment.expired) {
    return { label: "Expired", className: "bg-amber-50 text-amber-700", dot: "bg-amber-500" };
  }
  return { label: "Open", className: "bg-sky-50 text-sky-700", dot: "bg-sky-500" };
}

function trim(value: string): string {
  return value.includes(".") ? value.replace(/(\.\d{1,4})\d*$/, "$1") : value;
}

function formatSpeed(seconds: number | undefined): string {
  if (seconds === undefined) return "—";
  return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
}

export function ActivityFeed() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const onArc = chainId === arc.id;
  const ready = isConnected && onArc;

  const { data: balance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: !!address && onArc },
  });

  const { data: overview, isLoading, refetch } = useQuery({
    queryKey: ["sender-overview", address, chainId],
    queryFn: () => fetchSenderOverview(publicClient!, address!),
    enabled: !!publicClient && !!address && onArc,
  });

  const speeds = overview?.speeds;

  const all = useMemo(() => overview?.payments ?? [], [overview]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((payment) => {
      if (filter === "open" && payment.status !== 0) return false;
      if (filter === "claimed" && payment.status !== 1) return false;
      if (filter === "refunded" && payment.status !== 2) return false;
      if (!q) return true;
      return (
        payment.handle.toLowerCase().includes(q) ||
        payment.id.includes(q) ||
        payment.amount.includes(q)
      );
    });
  }, [all, filter, query]);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: SenderPayment[]; net: number }>();
    for (const payment of filtered) {
      const date = new Date(payment.createdAt * 1000);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!map.has(key)) map.set(key, { label, items: [], net: 0 });
      const group = map.get(key)!;
      group.items.push(payment);
      group.net -= Number(payment.amount);
    }
    return [...map.values()];
  }, [filtered]);

  const stats = useMemo(() => {
    const claimed = all.filter((payment) => payment.status === 1).length;
    const settledRate = all.length ? Math.round((claimed / all.length) * 100) : 0;
    const newest = all[0];
    let monthLabel = "";
    let monthTotal = 0;
    if (newest) {
      const ref = new Date(newest.createdAt * 1000);
      monthLabel = ref.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const key = `${ref.getFullYear()}-${ref.getMonth()}`;
      monthTotal = all
        .filter((payment) => {
          const d = new Date(payment.createdAt * 1000);
          return `${d.getFullYear()}-${d.getMonth()}` === key;
        })
        .reduce((sum, payment) => sum + Number(payment.amount), 0);
    }
    return { settledRate, monthLabel, monthTotal };
  }, [all]);

  const speedsList = useMemo(() => Object.values(speeds ?? {}), [speeds]);
  const medianSpeed = useMemo(() => {
    if (speedsList.length === 0) return null;
    const sorted = [...speedsList].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }, [speedsList]);

  const selected = filtered.find((payment) => payment.id === selectedId) ?? filtered[0] ?? null;
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }

  async function copyValue(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      flash("Could not copy to clipboard.");
    }
  }

  function exportCsv() {
    const header = "id,handle,amount_usdc,status,created,expiry,claim_link";
    const rows = filtered.map((payment) =>
      [
        payment.id,
        payment.handle,
        payment.amount,
        statusMeta(payment).label,
        new Date(payment.createdAt * 1000).toISOString(),
        new Date(payment.expiry * 1000).toISOString(),
        `${origin}/claim/${payment.id}`,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tuma-activity-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function refund(id: string) {
    if (!publicClient) return;
    setError(null);
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
      flash(`Refund submitted for payment #${id}.`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setRefundingId(null);
    }
  }

  async function handleConnect(connector: Connector) {
    setConnectError(null);
    try {
      await connectAsync({ connector });
      setPickerOpen(false);
    } catch (e) {
      setConnectError(friendlyError(e));
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "claimed", label: "Claimed" },
    { key: "refunded", label: "Refunded" },
  ];

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <AppNav active="activity" />
        <div className="px-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Escrow protected</span>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">On Arc</span>
              <span className="font-label-md text-label-md text-primary font-bold">{Number.isFinite(stats.settledRate) ? `${stats.settledRate}%` : "—"}</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Claimed of all payments</span>
          </div>
        </div>
      </aside>

      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-64 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface">Activity · escrowed on {arc.name}</span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_4px_12px_rgba(26,24,22,0.03)]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Balance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{balance ? `${trim(balance.formatted)} USDC` : "—"}</span>
              </div>
              {ready ? (
                <Link href="/profile" className="rounded-full border border-surface-container-high text-on-surface px-space-md py-space-xs font-label-lg text-label-lg hover:bg-surface-container transition-colors">
                  {shortAddress(address)}
                </Link>
              ) : (
                <button onClick={() => setPickerOpen(true)} className="rounded-full bg-primary-container text-on-primary px-space-md py-space-xs font-label-lg text-label-lg shadow-sm hover:bg-primary transition-colors">
                  Connect wallet
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="w-full pt-20 px-space-xl pb-space-xl flex-1 bg-background">
          <div className="flex flex-col w-full gap-space-lg">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Ledger & receipts</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span> On-chain audit trail
                  </span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Activity</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Every payment you&apos;ve sent, its escrow status, and a claim link for each.</p>
              </div>
              <div className="flex items-center gap-space-sm self-start xl:self-auto bg-surface-container-lowest p-space-xs rounded-full shadow-[0_8px_20px_-6px_rgba(26,24,22,0.04)]">
                <div className="px-space-md py-space-xs flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Settled rate</span>
                  <span className="font-label-lg text-label-lg text-emerald-600 font-extrabold">{all.length ? `${stats.settledRate}%` : "—"}</span>
                </div>
                <div className="w-px h-6 bg-surface-container-highest"></div>
                <div className="px-space-md py-space-xs flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{stats.monthLabel || "This month"}</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{stats.monthTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC</span>
                </div>
                <button onClick={exportCsv} className="bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface px-space-md py-space-xs rounded-full flex items-center gap-1 font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">file_download</span> Export CSV
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)]">
              <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-full self-start">
                {filters.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className={`px-space-lg py-space-xs rounded-full font-label-lg text-label-lg transition-all ${
                      filter === item.key ? "bg-primary-container text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 lg:max-w-md">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by @handle, id or amount..."
                  className="w-full bg-surface-container-low focus:bg-surface-container-lowest pl-10 pr-space-md py-2.5 rounded-full font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-all"
                />
              </div>
            </div>

            {error ? <p className="font-body-sm text-body-sm text-error">{error}</p> : null}

            {!ready ? (
              <EmptyState
                title={isConnected ? "Switch to Arc Mainnet" : "Connect your wallet"}
                body={
                  isConnected
                    ? `Tuma runs on ${arc.name}. Switch networks to see the payments you've sent.`
                    : `Connect to ${arc.name} to see the payments you've sent and their escrow status.`
                }
                cta={isConnected ? "Switch to Arc Mainnet" : "Connect wallet"}
                onCta={() => (isConnected ? switchChain({ chainId: arc.id }) : setPickerOpen(true))}
              />
            ) : isLoading ? (
              <div className="rounded-lg bg-surface-container-lowest p-space-xl text-center font-body-md text-body-md text-on-surface-variant">Loading your activity…</div>
            ) : all.length === 0 ? (
              <EmptyState
                title="No activity yet"
                body={`Your first payment is waiting. Send USDC to anyone's ${X_LOGO} handle and they claim it with one login.`}
                cta="Send money"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                {/* Timeline */}
                <section className="lg:col-span-7 flex flex-col gap-space-lg">
                  {groups.length === 0 ? (
                    <div className="rounded-lg bg-surface-container-lowest p-space-xl text-center font-body-md text-body-md text-on-surface-variant">No payments match this filter.</div>
                  ) : (
                    groups.map((group) => (
                      <div key={group.label} className="flex flex-col gap-space-sm">
                        <div className="flex items-center justify-between px-space-sm">
                          <span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider font-extrabold flex items-center gap-2">
                            <span>{group.label}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">{group.items.length} {group.items.length === 1 ? "payment" : "payments"}</span>
                          </span>
                          <span className="font-label-md text-label-md text-on-surface-variant">Net {group.net.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC</span>
                        </div>
                        <div className="flex flex-col gap-space-xs">
                          {group.items.map((payment) => {
                            const meta = statusMeta(payment);
                            const active = selected?.id === payment.id;
                            return (
                              <button
                                key={payment.id}
                                onClick={() => setSelectedId(payment.id)}
                                className={`group w-full text-left bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-lg transition-all flex items-center justify-between gap-space-md ${
                                  active ? "ring-2 ring-primary-container shadow-[0_12px_28px_-6px_rgba(255,90,54,0.12)]" : "shadow-[0_4px_16px_rgba(26,24,22,0.02)]"
                                }`}
                              >
                                <div className="flex items-center gap-space-md min-w-0">
                                  <div className="relative w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0 shadow-inner">
                                    <span className="material-symbols-outlined text-[24px]">arrow_upward</span>
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-space-xs flex-wrap">
                                      <span className="font-headline-sm text-headline-sm text-on-surface truncate">@{payment.handle}</span>
                                      <span className="font-label-sm text-label-sm text-on-surface-variant">#{payment.id}</span>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-outline tracking-normal mt-0.5">{payment.createdLabel}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0 gap-1">
                                  <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">-{payment.amount} USDC</span>
                                  <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold ${meta.className}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></span>
                                    {meta.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Telemetry */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-[0_4px_20px_rgba(26,24,22,0.03)] flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="font-label-lg text-label-lg text-on-surface font-bold">Settlement telemetry</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{speedsList.length} claimed</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
                      <div className="bg-surface-container-low p-space-md rounded-DEFAULT flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Median delivery</span>
                        <span className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
                          {medianSpeed === null ? "—" : formatSpeed(medianSpeed)}
                        </span>
                        <span className="font-body-sm text-body-sm text-emerald-700 font-medium">Deposit → release time</span>
                      </div>
                      <div className="bg-surface-container-low p-space-md rounded-DEFAULT flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Protocol fees</span>
                        <span className="font-headline-lg text-headline-lg text-on-surface font-extrabold">$0.00</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Sender covers network gas</span>
                      </div>
                      <div className="bg-surface-container-low p-space-md rounded-DEFAULT flex flex-col justify-between">
                        <div>
                          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Escrow contract</span>
                          <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">{shortAddress(ESCROW_ADDRESS, 4)}</div>
                        </div>
                        <a href={`${ARC_EXPLORER}/address/${ESCROW_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="font-label-sm text-label-sm text-primary hover:underline">
                          View on Arc Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Detail panel */}
                <aside className="lg:col-span-5 lg:sticky lg:top-24">
                  {selected ? (
                    <DetailPanel
                      payment={selected}
                      speed={speeds?.[selected.id]}
                      address={address}
                      copied={copied}
                      refunding={refundingId === selected.id}
                      onCopy={copyValue}
                      onRefund={() => refund(selected.id)}
                      claimLink={`${origin}/claim/${selected.id}`}
                    />
                  ) : null}
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-2.5 rounded-full font-label-md text-label-md shadow-2xl flex items-center gap-2 transition-all duration-300 ${toast ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
        <span>{toast ?? ""}</span>
      </div>

      {/* Tumi bubble */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-space-sm">
        <span className="bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_12px_28px_-6px_rgba(26,24,22,0.12)] flex items-center gap-space-xs border border-surface-container-highest">
          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          <span className="font-label-md text-label-md text-on-surface font-semibold">Need help? Ask Tumi!</span>
        </span>
        <span className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(26,24,22,0.16)]">
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
        </span>
      </div>

      {/* Connect modal */}
      {pickerOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-md" onClick={() => setPickerOpen(false)}>
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-lg shadow-[0_20px_32px_-8px_rgba(26,24,22,0.18)] p-space-lg flex flex-col gap-space-sm" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">Connect a wallet</span>
              <button onClick={() => setPickerOpen(false)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {connectors
              .filter((connector, index, list) => list.findIndex((c) => c.name === connector.name) === index)
              .map((connector) => (
                <button key={connector.id} onClick={() => handleConnect(connector)} disabled={connecting} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-surface-container-low transition-colors disabled:opacity-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-[11px] font-bold uppercase">{connector.name.slice(0, 1)}</span>
                  <span className="font-body-md text-body-md text-on-surface">{connector.name}</span>
                </button>
              ))}
            {connectError ? <p className="font-body-sm text-body-sm text-error">{connectError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailPanel({
  payment,
  speed,
  address,
  copied,
  refunding,
  onCopy,
  onRefund,
  claimLink,
}: {
  payment: SenderPayment;
  speed: number | undefined;
  address?: `0x${string}`;
  copied: string | null;
  refunding: boolean;
  onCopy: (value: string, key: string) => void;
  onRefund: () => void;
  claimLink: string;
}) {
  const meta = statusMeta(payment);
  const shareText = `Hey @${payment.handle}, I sent you ${payment.amount} USDC on Tuma. Claim it here:`;
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_20px_35px_-8px_rgba(26,24,22,0.06)] flex flex-col gap-space-lg relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-fixed opacity-40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center justify-between relative z-10">
        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Payment receipt</span>
        <span className={`inline-flex items-center gap-1.5 font-label-md text-label-md px-3 py-1 rounded-full font-bold ${meta.className}`}>
          <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
          {meta.label}
        </span>
      </div>

      <div className="flex flex-col items-center text-center py-space-md bg-surface-container-low rounded-lg relative z-10 px-space-md">
        <div className="relative mb-space-sm">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[28px] font-bold shadow-[0_8px_16px_rgba(255,90,54,0.25)]">
            {initials(payment.handle)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </div>
        </div>
        <div className="font-currency-display text-currency-display text-on-surface tracking-tight font-black">-{payment.amount} USDC</div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Sent to <span className="text-primary">@{payment.handle}</span></span>
        </div>
        <time className="font-label-sm text-label-sm text-on-surface-variant mt-1">{payment.createdLabel}</time>
      </div>

      <div className="flex flex-col gap-space-sm relative z-10">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Breakdown details</span>
          <span className="font-label-sm text-label-sm text-outline font-semibold">Tuma Escrow on {arc.name}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <Row label="Recipient" value={`@${payment.handle}`} />
          <Row label="Transfer amount" value={`${payment.amount} USDC`} />
          <Row label="Protocol fee" value="$0.00" valueClass="text-emerald-600 font-bold" />
          <div className="h-px bg-surface-container my-1"></div>
          <Row label="Total escrowed" value={`${payment.amount} USDC`} strong />
          <div className="h-px bg-surface-container my-1"></div>
          <Row label="Claimable until" value={payment.expiryLabel} />
          <Row label="Settlement speed" value={payment.status === 1 ? formatSpeed(speed) : "—"} valueClass="text-emerald-700 font-semibold" icon="bolt" />
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">Payment ID</span>
            <div className="flex items-center gap-1">
              <span className="font-label-md text-label-md font-mono text-on-surface bg-surface-container px-2 py-0.5 rounded font-bold">#{payment.id}</span>
              <button onClick={() => onCopy(payment.id, `id-${payment.id}`)} className="text-primary hover:bg-surface-container transition-colors p-1 rounded" title="Copy payment id">
                <span className="material-symbols-outlined text-[16px]">{copied === `id-${payment.id}` ? "check" : "content_copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-space-md rounded-lg flex items-center gap-space-md relative z-10">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-on-secondary-container text-[28px]">sentiment_very_satisfied</span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface font-bold">Escrow guarantee</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
            Funds are held by the TumaEscrow contract until @{payment.handle} claims. Refundable by you after 30 days.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-space-xs relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-space-xs">
          <button onClick={() => onCopy(claimLink, "link")} className="w-full flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-space-sm px-space-md rounded-full font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">content_copy</span>
            {copied === "link" ? "Copied!" : "Copy claim link"}
          </button>
          <a href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(claimLink)}`} target="_blank" rel="noopener noreferrer" className="w-full flex-1 bg-primary-container hover:bg-primary text-on-primary py-space-sm px-space-md rounded-full font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_4px_0_#d94623] active:translate-y-0.5 active:shadow-none transition-all">
            <span>Share on {X_LOGO}</span>
          </a>
        </div>
        {payment.status === 0 && payment.expired ? (
          <button onClick={onRefund} disabled={refunding} className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-space-sm px-space-md rounded-full font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined text-[20px]">undo</span>
            {refunding ? "Refunding…" : "Refund to my wallet"}
          </button>
        ) : null}
        <p className="font-label-sm text-label-sm text-on-surface-variant/80 text-center pt-space-xs">
          Funding source: {address ? shortAddress(address, 4) : "wallet not connected"}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "text-on-surface", strong, icon }: { label: string; value: string; valueClass?: string; strong?: boolean; icon?: string }) {
  return (
    <div className="flex items-center justify-between text-body-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className={`font-label-md text-label-md flex items-center gap-1 ${strong ? "text-on-surface font-bold" : valueClass}`}>
        {icon ? <span className="material-symbols-outlined text-[14px]">{icon}</span> : null}
        {value}
      </span>
    </div>
  );
}

function EmptyState({ title, body, cta, onCta }: { title: string; body: string; cta: string; onCta?: () => void }) {
  return (
    <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-xl flex flex-col items-center justify-center text-center shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)]">
      <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-space-md">
        <span className="material-symbols-outlined text-[32px]">receipt_long</span>
      </div>
      <h3 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant font-medium max-w-md mb-space-lg">{body}</p>
      {onCta ? (
        <button onClick={onCta} className="inline-flex items-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-[0_4px_0_#d94623] hover:translate-y-0.5 transition-all">
          <span>{cta}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      ) : (
        <Link href="/send" className="inline-flex items-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-[0_4px_0_#d94623] hover:translate-y-0.5 transition-all">
          <span>{cta}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}
