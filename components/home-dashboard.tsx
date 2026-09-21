"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  usePublicClient,
  useSwitchChain,
  type Connector,
} from "wagmi";
import { USDC_ADDRESS, arc } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { fetchSenderPayments, fetchSettlementDurations, type SenderPayment } from "@/lib/events";
import { shortAddress } from "@/lib/format";
import { isValidHandle, normalizeHandle } from "@/lib/handles";

const X_LOGO = "𝕏";

// Design-export assets (Google-hosted). Kept as-is so the mascot/logo match the mock.
const TUMA_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAHKFAw6gP2hPCPlYlG-OiYf1s-vtwFoDVAE4USKcbYw9IPXI75vF_K2wETttty3I8Q-ZjW8DJp7zoqLNexaU0JohbgNoexla5ezYm5o3ltNd8CRt6ZePoBeBDd1-YoIOgqAL6R31vTbY93OxYDKiaR3gJPWElzx2trPg80UtRrOAscXkXZfKYBmtdT77b5Oh-2VBq_u-ywodPGYnBj7b0CxkGhYhcfBOVE1PYe5TFB2hk1AHUCOYcf";
const TUMI_WAVING =
  "https://lh3.googleusercontent.com/aida/AEtjO1U3YQh5ndXkf4Wj1tPP45eaRpfGGi349UfItqd0mVCUwmYhDfDydveF-_iU0ZcbT3vSyaW6UYeohqPtYZ7bPzQw6k7DI5nTfEY4cs71JWZfLtk4drQQ4AG1A-p3LYbwuXYPb-mKOtEJFZ7oXejsdtcEXWQE-mYGADWe3P9uFR2Dm5snoYUSYP41cavc8AaDrSSNyBWK1L9o_HqTYQ6dnuwaf1VgIWmU_QzNz-rFXayAw0fGdcwIEOpP46k";
const TUMI_CURIOUS =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAO6MRTVk9_ndYahkuIoKZrtADuxZdDG4Wo614dET1jFfC9iV8ySJgcVQFmC_iBz0UpqXTy6AE-FVYNLT9TLRjBGlGXI5FiiUlyQe26ZsOiNadiKjt_LaXK3YtIV7SKeZuJldjiQ9CCdFDqR0VUVgNtbxPj1nirONPQC_MCB0lHgOHy0PZqndN3mbCXpNJo1bVjb8GxgAzOisDutr_6UlAutra8gTi-UBgb7yrIBj3-VSWjfqJG1Q5k";

type RateResponse = {
  base: string;
  rates: Record<string, number>;
  updatedAt: string | null;
};

const POPULAR = ["NGN", "KES", "GHS", "ZAR", "USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY", "BRL"];

const AVATAR_STYLES = [
  "bg-primary-fixed text-on-primary-fixed",
  "bg-secondary-fixed text-on-secondary-fixed",
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-secondary-container text-on-secondary-container",
];

async function fetchRates(): Promise<RateResponse> {
  const res = await fetch("/api/rates");
  if (!res.ok) throw new Error("Could not load exchange rates.");
  return (await res.json()) as RateResponse;
}

function initials(handle: string): string {
  return handle.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "?";
}

