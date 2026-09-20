"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { parseEventLogs, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  type Connector,
} from "wagmi";
import { TumaEscrowABI, erc20Abi } from "@/lib/abi";
import { ESCROW_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, arc, isEscrowConfigured } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { shortAddress } from "@/lib/format";
import { isValidHandle, normalizeHandle } from "@/lib/handles";

const X_LOGO = "𝕏";
const POPULAR = ["NGN", "KES", "GHS", "ZAR", "USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY"];

type Status = "idle" | "approving" | "sending" | "done";

type RateResponse = { base: string; rates: Record<string, number>; updatedAt: string | null };

async function fetchRates(): Promise<RateResponse> {
  const res = await fetch("/api/rates");
  if (!res.ok) throw new Error("Could not load exchange rates.");
  return (await res.json()) as RateResponse;
}

function formatFiat(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function trim(value: string): string {
  return value.includes(".") ? value.replace(/(\.\d{1,4})\d*$/, "$1") : value;
}

export function SendExperience() {
  const searchParams = useSearchParams();
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [handle, setHandle] = useState(() => searchParams.get("handle") ?? "");
  const [amount, setAmount] = useState(() => searchParams.get("amount") ?? "");
  const [currency, setCurrency] = useState("NGN");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [claim, setClaim] = useState<{ handle: string; id: string; amount: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const onArc = chainId === arc.id;
  const ready = isConnected && onArc;
  const normalized = normalizeHandle(handle);
  const handleValid = isValidHandle(normalized);

  const { data: balance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: !!address && onArc },
  });

  const { data: rateData } = useQuery({ queryKey: ["rates"], queryFn: fetchRates, staleTime: 3_600_000 });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: USDC_ADDRESS,
    functionName: "allowance",
    args: address ? [address, ESCROW_ADDRESS] : undefined,
    query: { enabled: !!address && onArc },
  });

  const { amountWei, amountError } = useMemo(() => {
    if (!amount.trim()) return { amountWei: null, amountError: null };
    try {
      const value = parseUnits(amount.trim(), USDC_DECIMALS);
      if (value <= 0n) return { amountWei: null, amountError: "Enter an amount greater than 0." };
      return { amountWei: value, amountError: null };
    } catch {
      return { amountWei: null, amountError: `Enter a valid amount (max ${USDC_DECIMALS} decimals).` };
    }
  }, [amount]);

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
  const allowanceKnown = allowance !== undefined;
  const needsApproval = allowanceKnown && amountWei !== null && allowance < amountWei;
  const busy = status === "approving" || status === "sending";
  const canSend = ready && handleValid && amountWei !== null && amountError === null && allowanceKnown && !busy;

  const amountNumber = Number(amount) || 0;
  const fiatPreview = rate ? amountNumber * rate : null;
  const balanceText = balance ? trim(balance.formatted) : null;

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const claimLink = claim ? `${origin}/claim/${claim.id}` : "";
  const shareText = claim
    ? `Hey @${claim.handle}, I sent you ${claim.amount} USDC on Tuma. Claim it here:`
    : "";

  async function handleConnect(connector: Connector) {
    setConnectError(null);
    try {
      await connectAsync({ connector });
      setPickerOpen(false);
    } catch (e) {
      setConnectError(friendlyError(e));
    }
  }

  async function handleSend() {
    if (!publicClient || amountWei === null) return;
    setError(null);
    try {
      if (needsApproval) {
        setStatus("approving");
        const approveHash = await writeContractAsync({
          abi: erc20Abi,
          address: USDC_ADDRESS,
          functionName: "approve",
          args: [ESCROW_ADDRESS, amountWei],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        await refetchAllowance();
      }

      setStatus("sending");
      const depositHash = await writeContractAsync({
        abi: TumaEscrowABI,
        address: ESCROW_ADDRESS,
        functionName: "deposit",
        args: [normalized, amountWei],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });

      const [deposited] = parseEventLogs({
        abi: TumaEscrowABI,
        logs: receipt.logs,
        eventName: "Deposited",
      });
      const id = deposited ? (deposited.args as { id: bigint }).id.toString() : undefined;
      if (!id) throw new Error("Payment sent, but the payment id could not be read.");

      setClaim({ handle: normalized, id, amount: amount.trim() });
      setStatus("done");
    } catch (e) {
      setStatus("idle");
      setError(friendlyError(e));
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(claimLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy automatically. Select the link and copy it manually.");
    }
  }

  function reset() {
    setClaim(null);
    setHandle("");
    setAmount("");
    setStatus("idle");
    setError(null);
    setCopied(false);
  }

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col px-space-md">
          <div className="flex items-center gap-space-sm px-space-sm mb-space-xl">
            <span className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">
              T
            </span>
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">Tuma</span>
          </div>
          <nav className="flex flex-col gap-space-xs">
            <Link
              href="/dashboard"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              <span className="font-label-lg text-label-lg">Home</span>
            </Link>
            <Link
              href="/send"
              className="flex items-center gap-space-md px-space-md py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm transition-all"
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
              <span className="font-headline-sm text-headline-sm text-on-surface">USDC / {currency}</span>
              <span className="font-label-md text-label-md text-primary font-bold">
                {rate ? formatFiat(rate) : "—"}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Escrow protects every send</span>
          </div>
        </div>
      </aside>

      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-64 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface">
                  Send to any {X_LOGO} handle · claim with one login
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_4px_12px_rgba(26,24,22,0.03)]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Balance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  {balanceText ? `${balanceText} USDC` : "—"}
                </span>
              </div>
              {ready ? (
                <button
                  onClick={() => disconnect()}
                  className="rounded-full border border-surface-container-high text-on-surface px-space-md py-space-xs font-label-lg text-label-lg hover:bg-surface-container transition-colors"
                >
                  {shortAddress(address)}
                </button>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start max-w-7xl mx-auto">
            {/* Left column */}
            <div className="lg:col-span-8 flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Send money</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Enter an {X_LOGO} handle and an amount. They claim it with one login.
                </p>
              </div>

              {!isEscrowConfigured ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-space-md font-body-md text-body-md text-amber-900">
                  The escrow contract is not deployed yet. Set{" "}
                  <code className="font-mono">NEXT_PUBLIC_ESCROW_ADDRESS</code> in{" "}
                  <code className="font-mono">.env.local</code>.
                </div>
              ) : null}

              {claim ? (
                <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-emerald-600 text-[28px]">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-headline-md text-on-surface">Payment created</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Share this link with <strong>@{claim.handle}</strong>. Only that {X_LOGO} account can claim it.
                      </span>
                    </div>
                  </div>
                  <div className="break-all rounded-lg bg-surface-container-low p-3 font-mono text-xs text-on-surface">
                    {claimLink}
                  </div>
                  <div className="flex flex-col gap-space-sm sm:flex-row">
                    <button
                      onClick={copyLink}
                      className="flex-1 rounded-full border border-surface-container-high py-space-md font-label-lg text-label-lg text-on-surface hover:bg-surface-container transition-colors"
                    >
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                    <a
                      href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(claimLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-full bg-primary-container text-on-primary py-space-md text-center font-label-lg text-label-lg hover:bg-primary transition-colors"
                    >
                      Share on {X_LOGO}
                    </a>
                  </div>
                  <button onClick={reset} className="self-start font-label-md text-label-md text-on-surface-variant underline">
                    Send another payment
                  </button>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-lg">
                  {/* Recipient */}
                  <label className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Recipient {X_LOGO} handle
                    </span>
                    <div className="flex items-center rounded-lg border border-surface-container-high bg-surface-container-low px-space-sm">
                      <span className="text-on-surface-variant">@</span>
                      <input
                        value={handle}
                        onChange={(event) => setHandle(event.target.value)}
                        placeholder="jack"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        className="w-full bg-transparent border-0 outline-none py-3 px-1 font-body-lg text-body-lg text-on-surface"
                      />
                    </div>
                    {handle && !handleValid ? (
                      <span className="font-body-sm text-body-sm text-error">
                        Handles are 1–15 letters, numbers or underscores.
                      </span>
                    ) : normalized ? (
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Claimable by @{normalized}
                      </span>
                    ) : null}
                  </label>

                  {/* Amount */}
                  <label className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Amount
                    </span>
                    <div className="flex items-center gap-space-sm">
                      <div className="flex flex-1 items-center rounded-lg border border-surface-container-high bg-surface-container-low px-space-sm">
                        <input
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="25"
                          inputMode="decimal"
                          autoComplete="off"
                          className="w-full bg-transparent border-0 outline-none py-3 px-1 font-body-lg text-body-lg text-on-surface"
                        />
                        <span className="font-label-md text-label-md text-on-surface-variant">USDC</span>
                      </div>
                      <select
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className="rounded-lg border border-surface-container-high bg-surface-container-low px-3 py-3 font-label-md text-label-md text-on-surface outline-none"
                      >
                        {currencyOptions.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span>Balance: {balanceText ?? "—"} USDC</span>
                      {fiatPreview !== null ? (
                        <span>
                          ≈ {formatFiat(fiatPreview)} {currency}
                        </span>
                      ) : null}
                    </div>
                    {amountError ? (
                      <span className="font-body-sm text-body-sm text-error">{amountError}</span>
                    ) : null}
                  </label>

                  {/* Warning */}
                  <div className="rounded-lg bg-surface-container-low p-space-sm font-body-sm text-body-sm text-on-surface-variant">
                    Only the {X_LOGO} account <strong>@{normalized || "handle"}</strong> can claim this. Double-check the
                    spelling. If unclaimed after 30 days you can refund it.
                  </div>

                  {/* Steps */}
                  <ol className="flex items-center gap-2 font-label-sm text-label-sm">
                    <li className={needsApproval ? "text-on-surface" : "text-on-surface-variant line-through"}>
                      1. Approve USDC
                    </li>
                    <li className="text-on-surface-variant">→</li>
                    <li className={needsApproval ? "text-on-surface-variant" : "text-on-surface"}>2. Send</li>
                  </ol>

                  {!ready ? (
                    isConnected && !onArc ? (
                      <button
                        onClick={() => switchChain({ chainId: arc.id })}
                        disabled={switching}
                        className="w-full rounded-full bg-primary-container text-on-primary py-space-md font-headline-sm text-headline-sm hover:bg-primary transition-colors"
                      >
                        {switching ? "Switching…" : "Switch to Arc Mainnet"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setPickerOpen(true)}
                        className="w-full rounded-full bg-primary-container text-on-primary py-space-md font-headline-sm text-headline-sm shadow-[0_4px_0_#d94623] hover:bg-primary transition-colors"
                      >
                        Connect your wallet
                      </button>
                    )
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!canSend}
                      className="w-full rounded-full bg-primary-container text-on-primary py-space-md font-headline-sm text-headline-sm shadow-[0_4px_0_#d94623] hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      {status === "approving"
                        ? "Approving…"
                        : status === "sending"
                          ? "Sending…"
                          : needsApproval
                            ? "Approve USDC"
                            : "Send USDC"}
                    </button>
                  )}

                  {error ? <p className="font-body-sm text-body-sm text-error">{error}</p> : null}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="lg:col-span-4 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] flex flex-col gap-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                  Your wallet
                </span>
                {ready ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-currency-display-mobile text-currency-display-mobile text-on-surface font-extrabold">
                      {balanceText ?? "0"} <span className="text-headline-sm text-on-surface-variant">USDC</span>
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                      {shortAddress(address, 6)} · {arc.name}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="rounded-full bg-primary-container text-on-primary py-space-sm font-label-lg text-label-lg hover:bg-primary transition-colors"
                  >
                    Connect your wallet
                  </button>
                )}
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                    Live rate
                  </span>
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Live
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-md text-headline-md text-on-surface">1 USDC</span>
                  <span className="font-headline-md text-headline-md text-primary font-extrabold">
                    {rate ? `${formatFiat(rate)} ${currency}` : "—"}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Rates via a free FX API. Change the currency in settings later.
                </span>
              </div>

              <div className="bg-surface-container-high/60 p-space-md rounded-lg flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md text-on-surface font-semibold">How it works</span>
                <ol className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                  <li>1. Approve and send USDC into escrow.</li>
                  <li>2. Share the claim link on {X_LOGO}.</li>
                  <li>3. They sign in with {X_LOGO} and claim — we pay the gas.</li>
                  <li>4. Unclaimed after 30 days? Refund from Activity.</li>
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Connect modal */}
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
            {uniqueConnectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={connecting}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-[11px] font-bold uppercase">
                  {connector.name.slice(0, 1)}
                </span>
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
