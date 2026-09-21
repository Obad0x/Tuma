"use client";

import Link from "next/link";

const NAV = [
  { key: "home", label: "Home", href: "/dashboard" },
  { key: "send", label: "Send", href: "/send" },
  { key: "activity", label: "Activity", href: "/payments" },
  { key: "profile", label: "Profile", href: "/profile" },
  { key: "settings", label: "Settings", href: "/settings" },
  { key: "admin", label: "Admin", href: "/admin" },
] as const;

export type NavKey = (typeof NAV)[number]["key"];

/// Shared sidebar brand + navigation used by every app screen.
export function AppNav({ active }: { active: NavKey }) {
  return (
    <div className="flex flex-col px-space-md">
      <div className="flex items-center gap-space-sm px-space-sm mb-space-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Tuma" className="h-8 w-8 rounded-lg object-cover" src="/images/tuma-logo.jpg" />
        <span className="font-headline-md text-headline-md text-on-surface tracking-tight">Tuma</span>
      </div>
      <nav className="flex flex-col gap-space-xs">
        {NAV.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-space-md px-space-md py-space-sm rounded-full transition-all ${
              active === item.key
                ? "bg-primary-container text-on-primary font-headline-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <span className="font-label-lg text-label-lg">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