function formatFiat(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function trimAmount(value: string): string {
  if (!value.includes(".")) return value;
  return value.replace(/(\.\d{1,4})\d*$/, "$1");
}

function statusInfo(payment: SenderPayment): { label: string; dot: string } {
  if (payment.status === 1) return { label: "Claimed", dot: "bg-emerald-500" };
  if (payment.status === 2) return { label: "Refunded", dot: "bg-zinc-400" };
  if (payment.expired) return { label: "Expired", dot: "bg-amber-500" };
  return { label: "Open", dot: "bg-secondary-container" };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function buildSpark(values: number[]): { line: string; area: string } | null {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = 200 / (values.length - 1);
  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = 34 - ((value - min) / span) * 26;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const line = points.join(" ");
  return { line, area: `${line} L200 40 L0 40 Z` };
}

export function HomeDashboard() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { data: session } = useSession();
  const username = session?.user?.username ?? null;

  const [currency, setCurrency] = useState("NGN");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestHandle, setRequestHandle] = useState("");
  const [requestLink, setRequestLink] = useState("");
  const [requestCopied, setRequestCopied] = useState(false);

  const onArc = chainId === arc.id;
  const ready = isConnected && onArc;

  const { data: balance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: !!address && onArc },
  });

  const { data: rateData, isLoading: ratesLoading } = useQuery({
    queryKey: ["rates"],
    queryFn: fetchRates,
    staleTime: 3_600_000,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["dashboard-payments", address, chainId],
    queryFn: () => fetchSenderPayments(publicClient!, address!),
    enabled: !!publicClient && !!address && onArc,
  });

  const { data: durations } = useQuery({
    queryKey: ["dashboard-durations", address, chainId],
    queryFn: () => fetchSettlementDurations(publicClient!, address!),
    enabled: !!publicClient && !!address && onArc,
  });

  const uniqueConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((connector) => {
      const key = connector.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [connectors]);

  const currencyOptions = useMemo(() => {
    if (!rateData) return POPULAR;
    const available = new Set(Object.keys(rateData.rates));
    const popular = POPULAR.filter((code) => available.has(code));
    const rest = [...available].filter((code) => !POPULAR.includes(code)).sort();
    return [...popular, ...rest];
  }, [rateData]);

  const rate = rateData?.rates?.[currency] ?? null;
  const usdcText = balance ? trimAmount(balance.formatted) : null;
  const fiatValue = rate && balance ? Number(balance.formatted) * rate : null;

  const settlement = durations ?? [];
  const medianSpeed = median(settlement);
  const spark = buildSpark(settlement);

  const recipients = useMemo(() => {
    if (!payments) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const payment of payments) {
      if (seen.has(payment.handle)) continue;
      seen.add(payment.handle);
      list.push(payment.handle);
      if (list.length === 3) break;
    }
    return list;
  }, [payments]);

  const recent = payments?.slice(0, 5) ?? [];
  const hasActivity = recent.length > 0;

  const requestLinkPreview = requestLink;

  function openRequest() {
    setRequestHandle(username ?? "");
    setRequestAmount("");
    setRequestLink("");
    setRequestCopied(false);
    setRequestOpen(true);
  }

  function generateRequest() {
    const handle = normalizeHandle(requestHandle);
    if (!isValidHandle(handle) || !requestAmount.trim()) return;
    const link = `${window.location.origin}/send?handle=${handle}&amount=${requestAmount.trim()}`;
    setRequestLink(link);
    setRequestCopied(false);
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (key === "request") setRequestCopied(true);
      else {
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
      }
    } catch {
      setConnectError("Could not copy to clipboard.");
    }
  }

  async function handleConnect(connector: Connector) {
    setConnectError(null);
    try {
      await connectAsync({ connector });
      setPickerOpen(false);
    } catch (error) {
      setConnectError(friendlyError(error));
    }
  }

  const requestShareText = `Hey! I'm requesting ${
    requestAmount ? `${requestAmount} USDC ` : ""
  }on Tuma. You can send it to me here:`;

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col px-space-md">
            <div className="flex items-center gap-space-sm px-space-sm mb-space-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Tuma Logo" className="h-8 w-auto object-contain" src={TUMA_LOGO} />
              <span className="font-headline-md text-headline-md text-on-surface tracking-tight">Tuma</span>
            </div>
          <nav className="flex flex-col gap-space-xs">
            <Link
              href="/dashboard"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm transition-all"
            >
              <span className="font-label-lg text-label-lg">Home</span>
            </Link>
            <Link
              href="/send"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              <span className="font-label-lg text-label-lg">Send</span>
            </Link>
            <Link
              href="/payments"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              <span className="font-label-lg text-label-lg">Activity</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              <span className="font-label-lg text-label-lg">Profile</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              <span className="font-label-lg text-label-lg">Admin</span>
            </Link>
          </nav>
        </div>
        <div className="px-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Live rate
            </span>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">USD / {currency}</span>
              <span className="font-label-md text-label-md text-primary font-bold">
                {rate ? formatFiat(rate) : "—"}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Powered by live FX · USDC ≈ USD
            </span>
          </div>
        </div>
      </aside>

      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-64 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">search</span>
                <input
                  className="bg-transparent border-0 outline-none text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm w-72"
                  placeholder="Search recipients, transactions, tags..."
                  type="text"
                />
              </div>
              <div className="hidden xl:flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface">
                  FX Live: 1 USD = {rate ? formatFiat(rate) : "…"} {currency}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_4px_12px_rgba(26,24,22,0.03)]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Balance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  {usdcText ? `${usdcText} USDC` : "—"}
                </span>
              </div>
              {isConnected ? (
                <Link
                  href="/profile"
                  title="Profile"
                  className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">account_circle</span>
                </Link>
              ) : (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="rounded-full bg-primary-container text-on-primary px-space-md py-space-xs font-label-lg text-label-lg shadow-sm hover:bg-primary transition-colors"
                >
                  Connect wallet
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="w-full pt-20 px-space-xl pb-space-xl flex-1 bg-background">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-space-lg">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
              <div className="flex flex-col">
                <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
                  Good evening{username ? `, ${username}` : ""} 👋
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                  Send money anywhere in the world in seconds — with just an {X_LOGO} handle.
                </p>
              </div>
              <div className="inline-flex items-center gap-space-sm bg-surface-container-lowest py-space-xs px-space-md rounded-full shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] self-start md:self-auto">
                <div className="relative w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Tumi Mascot" className="w-full h-full object-cover" src={TUMI_WAVING} />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary-container rounded-full ring-2 ring-surface-container-lowest"></span>
                </div>
                <div className="flex flex-col pr-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Companion Mood
                  </span>
                  <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1">
                    Tumi is ready to fly <span className="animate-bounce">🚀</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left column */}
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                {/* Wallet card */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.05),0_8px_10px_-6px_rgba(26,24,22,0.02)]">
                  <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
                  <div className="absolute right-6 bottom-4 opacity-5 pointer-events-none text-on-surface">
                    <span className="material-symbols-outlined text-[160px] leading-none">
                      account_balance_wallet
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                          Your wallet
                        </span>
                        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Arc Mainnet
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-lowest px-space-sm py-1 rounded-full shadow-sm text-on-surface">
                        <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
                        <span className="font-label-sm text-label-sm font-semibold">
                          {ready ? "Wallet connected" : "Not connected"}
                        </span>
                      </div>
                    </div>

                    {ready ? (
                      <div className="flex flex-col py-space-xs">
                        <div className="flex items-baseline gap-space-xs">
                          <span className="font-currency-display text-currency-display text-on-surface tracking-tight">
                            {usdcText ?? "0"} <span className="text-headline-md text-on-surface-variant">USDC</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs mt-1 text-on-surface-variant">
                          <span className="font-body-sm text-body-sm tracking-wide">
                            {address ? shortAddress(address, 6) : ""}
                          </span>
                          <button
                            className="hover:text-on-surface transition-colors"
                            title="Copy wallet address"
                            onClick={() => address && copy(address, "address")}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copied === "address" ? "check" : "content_copy"}
                            </span>
                          </button>
                          <span className="font-body-sm text-body-sm">
                            {fiatValue !== null ? `· ≈ ${formatFiat(fiatValue)} ${currency}` : ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-space-sm py-space-sm">
                        <p className="font-body-lg text-body-lg text-on-surface-variant">
                          Connect your wallet to see your USDC balance on Arc.
                        </p>
                        {isConnected && !onArc ? (
                          <button
                            onClick={() => switchChain({ chainId: arc.id })}
                            disabled={switching}
                            className="inline-flex items-center gap-space-sm bg-primary-container hover:bg-primary text-on-primary py-space-md px-space-lg rounded-full font-headline-sm text-headline-sm transition-all"
                          >
                            <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
                            {switching ? "Switching…" : "Switch to Arc Mainnet"}
                          </button>
                        ) : (
                          <button
                            onClick={() => setPickerOpen(true)}
                            className="group inline-flex items-center gap-space-sm bg-primary-container hover:bg-primary text-on-primary py-space-md px-space-lg rounded-full font-headline-sm text-headline-sm transition-all shadow-[0_12px_24px_-6px_rgba(255,90,54,0.35),0_4px_0_#d63f1d] active:translate-y-0.5"
                          >
                            <span className="material-symbols-outlined text-[24px] transition-transform group-hover:scale-110">
                              account_balance_wallet
                            </span>
                            Connect your wallet
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between pt-space-xs gap-space-xs">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Recipients are paid to their {X_LOGO} handle — no wallet needed to claim.
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Network: {arc.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action suite */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-sm items-center">
                  <Link
                    href="/send"
                    className="sm:col-span-7 group relative flex items-center justify-center gap-space-sm bg-primary-container hover:bg-primary text-on-primary py-space-md px-space-lg rounded-full font-headline-sm text-headline-sm transition-all duration-150 active:translate-y-0.5 shadow-[0_12px_24px_-6px_rgba(255,90,54,0.35),0_4px_0_#d63f1d]"
                  >
                    <span className="material-symbols-outlined text-[24px] transition-transform group-hover:scale-110 group-hover:rotate-12">
                      rocket_launch
                    </span>
                    <span>Send money</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest ml-1 animate-ping"></span>
                  </Link>
                  <div className="sm:col-span-5 grid grid-cols-2 gap-space-sm">
                    <button
                      onClick={openRequest}
                      className="flex items-center justify-center gap-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface py-space-md px-space-sm rounded-full font-label-lg text-label-lg transition-all shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)]"
                    >
                      <span className="material-symbols-outlined text-[18px]">call_received</span>
                      <span>Request</span>
                    </button>
                    <button
                      onClick={() => setCurrency((current) => (current === "NGN" ? "KES" : "NGN"))}
                      className="flex items-center justify-center gap-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface py-space-md px-space-sm rounded-full font-label-lg text-label-lg transition-all shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)]"
                    >
                      <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                      <span>Swap rate</span>
                    </button>
                  </div>
                </div>

                {/* Quick recipients */}
                <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)]">
                  <div className="flex items-center justify-between px-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Quick Recipients
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      From your recent payments
                    </span>
                  </div>
                  <div className="flex items-center gap-space-md overflow-x-auto pb-space-xs pt-space-xs">
                    <Link
                      href="/send"
                      className="flex flex-col items-center gap-1 min-w-[72px] group"
                    >
                      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary transition-all">
                        <span className="material-symbols-outlined text-[26px]">add</span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface font-semibold mt-1">New</span>
                    </Link>
                    {recipients.length === 0 ? (
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        No recipients yet — your recent handles will appear here.
                      </span>
                    ) : (
                      recipients.map((handle, index) => (
                        <Link
                          key={handle}
                          href={`/send?handle=${handle}`}
                          className="flex flex-col items-center gap-1 min-w-[72px] group"
                        >
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shadow-sm group-hover:scale-105 transition-transform ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}
                          >
                            {initials(handle)}
                          </div>
                          <div className="flex flex-col items-center mt-1">
                            <span className="font-label-md text-label-md text-on-surface font-semibold">
                              @{handle}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between px-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-headline-md text-headline-md text-on-surface">Recent activity</h2>
                      <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                    </div>
                    <Link
                      href="/payments"
                      className="font-label-lg text-label-lg text-primary hover:text-on-primary-container transition-colors flex items-center gap-1"
                    >
                      <span>View all</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>

                  {!ready ? (
                    <ActivityEmpty
                      title="Connect your wallet"
                      body="Connect to Arc Mainnet to see the payments you've sent and their status."
                      cta="Connect wallet"
                      onCta={() => setPickerOpen(true)}
                    />
                  ) : paymentsLoading ? (
                    <div className="bg-surface-container-lowest p-space-xl rounded-lg text-center font-body-md text-body-md text-on-surface-variant shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)]">
                      Loading your payments…
                    </div>
                  ) : hasActivity ? (
                    <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-sm rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)]">
                      {recent.map((payment, index) => {
                        const info = statusInfo(payment);
                        return (
                          <div key={payment.id}>
                            {index > 0 ? <div className="h-px w-full bg-surface-container-low"></div> : null}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors gap-space-sm">
                              <div className="flex items-center gap-space-md min-w-0">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-headline-sm text-headline-sm ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}
                                >
                                  {initials(payment.handle)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-space-xs">
                                    <span className="font-label-lg text-label-lg text-on-surface truncate">
                                      @{payment.handle}
                                    </span>
                                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                                      {X_LOGO}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-space-xs text-on-surface-variant mt-0.5">
                                    <span className="font-body-sm text-body-sm truncate">
                                      {payment.status === 0
                                        ? `Claimable until ${payment.expiryLabel}`
                                        : `${info.label} · ${payment.expiryLabel}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 pl-14 sm:pl-0">
                                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                  -{payment.amount} USDC
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                                    <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`}></span>
                                    {info.label}
                                  </span>
                                  <button
                                    onClick={() =>
                                      copy(`${window.location.origin}/claim/${payment.id}`, payment.id)
                                    }
                                    className="text-on-surface-variant hover:text-on-surface"
                                    title="Copy claim link"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {copied === payment.id ? "check" : "link"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <ActivityEmpty
                      title="No transactions yet."
                      body={`Your first one is waiting. Send USDC to anyone's ${X_LOGO} handle and they claim it with one login.`}
                      cta="Send money"
                    />
                  )}
                </div>
              </div>

              {/* Right rail */}
              <div className="lg:col-span-4 flex flex-col gap-space-md">
                {/* Tumi insight */}
                <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] relative overflow-hidden">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-12 h-12 rounded-full bg-secondary-fixed shrink-0 flex items-center justify-center text-secondary overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="Tumi Mascot Helper" className="w-full h-full object-cover" src={TUMI_WAVING} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-label-lg text-label-lg text-on-surface font-bold">Tumi insight</span>
                        <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-1.5 py-0.5 rounded">
                          Live tip
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                        Send to anywhere in the world in seconds using just their{" "}
                        <span className="text-on-surface font-semibold">{X_LOGO} account</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exchange benchmark */}
                <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Exchange Benchmark
                    </span>
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Live
                    </span>
                  </div>
                  <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">Active Pair</span>
                      <select
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className="bg-surface-container-lowest border border-surface-container-high rounded-full px-2 py-1 font-label-md text-label-md text-on-surface outline-none"
                      >
                        {currencyOptions.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-headline-md text-headline-md text-on-surface">1 USD</span>
                      <span className="font-headline-md text-headline-md text-primary font-extrabold">
                        {ratesLoading ? "…" : rate ? `${formatFiat(rate)} ${currency}` : "—"}
                      </span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Pick any currency to see its live rate against USDC. Defaults to NGN.
                  </p>

                  {/* Settlement speed */}
                  <div className="flex items-center justify-between p-space-xs text-on-surface-variant font-body-sm text-body-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">bolt</span>
                      <span>Median settlement speed</span>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      {medianSpeed === null ? "—" : `~${medianSpeed < 10 ? medianSpeed.toFixed(1) : Math.round(medianSpeed)}s`}
                    </span>
                  </div>

                  <div className="pt-1 flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Settlement times</span>
                      <span className="text-primary font-semibold">
                        {settlement.length > 0 ? `${settlement.length} claimed` : "no data yet"}
                      </span>
                    </div>
                    <svg className="w-full h-10 text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 200 40">
                      <path
                        d={spark ? spark.line : "M0 20 L200 20"}
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                      />
                      <path d={spark ? spark.area : ""} fill="currentColor" fillOpacity="0.08" />
                    </svg>
                  </div>
                </div>

                {/* Safety */}
                <div className="bg-surface-container-high/60 p-space-md rounded-lg flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Escrowed on Arc
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      Funds held in the Tuma escrow contract until claimed.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Request cash modal */}
      {requestOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-md">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-[0_20px_32px_-8px_rgba(26,24,22,0.18)] p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary">call_received</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Request money</span>
              </div>
              <button
                onClick={() => setRequestOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Create a link. Anyone can open it and send you USDC to your {X_LOGO} handle.
            </p>

            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Your {X_LOGO} handle
              </span>
              <div className="flex items-center rounded-lg border border-surface-container-high bg-surface-container-low px-space-sm">
                <span className="text-on-surface-variant">@</span>
                <input
                  value={requestHandle}
                  onChange={(event) => setRequestHandle(event.target.value)}
                  placeholder="yourhandle"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full bg-transparent border-0 outline-none py-2 px-1 font-body-md text-body-md text-on-surface"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Amount (USDC)
              </span>
              <input
                value={requestAmount}
                onChange={(event) => setRequestAmount(event.target.value)}
                placeholder="25"
                inputMode="decimal"
                className="rounded-lg border border-surface-container-high bg-surface-container-low px-space-sm py-2 font-body-md text-body-md text-on-surface outline-none"
              />
            </label>

            <button
              onClick={generateRequest}
              disabled={!isValidHandle(normalizeHandle(requestHandle)) || !requestAmount.trim()}
              className="rounded-full bg-primary-container hover:bg-primary text-on-primary py-space-md font-label-lg text-label-lg transition-colors disabled:opacity-50"
            >
              Generate link
            </button>

            {requestLinkPreview ? (
              <div className="flex flex-col gap-space-sm">
                <div className="break-all rounded-lg bg-surface-container-low p-3 font-mono text-xs text-on-surface">
                  {requestLinkPreview}
                </div>
                <div className="flex gap-space-sm">
                  <button
                    onClick={() => copy(requestLinkPreview, "request")}
                    className="flex-1 rounded-full border border-surface-container-high py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container"
                  >
                    {requestCopied ? "Copied!" : "Copy link"}
                  </button>
                  <a
                    href={`https://x.com/intent/post?text=${encodeURIComponent(requestShareText)}&url=${encodeURIComponent(requestLinkPreview)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-full bg-primary-container text-on-primary py-2 text-center font-label-md text-label-md hover:bg-primary transition-colors"
                  >
                    Share on {X_LOGO}
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Connect wallet modal */}
      {pickerOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-md"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-surface-container-lowest rounded-lg shadow-[0_20px_32px_-8px_rgba(26,24,22,0.18)] p-space-lg flex flex-col gap-space-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">Connect a wallet</span>
              <button
                onClick={() => setPickerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {uniqueConnectors.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">No wallets detected.</p>
            ) : (
              uniqueConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={connecting}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-[11px] font-bold uppercase">
                    {connector.name.slice(0, 1)}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">
                    {connector.name}
                    {connector.name.toLowerCase().includes("zerion") ? " · recommended" : ""}
                  </span>
                </button>
              ))
            )}
            {connectError ? (
              <p className="font-body-sm text-body-sm text-error">{connectError}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Tumi chat + launcher */}
      <div
        className={`fixed bottom-24 right-6 w-80 bg-surface-container-lowest rounded-lg shadow-[0_20px_32px_-8px_rgba(26,24,22,0.18)] p-space-md z-50 transition-all duration-200 transform flex flex-col gap-space-sm ${
          chatOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between pb-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Tumi Chat" className="w-full h-full object-cover" src={TUMI_WAVING} />
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-bold">Ask Tumi</span>
              <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">● Always online</span>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="p-space-xs bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm">
          Hi{username ? ` ${username}` : ""}! Send USDC to any {X_LOGO} handle, or create a request link to get paid.
        </div>
        <div className="flex flex-col gap-1">
          <button className="text-left px-space-sm py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors">
            💡 How does claiming work?
          </button>
          <button className="text-left px-space-sm py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors">
            🔒 How is my money escrowed?
          </button>
        </div>
      </div>

      <button
        onClick={() => setChatOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm group"
      >
        <span className="bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_12px_28px_-6px_rgba(26,24,22,0.12)] flex items-center gap-space-xs border border-surface-container-highest transition-transform group-hover:scale-105">
          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          <span className="font-label-md text-label-md text-on-surface font-semibold">Need help? Ask Tumi!</span>
        </span>
        <span className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(26,24,22,0.16)] transition-transform group-hover:scale-110 active:scale-95">
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
        </span>
      </button>
    </div>
  );
}

function ActivityEmpty({
  title,
  body,
  cta,
  onCta,
}: {
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-xl flex flex-col items-center justify-center text-center shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)]">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low/50 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10 w-40 h-40 mb-space-md flex items-center justify-center">
        <div className="absolute inset-2 rounded-full bg-secondary-fixed/30 blur-xl"></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Tumi the mascot looking curious and ready to assist"
          className="relative z-10 w-full h-full object-contain drop-shadow-md"
          src={TUMI_CURIOUS}
        />
      </div>
      <div className="relative z-10 max-w-md flex flex-col items-center gap-space-xs mb-space-lg">
        <h3 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{title}</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">{body}</p>
      </div>
      {cta ? (
        onCta ? (
          <button
            onClick={onCta}
            className="relative z-10 inline-flex items-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-[0_4px_0_#d94623] hover:translate-y-0.5 transition-all"
          >
            <span>{cta}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        ) : (
          <Link
            href="/send"
            className="relative z-10 inline-flex items-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-[0_4px_0_#d94623] hover:translate-y-0.5 transition-all"
          >
            <span>{cta}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        )
      ) : null}
    </div>
  );
}
