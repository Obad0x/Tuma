"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useAccount, useBalance } from "wagmi";
import { USDC_ADDRESS, arc } from "@/lib/arc";
import { shortAddress } from "@/lib/format";
import { AppNav, type NavKey } from "./app-nav";
import { WalletModal } from "./wallet-modal";

/// Responsive app chrome: collapsible sidebar (drawer on mobile), sticky header
/// with balance + connect, and the shared wallet modal.
export function AppShell({
  active,
  headerLeft,
  footer,
  children,
}: {
  active: NavKey;
  headerLeft?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const onArc = chainId === arc.id;

  const { data: balance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: !!address && onArc },
  });

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col justify-between bg-surface-container-low py-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppNav active={active} onNavigate={() => setMenuOpen(false)} />
        {footer ? <div className="px-4">{footer}</div> : null}
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-surface-container bg-surface/80 backdrop-blur-xl lg:left-64 lg:h-20">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:h-20 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container lg:hidden"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              {headerLeft}
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-1.5 shadow-[0_4px_12px_rgba(26,24,22,0.03)] sm:flex">
                <span className="text-[11px] uppercase tracking-wide text-on-surface-variant">
                  Balance
                </span>
                <span className="text-sm font-semibold text-on-surface">
                  {balance ? `${balance.formatted.slice(0, 8)} USDC` : "—"}
                </span>
              </div>
              {isConnected && onArc ? (
                <Link
                  href="/profile"
                  title="Profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary"
                >
                  {shortAddress(address, 2).replace("0x", "")}
                </Link>
              ) : (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary"
                >
                  Connect wallet
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="w-full flex-1 px-4 pb-8 pt-20 lg:px-8 lg:pt-28">{children}</main>
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  );
}
