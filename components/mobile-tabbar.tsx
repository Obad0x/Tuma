"use client";

import Link from "next/link";
import type { NavKey } from "./app-nav";

const TABS = [
  { key: "home", label: "Home", href: "/dashboard", icon: "home" },
  { key: "send", label: "Send", href: "/send", icon: "send" },
  { key: "activity", label: "Activity", href: "/payments", icon: "receipt_long" },
  { key: "profile", label: "Profile", href: "/profile", icon: "person" },
] as const;

/// Mobile-only bottom navigation (the sidebar is desktop-only).
export function MobileTabBar({ active }: { active: NavKey }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-surface-container bg-surface/95 py-2 backdrop-blur-xl lg:hidden">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`flex flex-col items-center gap-0.5 px-3 text-[11px] ${
            active === tab.key ? "font-semibold text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
