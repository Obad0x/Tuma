"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="rounded-xl border border-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
    >
      Sign out
    </button>
  );
}
