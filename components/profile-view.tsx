"use client";

import { useQuery } from "@tanstack/react-query";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useAccount, useBalance, useDisconnect, usePublicClient } from "wagmi";
import { AppShell } from "./app-shell";
import { QrCard } from "./qr-card";
import { WalletModal } from "./wallet-modal";
import { useSignOutAndDisconnect } from "@/lib/use-sign-out";
import { ARC_EXPLORER, USDC_ADDRESS, arc } from "@/lib/arc";
import { fetchSenderPayments } from "@/lib/events";
import { shortAddress } from "@/lib/format";
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  resetProfile,
  subscribeProfile,
  updateProfile,
  type ProfileSettings,
} from "@/lib/profile";

const X_LOGO = "𝕏";
const CURRENCIES = ["NGN", "KES", "GHS", "ZAR", "USD", "EUR", "GBP", "INR"];

function initials(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "TU";
}

type DbSettings = Partial<ProfileSettings> | null;

export function ProfileView() {
  const { data: session, status } = useSession();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const signOutAndDisconnect = useSignOutAndDisconnect();

  const stored = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);
  const [draft, setDraft] = useState<Partial<ProfileSettings> | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: dbData } = useQuery({
    queryKey: ["profile-db"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      return (await res.json()) as { settings: DbSettings };
    },
    staleTime: 60_000,
  });

  const remote = dbData?.settings ?? null;
  const merged: ProfileSettings = useMemo(() => {
    const clean = remote
      ? Object.fromEntries(Object.entries(remote).filter(([, v]) => v !== null && v !== undefined))
      : {};
    return { ...stored, ...clean, ...draft };
  }, [stored, remote, draft]);

  const handle = session?.user?.username ?? null;
  const email = session?.user?.email ?? null;
  const onArc = chainId === arc.id;
  const ready = isConnected && onArc;

  const { data: balance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { enabled: !!address && onArc },
  });

  const { data: payments } = useQuery({
    queryKey: ["profile-payments", address, chainId],
    queryFn: () => fetchSenderPayments(publicClient!, address!),
    enabled: !!publicClient && !!address && onArc,
  });

  const transfers = payments?.length ?? 0;
  const memberSince = useMemo(() => {
    if (!payments || payments.length === 0) return null;
    return new Date(payments[payments.length - 1].createdAt * 1000).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [payments]);

  const displayName = merged.displayName || session?.user?.name || handle || "Your name";
  const avatarSrc = merged.avatar || session?.user?.image || "";
  const bio = merged.bio || (handle ? `Send me USDC on Tuma with one ${X_LOGO} login.` : "");
  const publicLink = handle
    ? `${typeof window === "undefined" ? "" : window.location.origin}/send?handle=${handle}`
    : "";

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function set<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function persist(patch: Partial<ProfileSettings>) {
    updateProfile(patch);
    void fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => undefined);
  }

  function save() {
    persist({
      displayName: merged.displayName,
      bio: merged.bio,
      currency: merged.currency,
      avatar: merged.avatar,
    });
    setDraft(null);
    flash("Profile saved.");
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        flash(data.error ?? "Upload failed.");
        return;
      }
      set("avatar", data.url);
      persist({ avatar: data.url });
      flash("Photo updated.");
    } finally {
      setUploading(false);
    }
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      flash("Could not copy.");
    }
  }

  async function handleSignOut() {
    resetProfile();
    await signOutAndDisconnect("/");
  }

  return (
    <AppShell active="profile">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Profile</h1>
            <p className="text-sm text-on-surface-variant">
              Your public transfer handle, photo and connected wallet.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/support"
              className="rounded-full border border-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
            >
              Support
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
            >
              Sign out
            </button>
            <button
              onClick={save}
              className="rounded-full bg-primary-container px-5 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary"
            >
              Save changes
            </button>
          </div>
        </div>

        {status === "unauthenticated" ? (
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-on-surface">Link your {X_LOGO} account</p>
              <p className="text-xs text-on-surface-variant">
                Your handle is how people send you USDC on Tuma.
              </p>
            </div>
            <button
              onClick={() => signIn("twitter")}
              className="rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary"
            >
              Sign in with {X_LOGO}
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Identity */}
            <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface-container">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Profile" className="h-full w-full object-cover" src={avatarSrc} />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-on-surface">
                      {initials(displayName)}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-on-surface">{displayName}</h2>
                    {handle ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-bold text-primary">
                        @{handle}
                        <button onClick={() => copy(`@${handle}`, "handle")} title="Copy handle">
                          <span className="material-symbols-outlined text-[14px]">
                            {copied === "handle" ? "check" : "content_copy"}
                          </span>
                        </button>
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {memberSince ? `Member since ${memberSince} · ` : ""}
                    {transfers} {transfers === 1 ? "transfer" : "transfers"}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="rounded-full bg-surface-container px-4 py-1.5 text-xs font-semibold text-on-surface transition hover:bg-surface-container-high disabled:opacity-50"
                    >
                      {uploading ? "Uploading…" : "Upload photo"}
                    </button>
                    {session?.user?.image ? (
                      <button
                        onClick={() => { set("avatar", session.user?.image ?? ""); persist({ avatar: session.user?.image ?? "" }); }}
                        className="rounded-full bg-surface-container px-4 py-1.5 text-xs font-semibold text-on-surface transition hover:bg-surface-container-high"
                      >
                        Use {X_LOGO} photo
                      </button>
                    ) : null}
                    {avatarSrc ? (
                      <button
                        onClick={() => { set("avatar", ""); persist({ avatar: "" }); }}
                        className="rounded-full bg-surface-container px-4 py-1.5 text-xs font-semibold text-on-surface-variant transition hover:bg-surface-container-high"
                      >
                        Remove
                      </button>
                    ) : null}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadPhoto(file);
                        event.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet */}
            <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                  Connected wallet
                </span>
                <span className="text-xs text-on-surface-variant">
                  {ready ? "Signer available" : "Not connected"}
                </span>
              </div>
              {ready ? (
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-mono text-sm text-on-surface">{shortAddress(address, 6)}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {balance ? `${balance.formatted.slice(0, 8)} USDC` : "—"} on {arc.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => address && copy(address, "address")}
                      className="rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:bg-surface-container-high"
                    >
                      {copied === "address" ? "Copied!" : "Copy"}
                    </button>
                    <a
                      href={`${ARC_EXPLORER}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:bg-surface-container-high"
                    >
                      Explorer
                    </a>
                    <button
                      onClick={() => disconnect()}
                      className="rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:bg-surface-container-highest"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary"
                >
                  Connect wallet
                </button>
              )}
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6">
              <h3 className="mb-4 text-lg font-semibold tracking-tight text-on-surface">
                Personal information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface">Display name</span>
                  <input
                    value={merged.displayName}
                    onChange={(event) => set("displayName", event.target.value)}
                    placeholder={session?.user?.name ?? "Your name"}
                    className="rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface">Username handle</span>
                  <input
                    value={handle ?? ""}
                    readOnly
                    placeholder="sign in with X"
                    className="rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface opacity-80 outline-none"
                  />
                  <span className="text-[11px] text-on-surface-variant">
                    {publicLink || `Your ${X_LOGO} handle is your payment link.`}
                  </span>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface">Email</span>
                  <input
                    value={email ?? ""}
                    readOnly
                    placeholder="not shared by X"
                    className="rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface opacity-80 outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface">Preferred currency</span>
                  <select
                    value={merged.currency}
                    onChange={(event) => { set("currency", event.target.value); persist({ currency: event.target.value }); }}
                    className="rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none"
                  >
                    {CURRENCIES.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-4 flex flex-col gap-1">
                <span className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface">Public bio</span>
                  <span className="text-[11px] text-on-surface-variant">{merged.bio.length} / 160</span>
                </span>
                <textarea
                  value={merged.bio}
                  maxLength={160}
                  rows={3}
                  onChange={(event) => set("bio", event.target.value)}
                  placeholder="Add a short note for people sending you funds."
                  className="resize-none rounded-lg bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setDraft(null)}
                  className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-high"
                >
                  Discard
                </button>
                <button
                  onClick={save}
                  className="rounded-full bg-primary-container px-5 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary"
                >
                  Save profile
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6">
              <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                Payment QR
              </span>
              <p className="mb-4 mt-1 text-xs text-on-surface-variant">
                A personalized QR that opens a send to your handle.
              </p>
              {handle ? (
                <QrCard value={publicLink} name={`tuma-${handle}`} />
              ) : (
                <p className="text-sm text-on-surface-variant">Sign in with {X_LOGO} to get your QR.</p>
              )}
            </div>

            <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6">
              <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                Public preview
              </span>
              <div className="mt-4 flex flex-col items-center text-center">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-surface-container">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Preview" className="h-full w-full object-cover" src={avatarSrc} />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-on-surface">
                      {initials(displayName)}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-semibold text-on-surface">{displayName}</p>
                <p className="text-xs font-bold text-primary">{handle ? `@${handle}` : "@handle"}</p>
                <p className="mt-1 line-clamp-3 text-xs text-on-surface-variant">{bio}</p>
                <Link
                  href={handle ? `/send?handle=${handle}` : "/send"}
                  className="mt-4 w-full rounded-full bg-primary-container py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary"
                >
                  Send money{handle ? ` to @${handle}` : ""}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />

      <div
        className={`fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-inverse-surface px-5 py-2.5 text-sm text-inverse-on-surface shadow-2xl transition-all duration-300 ${
          toast ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
        <span>{toast ?? ""}</span>
      </div>
    </AppShell>
  );
}
