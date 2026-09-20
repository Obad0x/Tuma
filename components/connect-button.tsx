"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, type Connector } from "wagmi";
import { arc } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { shortAddress } from "@/lib/format";

export function ConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unique: Connector[] = [];
  const seen = new Set<string>();
  for (const connector of connectors) {
    const key = connector.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(connector);
  }

  const base =
    "rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";

  async function handleConnect(connector: Connector) {
    setError(null);
    try {
      await connectAsync({ connector });
      setOpen(false);
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  if (!isConnected) {
    return (
      <div className="relative flex flex-col items-end gap-1">
        <button
          onClick={() => setOpen((value) => !value)}
          disabled={connecting}
          className={`${base} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200`}
        >
          {connecting ? "Connecting…" : "Connect wallet"}
        </button>

        {open ? (
          <div className="absolute right-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            {unique.length === 0 ? (
              <p className="px-3 py-3 text-xs text-zinc-500">No wallets detected.</p>
            ) : (
              unique.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {connector.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={connector.icon} alt="" className="h-5 w-5 rounded-md" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-200 text-[10px] font-bold dark:bg-zinc-700">
                      {connector.name.slice(0, 1)}
                    </span>
                  )}
                  <span>{connector.name}</span>
                </button>
              ))
            )}
          </div>
        ) : null}

        {error ? <span className="max-w-[200px] text-right text-xs text-red-600 dark:text-red-400">{error}</span> : null}
      </div>
    );
  }

  if (chainId !== arc.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: arc.id })}
        disabled={switching}
        className={`${base} bg-amber-500 text-white hover:bg-amber-600`}
      >
        {switching ? "Switching…" : "Switch to Arc"}
      </button>
    );
  }

  return (
    <button
      onClick={() => disconnect()}
      title="Disconnect"
      className={`${base} border border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800`}
    >
      {shortAddress(address)}
    </button>
  );
}
