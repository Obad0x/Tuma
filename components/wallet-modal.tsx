"use client";

import { useState } from "react";
import { useConnect, type Connector } from "wagmi";
import { friendlyError } from "@/lib/errors";

function WalletConnectLogo() {
  return (
    <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden="true">
      <path
        d="M6.5 4.2c5.2-5.1 13.8-5.1 19 0l.6.6c.3.3.3.7 0 .9l-2.2 2.1c-.1.1-.4.1-.5 0l-.8-.8c-3.6-3.6-9.6-3.6-13.3 0l-.8.8c-.2.1-.4.1-.5 0L5.9 5.7c-.3-.2-.3-.6 0-.9l.6-.6Zm23.4 4.4 1.9 1.9c.3.3.3.7 0 .9l-8.6 8.4c-.3.3-.7.3-.9 0l-6.1-6c-.1-.1-.2-.1-.3 0L9 19.8c-.3.3-.7.3-.9 0L-.5 11.4c-.3-.3-.3-.7 0-.9l1.9-1.9c.3-.3.7-.3.9 0l6.1 6c.1.1.2.1.3 0l6.1-6c.3-.3.7-.3.9 0l6.1 6c.1.1.2.1.3 0l6.1-6c.3-.3.7-.3.9 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { connectors, connectAsync, isPending } = useConnect();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const walletConnect = connectors.find((connector) => connector.id.includes("walletConnect"));
  const injected = connectors.find((connector) => connector.type === "injected");

  async function pick(connector: Connector | undefined) {
    if (!connector) {
      setError("That wallet is not available in this browser.");
      return;
    }
    setError(null);
    try {
      await connectAsync({ connector });
      onClose();
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-on-surface">Connect a wallet</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {walletConnect ? (
            <button
              onClick={() => pick(walletConnect)}
              disabled={isPending}
              className="flex items-center gap-3 rounded-xl border border-surface-container-high px-4 py-3 text-left transition hover:bg-surface-container-low disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b99fc] text-white">
                <WalletConnectLogo />
              </span>
              <span className="font-medium text-on-surface">WalletConnect</span>
            </button>
          ) : null}

          <button
            onClick={() => pick(injected)}
            disabled={isPending}
            className="flex items-center gap-3 rounded-xl border border-surface-container-high px-4 py-3 text-left transition hover:bg-surface-container-low disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[24px] text-on-surface-variant">public</span>
            <span className="font-medium text-on-surface">Browser Wallet</span>
          </button>
        </div>

        {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
