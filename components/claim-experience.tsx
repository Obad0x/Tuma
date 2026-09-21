"use client";

import { useQuery } from "@tanstack/react-query";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { isAddress } from "viem";
import { useAccount, useConnect, type Connector } from "wagmi";
import { ARC_EXPLORER } from "@/lib/arc";
import type { PaymentView } from "@/lib/chain";
import { shortAddress } from "@/lib/format";

const X_LOGO = "𝕏";

type PaymentRecord = {
  persisted: boolean;
  depositTxHash?: string;
  releaseTxHash?: string;
  refundTxHash?: string;
};

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-xl shadow-[0_20px_40px_-15px_rgba(26,24,22,0.07)] relative">
        {children}
      </div>
    </div>
  );
}

export function ClaimExperience({
  id,
  payment,
  loadError,
}: {
  id: string;
  payment: PaymentView | null;
  loadError: boolean;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  const [recipient, setRecipient] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { data: record } = useQuery<PaymentRecord>({
    queryKey: ["payment-record", id],
    queryFn: async () => {
      const res = await fetch(`/api/payments/${id}`);
      return (await res.json()) as PaymentRecord;
    },
    enabled: !!id,
    staleTime: 60_000,
  });

  const username = session?.user?.username?.toLowerCase() ?? null;
  const target = recipient.trim() || address || "";
  const validTarget = isAddress(target);
  const depositTx = record?.persisted ? record.depositTxHash : undefined;

  async function claim() {
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
        setConfirmOpen(false);
        return;
      }
      setTxHash(data.txHash);
      setConfirmOpen(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(26,24,22,0.03)]">
        <div className="h-20 max-w-7xl mx-auto px-gutter-desktop flex items-center justify-between">
          <Link href="/" className="flex items-center gap-space-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Tuma" className="h-8 w-auto object-contain" src="/images/tuma-logo.jpg" />
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight hidden sm:inline">Tuma</span>
          </Link>
          <div className="flex items-center gap-space-md">
            {username ? (
              <button onClick={() => signOut({ callbackUrl: window.location.href })} className="rounded-full bg-surface-container px-space-md py-space-sm font-label-lg text-label-lg text-on-surface hover:bg-surface-container-high transition-colors">
                @{username} · sign out
              </button>
            ) : (
              <button onClick={() => signIn("twitter", { callbackUrl: window.location.href })} className="rounded-full bg-primary-container text-on-primary px-space-lg py-space-sm font-label-lg text-label-lg shadow-[0_4px_0_#b52603] hover:bg-primary transition-colors">
                Sign in with {X_LOGO}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-background flex-1">
        <section className="w-full relative px-gutter py-space-lg md:py-space-xl overflow-hidden flex flex-col items-center">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary-container/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {loadError ? (
            <Card>
              <div className="flex flex-col items-center text-center gap-space-sm py-space-lg">
                <span className="material-symbols-outlined text-[48px] text-error">error</span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Could not load this payment</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Check your connection and refresh the page.</p>
              </div>
            </Card>
          ) : !payment ? (
            <ExpiredState reason="not-found" />
          ) : txHash ? (
            <SuccessState amount={payment.amount} handle={payment.handle} target={target} txHash={txHash} />
          ) : payment.status === 1 ? (
            <ExpiredState reason="claimed" />
          ) : payment.status === 2 ? (
            <ExpiredState reason="refunded" />
          ) : payment.expired ? (
            <ExpiredState reason="expired" />
          ) : sessionStatus === "loading" ? (
            <Card>
              <p className="font-body-md text-body-md text-on-surface-variant text-center py-space-lg">Checking your {X_LOGO} session…</p>
            </Card>
          ) : !username ? (
            <SignInState payment={payment} />
          ) : username !== payment.handle.toLowerCase() ? (
            <WrongAccountState payment={payment} username={username} />
          ) : (
            <ClaimCard
              payment={payment}
              depositTx={depositTx}
              recipient={recipient}
              setRecipient={setRecipient}
              target={target}
              validTarget={validTarget}
              isConnected={isConnected}
              connectors={connectors}
              onConnect={() => connect({ connector: connectors[0] })}
              onClaim={() => setConfirmOpen(true)}
              error={error}
            />
          )}

          {/* Metric strip */}
          <div className="max-w-4xl mx-auto w-full mt-space-xl pt-space-lg grid grid-cols-2 md:grid-cols-4 gap-space-md text-center">
            {[
              { label: "Settlement", value: "On Arc" },
              { label: "Claim fee", value: "$0.00" },
              { label: "Gas", value: "We pay it" },
              { label: "Custody", value: "Escrow" },
            ].map((metric) => (
              <div key={metric.label} className="p-space-md rounded-lg bg-surface-container-low">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">{metric.label}</span>
                <span className="font-headline-md text-headline-md text-on-surface font-black">{metric.value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Confirm modal */}
      {confirmOpen && payment ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-md" onClick={() => setConfirmOpen(false)}>
          <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_20px_40px_-15px_rgba(26,24,22,0.2)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Confirm instant claim</span>
              </div>
              <button onClick={() => setConfirmOpen(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="text-center mb-space-md">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Total to settle</span>
              <div className="font-currency-display text-currency-display text-primary font-black">{payment.amount} USDC</div>
            </div>
            <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-3 font-body-sm text-body-sm mb-space-md">
              <div className="flex items-center justify-between"><span className="text-on-surface-variant">Recipient</span><span className="font-medium text-on-surface font-mono">{shortAddress(target, 6)}</span></div>
              <div className="flex items-center justify-between"><span className="text-on-surface-variant">Originator</span><span className="font-medium text-on-surface font-mono">{shortAddress(payment.sender, 4)}</span></div>
              <div className="flex items-center justify-between"><span className="text-on-surface-variant">Claim fee</span><span className="font-bold text-emerald-600">$0.00</span></div>
              <div className="flex items-center justify-between"><span className="text-on-surface-variant">Availability</span><span className="font-bold text-on-surface flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-container"></span> Instant on Arc</span></div>
            </div>
            {error ? <p className="font-body-sm text-body-sm text-error mb-space-sm">{error}</p> : null}
            <button onClick={claim} disabled={claiming} className="w-full h-14 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-[0_4px_0_#b52603] hover:bg-primary transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">check</span>
              {claiming ? "Releasing…" : "Confirm & credit my wallet"}
            </button>
            <button onClick={() => setConfirmOpen(false)} className="w-full h-10 text-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface">
              Cancel and return
            </button>
          </div>
        </div>
      ) : null}

      {/* Tumi widget */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-space-sm">
        <span className="bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_12px_28px_-6px_rgba(26,24,22,0.12)] flex items-center gap-space-xs border border-surface-container-highest">
          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          <span className="font-label-md text-label-md text-on-surface font-semibold">Need help? Ask Tumi!</span>
        </span>
        <span className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(26,24,22,0.16)]">
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
        </span>
      </div>
    </div>
  );
}

function SenderRow({ payment }: { payment: PaymentView }) {
  return (
    <div className="mt-space-lg bg-surface-container-low rounded-lg p-space-md flex items-center justify-between">
      <div className="flex items-center gap-space-sm">
        <span className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-mono text-sm text-on-surface">
          {shortAddress(payment.sender, 2)}
        </span>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-label-lg text-label-lg text-on-surface font-mono">{shortAddress(payment.sender, 4)}</span>
            <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Escrow sender on Arc</span>
        </div>
      </div>
      <div className="text-right">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Type</span>
        <span className="font-label-md text-label-md text-on-surface flex items-center gap-1 justify-end">
          <span className="material-symbols-outlined text-sm text-primary">bolt</span> Escrow release
        </span>
      </div>
    </div>
  );
}

function AmountBanner({ payment }: { payment: PaymentView }) {
  return (
    <div className="mt-space-md py-space-lg px-space-md bg-surface-container/60 rounded-lg text-center flex flex-col items-center justify-center">
      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Incoming amount</span>
      <div className="flex items-baseline justify-center gap-1">
        <span className="font-currency-display text-currency-display text-on-surface tracking-tight font-extrabold">{payment.amount}</span>
        <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">USDC</span>
      </div>
      <span className="font-label-sm text-label-sm text-secondary font-bold mt-1 bg-secondary-fixed/40 px-2.5 py-0.5 rounded-full">Zero fee • Exact payout</span>
    </div>
  );
}

function ClaimCard({
  payment,
  depositTx,
  recipient,
  setRecipient,
  target,
  validTarget,
  isConnected,
  connectors,
  onConnect,
  onClaim,
  error,
}: {
  payment: PaymentView;
  depositTx?: string;
  recipient: string;
  setRecipient: (value: string) => void;
  target: string;
  validTarget: boolean;
  isConnected: boolean;
  connectors: readonly Connector[];
  onConnect: () => void;
  onClaim: () => void;
  error: string | null;
}) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-space-sm">
          <div className="w-28 h-28 rounded-full bg-gradient-to-b from-secondary-fixed/40 to-primary-fixed/30 flex items-center justify-center p-1 shadow-inner overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Tumi" className="w-full h-full object-contain" src="/images/tumi-waving.jpg" />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-surface-container-lowest p-1 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-secondary-container text-xl block" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-space-md py-1 bg-secondary-fixed/30 text-on-secondary-fixed-variant rounded-full font-label-sm text-label-sm mb-space-sm">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
          Waiting to be claimed
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">Someone sent you money! 🎉</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">This transfer is escrowed on Arc and ready to settle to your wallet.</p>
      </div>

      <SenderRow payment={payment} />
      <AmountBanner payment={payment} />

      <div className="mt-space-md bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
        <div className="flex items-center justify-between mb-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant">Deposit destination</span>
          {depositTx ? (
            <a href={`${ARC_EXPLORER}/tx/${depositTx}`} target="_blank" rel="noopener noreferrer" className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5">
              Deposit tx <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          ) : null}
        </div>
        <input
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          placeholder={isConnected && target ? `Use ${shortAddress(target)} or paste another` : "0x… wallet address"}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg bg-surface-container-low px-space-sm py-3 font-mono text-sm text-on-surface outline-none"
        />
        {!isConnected ? (
          <div className="flex flex-wrap items-center gap-2 mt-space-sm">
            {connectors.slice(0, 2).map((connector) => (
              <button key={connector.id} onClick={onConnect} className="rounded-full bg-surface-container px-space-md py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors">
                Connect {connector.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-space-lg flex flex-col gap-space-sm">
        {error ? <p className="font-body-sm text-body-sm text-error">{error}</p> : null}
        <button onClick={onClaim} disabled={!validTarget} className="w-full h-14 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm tracking-wide shadow-[0_4px_0_#b52603] active:translate-y-[2px] active:shadow-[0_2px_0_#b52603] hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <span>Claim {payment.amount} USDC</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </Card>
  );
}

function SignInState({ payment }: { payment: PaymentView }) {
  return (
    <Card>
      <div className="bg-secondary-fixed/40 rounded-lg p-space-md mb-space-lg flex items-start gap-space-sm">
        <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5">celebration</span>
        <div>
          <span className="font-label-lg text-label-lg text-on-surface block">
            {payment.amount} USDC is waiting for @{payment.handle}
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sign in with {X_LOGO} as <strong>@{payment.handle}</strong> to prove the transfer is yours and release the funds to your wallet.
          </p>
        </div>
      </div>

      <div className="text-center py-space-md bg-surface-container-low rounded-lg mb-space-lg">
        <span className="font-label-md text-label-md text-on-surface-variant block">Pending balance to redeem</span>
        <div className="font-currency-display text-currency-display text-on-surface tracking-tight my-1">{payment.amount} USDC</div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">From {shortAddress(payment.sender, 4)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-space-md">
        <div className="bg-surface-container-low p-2.5 rounded-lg text-center">
          <span className="material-symbols-outlined text-primary text-xl block mb-1">speed</span>
          <span className="font-label-sm text-label-sm text-on-surface block font-bold">One login</span>
          <span className="text-[11px] text-on-surface-variant">No wallet setup</span>
        </div>
        <div className="bg-surface-container-low p-2.5 rounded-lg text-center">
          <span className="material-symbols-outlined text-secondary text-xl block mb-1">gas_meter</span>
          <span className="font-label-sm text-label-sm text-on-surface block font-bold">Gas paid</span>
          <span className="text-[11px] text-on-surface-variant">By Tuma</span>
        </div>
        <div className="bg-surface-container-low p-2.5 rounded-lg text-center">
          <span className="material-symbols-outlined text-primary text-xl block mb-1">savings</span>
          <span className="font-label-sm text-label-sm text-on-surface block font-bold">$0 fee</span>
          <span className="text-[11px] text-on-surface-variant">Always free</span>
        </div>
      </div>

      <button onClick={() => signIn("twitter", { callbackUrl: window.location.href })} className="w-full h-14 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-[0_4px_0_#b52603] active:translate-y-[2px] active:shadow-[0_2px_0_#b52603] hover:bg-primary transition-all flex items-center justify-center gap-2">
        <span>Sign in with {X_LOGO} &amp; claim</span>
        <span className="material-symbols-outlined text-[20px]">bolt</span>
      </button>
    </Card>
  );
}

function WrongAccountState({ payment, username }: { payment: PaymentView; username: string }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center gap-space-sm">
        <span className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center text-error">
          <span className="material-symbols-outlined text-[32px]">person_alert</span>
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Wrong account</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          You are signed in as <strong>@{username}</strong> but this payment is for <strong>@{payment.handle}</strong>.
        </p>
        <button onClick={() => signOut({ callbackUrl: window.location.href })} className="mt-space-sm rounded-full bg-primary-container text-on-primary px-space-lg py-space-md font-label-lg text-label-lg hover:bg-primary transition-colors">
          Sign out and switch account
        </button>
      </div>
    </Card>
  );
}

function SuccessState({ amount, handle, target, txHash }: { amount: string; handle: string; target: string; txHash: string }) {
  return (
    <Card>
      <div className="text-center relative overflow-hidden">
        <div className="w-28 h-28 mx-auto relative mb-space-md flex items-center justify-center">
          <div className="absolute inset-0 bg-secondary-container/20 rounded-full blur-xl animate-pulse"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Tumi celebrating" className="w-full h-full object-contain relative z-10" src="/images/tumi-curious.jpg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-space-md py-1 bg-secondary-fixed/50 text-on-secondary-fixed font-label-sm text-label-sm rounded-full mb-space-sm">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          Instant settlement confirmed
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">Money claimed! 🎉</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto mb-space-lg">
          {amount} USDC was released to <span className="font-mono">{shortAddress(target, 4)}</span> from @{handle}&apos;s payment.
        </p>
        <div className="bg-surface-container-low rounded-lg p-space-md mb-space-lg text-left">
          <div className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex justify-between"><span>Released to:</span><span className="font-mono text-on-surface">{shortAddress(target, 6)}</span></div>
            <div className="flex justify-between"><span>Amount:</span><span className="text-on-surface">{amount} USDC</span></div>
            <div className="flex justify-between"><span>Network:</span><span className="text-on-surface">Arc Mainnet</span></div>
          </div>
        </div>
        <a href={`${ARC_EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="mb-space-md inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:underline">
          View release transaction on ArcScan <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
        <div className="flex flex-col sm:flex-row gap-space-sm">
          <Link href="/dashboard" className="flex-1 h-14 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-[0_4px_0_#b52603] hover:bg-primary transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            Go to dashboard
          </Link>
          <Link href="/send" className="flex-1 h-14 rounded-full bg-surface-container text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">send</span>
            Send money back
          </Link>
        </div>
      </div>
    </Card>
  );
}

function ExpiredState({ reason }: { reason: "expired" | "claimed" | "refunded" | "not-found" }) {
  const copy: Record<typeof reason, { title: string; body: string }> = {
    expired: {
      title: "This claim expired.",
      body: "Unclaimed transfers are automatically refundable to the sender after 30 days.",
    },
    claimed: { title: "Already claimed.", body: "This payment has already been released to its recipient." },
    refunded: { title: "Refunded.", body: "This payment was refunded to the sender." },
    "not-found": { title: "This claim is not available.", body: "Check the link, or the payment may not exist." },
  };
  return (
    <Card>
      <div className="text-center">
        <div className="w-28 h-28 mx-auto mb-space-md flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Tumi" className="w-full h-full object-contain" src="/images/tumi-curious.jpg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-space-md py-1 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm rounded-full mb-space-sm">
          <span className="material-symbols-outlined text-[16px] text-error">info</span>
          Claim link inactive
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">{copy[reason].title}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto mb-space-lg">{copy[reason].body}</p>
        <div className="bg-surface-container-low rounded-lg p-space-md mb-space-lg text-left flex flex-col gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-start gap-2"><span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">schedule</span><span><strong>Expiry window:</strong> payments are refundable by the sender after 30 days.</span></div>
          <div className="flex items-start gap-2"><span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">check_circle</span><span><strong>Already redeemed:</strong> the link may have been used already.</span></div>
          <div className="flex items-start gap-2"><span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">lock</span><span><strong>Invalid token:</strong> the link may be incomplete.</span></div>
        </div>
        <Link href="/" className="inline-flex h-14 px-space-xl rounded-full bg-surface-container-highest text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-high transition-colors items-center justify-center">
          Return to Tuma
        </Link>
      </div>
    </Card>
  );
}
