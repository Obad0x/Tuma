"use client";

import Link from "next/link";

const NAV = [
  { key: "home", label: "Home", href: "/dashboard" },
  { key: "send", label: "Send", href: "/send" },
  { key: "activity", label: "Activity", href: "/payments" },
  { key: "profile", label: "Profile", href: "/profile" },
  { key: "support", label: "Support", href: "/support" },
] as const;

export type NavKey = (typeof NAV)[number]["key"];

/// Shared sidebar brand + navigation used by every app screen.
export function AppNav({ active, onNavigate }: { active: NavKey; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col px-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Tuma" className="h-8 w-8 rounded-lg object-cover" src="/images/tuma-logo.jpg" />
        <span className="text-lg font-bold tracking-tight text-on-surface">Tuma</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-4 rounded-full px-4 py-2 text-sm transition-all ${
              active === item.key
                ? "bg-primary-container font-semibold text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
