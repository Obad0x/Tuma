"use client";

import { useMemo, useState } from "react";
import { parseEventLogs, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { TumaEscrowABI, erc20Abi } from "@/lib/abi";
import {
  ARC_EXPLORER,
  ESCROW_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
  arc,
  isEscrowConfigured,
} from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { formatUnits } from "@/lib/format";
import { isValidHandle, normalizeHandle } from "@/lib/handles";

const primary =
  "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";
const secondary =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 border border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800";
const inputBox =
  "flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

type Status = "idle" | "approving" | "sending" | "done";

export function SendForm() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [handle, setHandle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [claim, setClaim] = useState<{ handle: string; id: string; amount: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // The success view only renders after a client-side transaction, so this is
  // always the real origin by the time it is used.
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const normalized = normalizeHandle(handle);
  const handleValid = isValidHandle(normalized);
  const onArc = chainId === arc.id;

  const { data: balance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: !!address && onArc },
  });

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

  const allowanceKnown = allowance !== undefined;
  const needsApproval = allowanceKnown && amountWei !== null && allowance < amountWei;
  const busy = status === "approving" || status === "sending";
  const ready =
    isConnected &&
    onArc &&
    handleValid &&
    amountWei !== null &&
    amountError === null &&
    allowanceKnown &&
    !busy;

  const balanceText = balance ? formatUnits(balance.value, balance.decimals) : "—";
  const claimLink = claim ? `${origin}/claim/${claim.id}` : "";
  const shareText = claim
    ? `Hey @${claim.handle}, I sent you ${claim.amount} USDC on Tuma. Claim it here:`
    : "";
  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(claimLink)}`;

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

  if (!isEscrowConfigured) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        The escrow contract is not deployed yet. Deploy it and set{" "}
        <code className="font-mono">NEXT_PUBLIC_ESCROW_ADDRESS</code> in{" "}
        <code className="font-mono">.env.local</code> (see <code className="font-mono">docs/SETUP.md</code>
        ).
      </div>
    );
  }

  if (claim) {
    return (
      <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Payment created</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Share this link with <strong>@{claim.handle}</strong>. Only that X account can claim it.
          </p>
        </div>

        <div className="break-all rounded-xl bg-zinc-100 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {claimLink}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={copyLink} className={`${secondary} sm:flex-1`}>
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${primary} sm:flex-1`}
          >
            Share on X
          </a>
        </div>

        <button onClick={reset} className="text-sm font-medium text-zinc-500 underline">
          Send another payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {!isConnected ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Connect your wallet to send USDC. The recipient does not need a wallet until they claim.
        </p>
      ) : !onArc ? (
        <div className="space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p>You are on the wrong network. Tuma runs on Arc.</p>
          <button
            onClick={() => switchChain({ chainId: arc.id })}
            disabled={switching}
            className={secondary}
          >
            {switching ? "Switching…" : "Switch to Arc"}
          </button>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="handle">
          Recipient X handle
        </label>
        <div className={inputBox}>
          <span className="pl-3 text-zinc-400">@</span>
          <input
            id="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="jack"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="w-full bg-transparent px-2 py-3 outline-none"
          />
        </div>
        {handle && !handleValid ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            Handles are 1–15 letters, numbers or underscores.
          </p>
        ) : normalized ? (
          <p className="text-xs text-zinc-500">Claimable by @{normalized}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="amount">
          Amount
        </label>
        <div className={inputBox}>
          <input
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="25"
            inputMode="decimal"
            autoComplete="off"
            className="w-full bg-transparent px-3 py-3 outline-none"
          />
          <span className="pr-3 text-sm text-zinc-500">USDC</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Balance: {balanceText} USDC</span>
          <span className="text-zinc-400">USDC on Arc</span>
        </div>
        {amountError ? <p className="text-xs text-red-600 dark:text-red-400">{amountError}</p> : null}
      </div>

      <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
        Only the X account <strong>@{normalized || "handle"}</strong> can claim this. Double-check the
        spelling. If it is unclaimed after 30 days you can refund it.
      </div>

      <ol className="flex items-center gap-2 text-xs font-medium">
        <li
          className={
            needsApproval
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-400 line-through dark:text-zinc-500"
          }
        >
          1. Approve USDC
        </li>
        <li className="text-zinc-300 dark:text-zinc-600">→</li>
        <li className={needsApproval ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-100"}>
          2. Send
        </li>
      </ol>

      <button onClick={handleSend} disabled={!ready} className={primary}>
        {status === "approving"
          ? "Approving…"
          : status === "sending"
            ? "Sending…"
            : needsApproval
              ? "Approve USDC"
              : "Send USDC"}
      </button>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <p className="text-center text-[11px] text-zinc-400">
        Transactions settle on Arc ·{" "}
        <a href={ARC_EXPLORER} target="_blank" rel="noopener noreferrer" className="underline">
          ArcScan
        </a>
      </p>
    </div>
  );
}
