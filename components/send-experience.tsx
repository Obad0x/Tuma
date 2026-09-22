"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AppNav } from "./app-nav";
import { MobileTabBar } from "./mobile-tabbar";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { parseEventLogs, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  type Connector,
} from "wagmi";
import { TumaEscrowABI, erc20Abi } from "@/lib/abi";
import { ARC_EXPLORER, ESCROW_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, arc, isEscrowConfigured } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { fetchSenderPayments, type SenderPayment } from "@/lib/events";
import { shortAddress } from "@/lib/format";
import { isValidHandle, normalizeHandle } from "@/lib/handles";

const X_LOGO = "𝕏";
const POPULAR = ["NGN", "KES", "GHS", "ZAR", "USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY"];
const GAS_RESERVE = 0.1;

type Status = "idle" | "approving" | "sending";
type Result = { id: string; handle: string; amount: string; note: string; txHash: string };
type RateResponse = { base: string; rates: Record<string, number>; updatedAt: string | null };

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

function formatFiat(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function trim(value: string): string {
  return value.includes(".") ? value.replace(/(\.\d{1,4})\d*$/, "$1") : value;
}

function initials(handle: string): string {
  return handle.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "?";
}

function statusInfo(payment: SenderPayment): { label: string; dot: string } {
  if (payment.status === 1) return { label: "Claimed", dot: "bg-emerald-500" };
  if (payment.status === 2) return { label: "Refunded", dot: "bg-zinc-400" };
  if (payment.expired) return { label: "Expired", dot: "bg-amber-500" };
  return { label: "Open", dot: "bg-secondary-container" };
}

export function SendExperience() {
  const searchParams = useSearchParams();
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const initialHandle = searchParams.get("handle") ?? "";
  const initialAmount = searchParams.get("amount") ?? "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(() =>
    initialHandle && initialAmount ? 3 : initialHandle ? 2 : 1,
  );
  const [handle, setHandle] = useState(initialHandle);
  const [amount, setAmount] = useState(initialAmount);
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
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

  const { data: payments } = useQuery({
    queryKey: ["send-recipients", address, chainId],
    queryFn: () => fetchSenderPayments(publicClient!, address!),
    enabled: !!publicClient && !!address && onArc,
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

  const { recipients, recent } = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const payment of payments ?? []) {
      if (!seen.has(payment.handle)) {
        seen.add(payment.handle);
        list.push(payment.handle);
      }
    }
    return { recipients: list.slice(0, 4), recent: (payments ?? []).slice(0, 4) };
  }, [payments]);

  const rate = rateData?.rates?.[currency] ?? null;
  const balanceText = balance ? trim(balance.formatted) : null;
  const balanceNumber = balance ? Number(balance.formatted) : 0;
  const maxUsdc = Math.max(0, balanceNumber - GAS_RESERVE);
  const amountNumber = Number(amount) || 0;
  const fiatPreview = rate ? amountNumber * rate : null;
  const overBalance = balance ? amountNumber > balanceNumber : false;

  const allowanceKnown = allowance !== undefined;
  const needsApproval = allowanceKnown && amountWei !== null && allowance < amountWei;
  const busy = status === "approving" || status === "sending";
  const canConfirm = ready && handleValid && amountWei !== null && amountError === null && !overBalance && !busy;

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const claimLink = result ? `${origin}/claim/${result.id}` : "";
  const shareText = result
    ? `Hey @${result.handle}, I sent you ${result.amount} USDC on Tuma. Claim it here:`
    : "";

  function reset() {
    setStep(1);
    setHandle("");
    setAmount("");
    setNote("");
    setStatus("idle");
    setError(null);
    setResult(null);
    setCopied(false);
  }

  function pressDigit(digit: string) {
    setAmount((current) => {
      if (digit === "." && current.includes(".")) return current;
      return `${current}${digit}`;
    });
  }

  function pressBackspace() {
    setAmount((current) => current.slice(0, -1));
  }

  function addAmount(value: number) {
    setAmount(String(Number((amountNumber + value).toFixed(2))));
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

  async function confirm() {
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

      // Cache the payment + deposit tx hash in the database (no-op if unset).
      if (address) {
        void fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            escrowId: id,
            sender: address,
            handle: normalized,
            amountWei: amountWei.toString(),
            amountUsdc: amount.trim(),
            expiry: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            depositTxHash: depositHash,
            depositBlock: Number(receipt.blockNumber),
            note,
          }),
        }).catch(() => undefined);
      }

      setResult({ id, handle: normalized, amount: amount.trim(), note, txHash: depositHash });
      setStatus("idle");
      setStep(4);
    } catch (e) {
      setStatus("idle");
      setError(friendlyError(e));
    }
  }

  async function copyClaimLink() {
    try {
      await navigator.clipboard.writeText(claimLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy automatically. Select the link and copy it manually.");
    }
  }

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 hidden flex-col justify-between lg:flex py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <AppNav active="send" />
        <div className="px-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Live rate</span>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">USDC / {currency}</span>
              <span className="font-label-md text-label-md text-primary font-bold">{rate ? formatFiat(rate) : "—"}</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Escrow protects every send</span>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Header */}
        <header className="fixed left-0 right-0 top-0 lg:left-64 h-20 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface">
                FX Live: 1 USD = {rate ? formatFiat(rate) : "…"} {currency}
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_4px_12px_rgba(26,24,22,0.03)]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Balance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{balanceText ? `${balanceText} USDC` : "—"}</span>
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

        <main className="w-full pt-20 px-4 pb-28 lg:px-space-xl lg:pb-space-xl flex-1 bg-background">
          <div className="flex flex-col w-full max-w-5xl mx-auto pb-12">
            {!isEscrowConfigured ? (
              <div className="mb-space-lg rounded-lg bg-amber-50 border border-amber-200 p-space-md font-body-md text-body-md text-amber-900">
                The escrow contract is not deployed yet. Set <code className="font-mono">NEXT_PUBLIC_ESCROW_ADDRESS</code> in <code className="font-mono">.env.local</code>.
              </div>
            ) : null}

            {/* Stepper header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
              <div className="flex items-center gap-space-sm">
                {step > 1 && step < 4 ? (
                  <button onClick={() => setStep((s) => (s === 3 ? 2 : 1))} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                ) : null}
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                      {step === 4 ? "Complete" : `Step ${step} of 4`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {step === 1 ? "Recipient" : step === 2 ? "Amount" : step === 3 ? "Review" : "Sent"}
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    {step === 1 ? "Who are you sending to?" : step === 2 ? "How much?" : step === 3 ? "Review your transfer" : "Sent!"}
                  </h1>
                </div>
              </div>

              <Stepper step={step} />
            </div>

            {step === 1 ? (
              <StepRecipient
                handle={handle}
                setHandle={setHandle}
                valid={handleValid}
                recipients={recipients}
                recent={recent}
                onContinue={() => setStep(2)}
              />
            ) : null}

            {step === 2 ? (
              <StepAmount
                handle={normalized}
                amount={amount}
                setAmount={setAmount}
                note={note}
                setNote={setNote}
                currency={currency}
                setCurrency={setCurrency}
                currencyOptions={currencyOptions}
                rate={rate}
                balanceText={balanceText}
                maxUsdc={maxUsdc}
                fiatPreview={fiatPreview}
                amountError={amountError}
                overBalance={overBalance}
                onAdd={addAmount}
                onDigit={pressDigit}
                onBackspace={pressBackspace}
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
                canContinue={handleValid && amountWei !== null && amountError === null && !overBalance}
              />
            ) : null}

            {step === 3 ? (
              <StepReview
                handle={normalized}
                amount={amount}
                note={note}
                currency={currency}
                rate={rate}
                balanceText={balanceText}
                address={address}
                ready={ready}
                isConnected={isConnected}
                onArc={onArc}
                needsApproval={needsApproval}
                status={status}
                error={error}
                canConfirm={canConfirm}
                onConfirm={confirm}
                onConnect={() => setPickerOpen(true)}
                onSwitch={() => switchChain({ chainId: arc.id })}
                switching={switching}
                onBack={() => setStep(2)}
              />
            ) : null}

            {step === 4 && result ? (
              <StepSent
                result={result}
                claimLink={claimLink}
                shareText={shareText}
                rate={rate}
                currency={currency}
                copied={copied}
                onCopy={copyClaimLink}
                onReset={reset}
              />
            ) : null}
          </div>
        </main>
      </div>
      <MobileTabBar active="send" />

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
            {uniqueConnectors.map((connector) => (
              <button key={connector.id} onClick={() => handleConnect(connector)} disabled={connecting} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-surface-container-low transition-colors disabled:opacity-50">
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

function Stepper({ step }: { step: number }) {
  const labels = ["Recipient", "Amount", "Review", "Sent"];
  return (
    <div className="flex items-center gap-2 bg-surface-container-low px-space-md py-space-sm rounded-full shadow-sm">
      {labels.map((label, index) => {
        const n = index + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="flex items-center gap-2">
            {index > 0 ? (
              <span className={`w-5 h-0.5 rounded-full ${done || active ? "bg-primary-container" : "bg-surface-container-highest"}`}></span>
            ) : null}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold ${
                  done || active
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {done ? <span className="material-symbols-outlined text-[14px]">check</span> : n}
              </span>
              <span className={`font-label-md text-label-md hidden sm:inline ${active ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TumiTip({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_12px_28px_-6px_rgba(26,24,22,0.06)] relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="flex items-start gap-space-md relative z-10">
        <span className="w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined">smart_toy</span>
        </span>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-1">{body}</p>
        </div>
      </div>
    </div>
  );
}

function StepRecipient({
  handle,
  setHandle,
  valid,
  recipients,
  recent,
  onContinue,
}: {
  handle: string;
  setHandle: (value: string) => void;
  valid: boolean;
  recipients: string[];
  recent: SenderPayment[];
  onContinue: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
      <div className="lg:col-span-8 flex flex-col gap-space-lg">
        <p className="font-body-lg text-body-lg text-on-surface-variant -mt-2 max-w-2xl">
          Enter the {X_LOGO} handle you&apos;re sending to. They claim the USDC with one login — no wallet needed until then.
        </p>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)]">
          <div className="relative flex items-center bg-surface-container-low rounded-full px-space-md py-space-sm shadow-inner transition-all focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_3px_rgba(255,90,54,0.2)]">
            <span className="font-headline-sm text-headline-sm text-primary-container mr-space-sm">{X_LOGO}</span>
            <span className="text-on-surface-variant mr-1">@</span>
            <input
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="search a handle..."
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full bg-transparent outline-none font-headline-sm text-headline-sm text-on-surface placeholder:text-outline placeholder:font-body-md"
            />
            {handle ? (
              <button onClick={() => setHandle("")} className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-space-xs mt-space-md">
            <span className="px-space-md py-space-xs rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-sm">Recent sends</span>
            {recipients.length === 0 ? (
              <span className="font-body-sm text-body-sm text-on-surface-variant">No recent handles yet.</span>
            ) : (
              recipients.map((recipient) => (
                <button key={recipient} onClick={() => setHandle(recipient)} className="px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">
                  @{recipient}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between px-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Selected destination</span>
            <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> {X_LOGO} handle
            </span>
          </div>
          <div className="relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_20px_32px_-8px_rgba(255,90,54,0.12),0_8px_16px_-4px_rgba(26,24,22,0.03)] bg-gradient-to-r from-surface-container-lowest via-primary-fixed/20 to-surface-container-lowest">
            {valid ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary font-headline-md text-headline-md flex items-center justify-center font-bold shadow-md">
                    {initials(handle)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <span className="font-headline-md text-headline-md text-on-surface font-bold">@{normalizeHandle(handle)}</span>
                      <span className="px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold tracking-wide">VERIFIED FORMAT</span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[15px] text-outline">info</span>
                      Only this {X_LOGO} account can claim the payment
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary px-space-md py-1.5 rounded-full font-label-md text-label-md shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Selected</span>
                </div>
              </div>
            ) : (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {handle ? "Handles are 1–15 letters, numbers or underscores." : "Type a handle above to continue."}
              </p>
            )}
          </div>
        </div>

        {recent.length > 0 ? (
          <div className="flex flex-col gap-space-sm mt-space-sm">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Recent payments</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">From your wallet</span>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] overflow-hidden">
              {recent.map((payment, index) => {
                const info = statusInfo(payment);
                return (
                  <div key={payment.id}>
                    {index > 0 ? <div className="h-px bg-surface-container-low mx-space-md"></div> : null}
                    <button onClick={() => setHandle(payment.handle)} className="w-full flex items-center justify-between p-space-md hover:bg-surface-container-low/60 transition-colors text-left">
                      <div className="flex items-center gap-space-md min-w-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-sm font-bold ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}>
                          {initials(payment.handle)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">@{payment.handle}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{payment.amount} USDC • {info.label}</span>
                        </div>
                      </div>
                      <span className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex items-center justify-between">
          <Link href="/dashboard" className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span> Back to overview
          </Link>
          <button onClick={onContinue} disabled={!valid} className="px-space-xl py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold shadow-[0_12px_24px_-6px_rgba(255,90,54,0.35)] hover:bg-primary transition-all active:translate-y-0.5 flex items-center gap-2 disabled:opacity-50">
            <span>Continue to amount</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-space-lg">
        <TumiTip
          title="Sending to a handle?"
          body={`Tuma holds the USDC in an on-chain escrow. @${normalizeHandle(handle) || "them"} proves ownership by signing in with ${X_LOGO}, and we release the funds — gas included.`}
        />
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Escrow protected</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Funds are held by the TumaEscrow contract on Arc. If it isn&apos;t claimed in 30 days, you can refund it from Activity.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepAmount({
  handle,
  amount,
  setAmount,
  note,
  setNote,
  currency,
  setCurrency,
  currencyOptions,
  rate,
  balanceText,
  maxUsdc,
  fiatPreview,
  amountError,
  overBalance,
  onAdd,
  onDigit,
  onBackspace,
  onBack,
  onContinue,
  canContinue,
}: {
  handle: string;
  amount: string;
  setAmount: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  currencyOptions: string[];
  rate: number | null;
  balanceText: string | null;
  maxUsdc: number;
  fiatPreview: number | null;
  amountError: string | null;
  overBalance: boolean;
  onAdd: (value: number) => void;
  onDigit: (value: string) => void;
  onBackspace: () => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}) {
  const TAG_OPTIONS = ["🍕 Lunch", "🎁 Gift", "💡 Bills", "❤️ Love", "🎈 Celebration"];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
      <div className="lg:col-span-7 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-headline-sm font-bold">{initials(handle)}</div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">@{handle}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Claim with one {X_LOGO} login</span>
            </div>
          </div>
          <button onClick={onBack} className="px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center gap-1">
            <span>Change</span>
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col items-center justify-center relative overflow-hidden">
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="absolute top-space-md right-space-md bg-surface-container-low rounded-full px-space-md py-space-xs font-label-md text-label-md text-on-surface font-bold outline-none">
            {currencyOptions.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-space-sm">Transfer amount</span>
          <div className="flex items-baseline justify-center gap-space-xs my-space-sm text-on-surface select-none">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              inputMode="decimal"
              className="font-display-hero text-display-hero tracking-tight font-black text-primary bg-transparent text-center outline-none w-full max-w-[280px]"
            />
            <span className="font-headline-md text-headline-md text-on-surface-variant font-bold">USDC</span>
            <span className="w-1 h-10 bg-primary-container animate-pulse rounded-full ml-1"></span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low px-space-md py-space-xs rounded-full mt-space-xs mb-space-lg">
            <span className="w-2 h-2 rounded-full bg-[#1b873f]"></span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Available: <strong className="text-on-surface font-semibold">{balanceText ?? "—"} USDC</strong>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-space-sm w-full max-w-md">
            <button onClick={() => onAdd(1)} className="py-space-sm rounded-full bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed transition-all font-label-md text-label-md text-on-surface text-center font-bold active:scale-95 shadow-sm">+1</button>
            <button onClick={() => onAdd(5)} className="py-space-sm rounded-full bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed transition-all font-label-md text-label-md text-on-surface text-center font-bold active:scale-95 shadow-sm">+5</button>
            <button onClick={() => onAdd(10)} className="py-space-sm rounded-full bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed transition-all font-label-md text-label-md text-on-surface text-center font-bold active:scale-95 shadow-sm">+10</button>
            <button onClick={() => setAmount(String(Number(maxUsdc.toFixed(2))))} className="py-space-sm rounded-full bg-secondary-container text-on-secondary-container hover:brightness-95 transition-all font-label-md text-label-md text-center font-bold active:scale-95 shadow-sm">Max</button>
          </div>
          {amountError ? <p className="mt-space-sm font-body-sm text-body-sm text-error">{amountError}</p> : null}
          {overBalance ? <p className="mt-space-sm font-body-sm text-body-sm text-error">That&apos;s more than your balance ({balanceText} USDC).</p> : null}
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
          <label className="flex flex-col gap-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Add a message (optional)</span>
            <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-sm rounded-full">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chat_bubble_outline</span>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="What's this for?" className="bg-transparent border-0 outline-none text-on-surface font-body-md text-body-md w-full placeholder:text-on-surface-variant" />
              {note ? (
                <button onClick={() => setNote("")} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              ) : null}
            </div>
          </label>
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Add occasion badge</span>
            <div className="flex flex-wrap gap-space-xs">
              {TAG_OPTIONS.map((tag) => (
                <button key={tag} onClick={() => setNote(tag)} className="px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all active:scale-95">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-space-md pt-space-xs">
          <button onClick={onBack} className="px-space-lg py-space-md rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all font-label-lg text-label-lg flex items-center gap-2 shadow-[0_4px_12px_rgba(26,24,22,0.03)]">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back</span>
          </button>
          <button onClick={onContinue} disabled={!canContinue} className="flex-1 py-space-md px-space-xl rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm shadow-[0_20px_32px_-8px_rgba(255,90,54,0.38)] active:translate-y-0.5 hover:brightness-105 transition-all disabled:opacity-50">
            <span>Continue to review</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Live conversion</span>
            <span className="px-space-sm py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm font-bold">Live rate</span>
          </div>
          <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Recipient gets</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                {fiatPreview !== null ? `${formatFiat(fiatPreview)} ${currency}` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Live rate</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">1 USDC = {rate ? formatFiat(rate) : "—"} {currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Transfer fee</span>
              <span className="font-label-md text-label-md text-[#1b873f] font-bold">$0.00</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            The recipient receives USDC; the local amount is a live estimate for reference only.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant text-center mb-1">Tactile pad</span>
          <div className="grid grid-cols-3 gap-space-xs text-center font-headline-md text-headline-md font-bold text-on-surface">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((key) => (
              <button key={key} onClick={() => onDigit(key)} className="h-12 rounded-full bg-surface-container-low hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center">{key}</button>
            ))}
            <button onClick={onBackspace} className="h-12 rounded-full bg-surface-container-low hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">backspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReview({
  handle,
  amount,
  note,
  currency,
  rate,
  balanceText,
  address,
  ready,
  isConnected,
  onArc,
  needsApproval,
  status,
  error,
  canConfirm,
  onConfirm,
  onConnect,
  onSwitch,
  switching,
  onBack,
}: {
  handle: string;
  amount: string;
  note: string;
  currency: string;
  rate: number | null;
  balanceText: string | null;
  address?: `0x${string}`;
  ready: boolean;
  isConnected: boolean;
  onArc: boolean;
  needsApproval: boolean;
  status: Status;
  error: string | null;
  canConfirm: boolean;
  onConfirm: () => void;
  onConnect: () => void;
  onSwitch: () => void;
  switching: boolean;
  onBack: () => void;
}) {
  const amountNumber = Number(amount) || 0;
  const fiat = rate ? amountNumber * rate : null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
      <div className="lg:col-span-7 flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)]">
          <div className="flex items-center justify-between pb-space-lg mb-space-lg bg-surface-container-low/60 -mx-space-xl -mt-space-xl px-space-xl pt-space-xl">
            <div className="flex items-center gap-space-md">
              <div className="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed font-headline-sm flex items-center justify-center shadow-sm font-bold">{initials(handle)}</div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">@{handle}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Claims with one {X_LOGO} login</span>
              </div>
            </div>
            <button onClick={onBack} className="px-space-md py-1.5 rounded-full bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-md transition-colors">Edit</button>
          </div>

          <div className="flex flex-col items-center justify-center py-space-md text-center">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-1">Transfer amount</span>
            <div className="font-currency-display text-currency-display text-on-surface font-extrabold tracking-tight">
              {amountNumber.toLocaleString("en-US", { maximumFractionDigits: 4 })} <span className="text-headline-md text-on-surface-variant">USDC</span>
            </div>
            {fiat !== null ? <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">≈ {formatFiat(fiat)} {currency}</p> : null}
            {note ? (
              <div className="mt-space-sm inline-flex items-center gap-2 px-space-md py-1 rounded-full bg-surface-container text-on-surface font-body-sm">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chat_bubble</span>
                <span>{note}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-space-lg pt-space-lg flex flex-col gap-space-md bg-surface-container-low/40 rounded-lg p-space-md">
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Protocol fee</span>
              <span className="font-body-sm text-body-sm text-[#1b873f] font-semibold">$0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Delivery</span>
              <span className="flex items-center gap-1.5 font-body-sm text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                <span className="font-semibold">Instant on release (~seconds)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Corridor</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">USDC on {arc.name}</span>
            </div>
            <div className="my-space-xs h-[1px] bg-surface-container-highest"></div>
            <div className="flex items-baseline justify-between pt-space-xs">
              <div>
                <span className="font-label-lg text-label-lg text-on-surface block">You send</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Gas paid from your wallet</span>
              </div>
              <span className="font-headline-lg text-headline-lg text-primary font-bold">{amountNumber.toLocaleString("en-US", { maximumFractionDigits: 4 })} USDC</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-space-md flex items-center gap-space-md">
          <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px] text-on-surface">lock</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface font-semibold">Escrowed on Arc</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Held by the TumaEscrow contract until @{handle} claims it. Refundable after 30 days.</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Funding source</span>
          <div className="flex items-center gap-space-md p-space-md rounded-lg bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">{ready ? "Connected wallet" : "Wallet not connected"}</span>
                {address ? <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-mono">{shortAddress(address, 4)}</span> : null}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {balanceText ? `${balanceText} USDC available` : "Connect to see your balance"}
              </span>
            </div>
          </div>
          <div className="p-space-md rounded-lg bg-surface-container/60 flex flex-col gap-2">
            <div className="flex items-center justify-between font-label-md text-label-md">
              <span className="text-on-surface-variant">Estimated balance after</span>
              <span className="text-on-surface font-bold font-mono">
                {balanceText ? `${Math.max(0, Number(balanceText) - amountNumber).toFixed(4)} USDC` : "—"}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: balanceText ? `${Math.min(100, (Number(balanceText) - amountNumber) / Math.max(1, Number(balanceText)) * 100)}%` : "0%" }}></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm text-on-surface">
            <span className="material-symbols-outlined text-[22px] text-primary">fingerprint</span>
            <span className="font-headline-sm text-headline-sm">Authorization</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {needsApproval
              ? "Two signatures: approve the escrow to spend USDC, then deposit. Your wallet will prompt you."
              : "Confirming will deposit your USDC into the escrow contract."}
          </p>

          {!ready ? (
            isConnected && !onArc ? (
              <button onClick={onSwitch} disabled={switching} className="w-full h-14 bg-primary-container text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-space-sm shadow-[0_4px_0_#d94623] hover:brightness-105 transition-all">
                <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
                <span>{switching ? "Switching…" : "Switch to Arc Mainnet"}</span>
              </button>
            ) : (
              <button onClick={onConnect} className="w-full h-14 bg-primary-container text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-space-sm shadow-[0_4px_0_#d94623] hover:brightness-105 transition-all">
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
                <span>Connect your wallet</span>
              </button>
            )
          ) : (
            <button onClick={onConfirm} disabled={!canConfirm} className="w-full h-14 bg-primary-container text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-space-sm shadow-[0_4px_0_#d94623] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60">
              <span className="material-symbols-outlined text-[22px]">{needsApproval ? "lock_open" : "send"}</span>
              <span>
                {status === "approving"
                  ? "Approving…"
                  : status === "sending"
                    ? "Depositing…"
                    : needsApproval
                      ? `Approve & send ${amountNumber.toLocaleString("en-US", { maximumFractionDigits: 4 })} USDC`
                      : `Confirm & send ${amountNumber.toLocaleString("en-US", { maximumFractionDigits: 4 })} USDC`}
              </span>
            </button>
          )}

          <button onClick={onBack} className="w-full h-12 rounded-full bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-lg transition-colors">
            Back to edit amount
          </button>
          {error ? <p className="font-body-sm text-body-sm text-error">{error}</p> : null}
          <div className="flex items-center justify-center gap-1.5 pt-space-xs text-on-surface-variant/80 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>Escrow contract: {shortAddress(ESCROW_ADDRESS, 4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepSent({
  result,
  claimLink,
  shareText,
  rate,
  currency,
  copied,
  onCopy,
  onReset,
}: {
  result: Result;
  claimLink: string;
  shareText: string;
  rate: number | null;
  currency: string;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
}) {
  const amountNumber = Number(result.amount) || 0;
  const fiat = rate ? amountNumber * rate : null;
  return (
    <div className="max-w-[760px] mx-auto w-full flex flex-col items-center gap-space-lg">
      <div className="relative w-full bg-surface-container-lowest rounded-lg p-space-xl shadow-[0_20px_32px_-8px_rgba(255,90,54,0.08),0_8px_16px_-4px_rgba(26,24,22,0.03)] flex flex-col items-center text-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-2 rounded-full bg-surface-container scale-95 animate-pulse"></div>
            <span className="relative z-10 material-symbols-outlined text-[96px] text-secondary">celebration</span>
          </div>
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-md text-label-md uppercase tracking-wider mb-space-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            Transfer created
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Sent!</h1>
          <div className="mt-space-xs font-currency-display text-currency-display text-primary font-extrabold tracking-tight">
            {amountNumber.toLocaleString("en-US", { maximumFractionDigits: 4 })} USDC
          </div>
          {fiat !== null ? <p className="font-body-sm text-body-sm text-on-surface-variant">≈ {formatFiat(fiat)} {currency}</p> : null}
          <div className="mt-space-xs flex items-center justify-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface">to</span>
            <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full shadow-sm">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">{initials(result.handle).slice(0, 1)}</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">@{result.handle}</span>
            </div>
          </div>
          {result.note ? (
            <div className="mt-space-md inline-flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-full text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">chat_bubble</span>
              <span>“{result.note}”</span>
            </div>
          ) : null}
          <a href={`${ARC_EXPLORER}/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer" className="mt-space-md inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-highest/60 text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>View deposit on Arc Explorer</span>
          </a>
        </div>
      </div>

      {/* Claim link */}
      <div className="w-full bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[20px]">link</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">Claim link</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Share it with @{result.handle} on {X_LOGO}</span>
            </div>
          </div>
        </div>
        <div className="break-all rounded-lg bg-surface-container-low p-3 font-mono text-xs text-on-surface">{claimLink}</div>
        <div className="flex flex-col sm:flex-row gap-space-sm">
          <button onClick={onCopy} className="flex-1 rounded-full border border-surface-container-high py-space-md font-label-lg text-label-lg text-on-surface hover:bg-surface-container transition-colors">
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(claimLink)}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-primary-container text-on-primary py-space-md text-center font-label-lg text-label-lg hover:bg-primary transition-colors">
            Share on {X_LOGO}
          </a>
        </div>
      </div>

      {/* Receipt */}
      <div className="w-full bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-sm">
        <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-DEFAULT">
          <span className="font-body-md text-body-md text-on-surface-variant">Escrowed by</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">TumaEscrow on {arc.name}</span>
        </div>
        <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-DEFAULT">
          <span className="font-body-md text-body-md text-on-surface-variant">Recipient gets</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">{amountNumber.toLocaleString("en-US", { maximumFractionDigits: 4 })} USDC</span>
        </div>
        <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-DEFAULT">
          <span className="font-body-md text-body-md text-on-surface-variant">Protocol fee</span>
          <span className="font-headline-sm text-headline-sm text-[#1b873f]">$0.00</span>
        </div>
        <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-DEFAULT">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Payment ID</span>
          <span className="font-headline-md text-headline-md text-primary font-bold">#{result.id}</span>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center gap-space-md mt-space-xs pb-space-lg">
        <Link href="/dashboard" className="w-full sm:flex-1 h-14 bg-primary-container text-on-primary font-headline-sm text-headline-sm rounded-full flex items-center justify-center gap-space-sm shadow-[0_4px_0_#D63F1D] active:translate-y-[2px] active:shadow-[0_2px_0_#D63F1D] transition-all">
          <span>Done</span>
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
        </Link>
        <button onClick={onReset} className="w-full sm:flex-1 h-14 bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm rounded-full flex items-center justify-center gap-space-sm shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] hover:bg-surface-container-low transition-all">
          <span className="material-symbols-outlined text-[20px] text-primary">send</span>
          <span>Send another</span>
        </button>
        <Link href="/payments" className="w-full sm:w-auto h-14 px-space-lg bg-surface-container-high text-on-surface font-headline-sm text-headline-sm rounded-full flex items-center justify-center gap-space-xs hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-[20px]">history</span>
          <span className="hidden md:inline">Ledger</span>
        </Link>
      </div>
    </div>
  );
}
