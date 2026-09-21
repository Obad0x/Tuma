"use client";

import { useQuery } from "@tanstack/react-query";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  usePublicClient,
  type Connector,
} from "wagmi";
import { ARC_EXPLORER, USDC_ADDRESS, arc } from "@/lib/arc";
import { fetchSenderPayments } from "@/lib/events";
import { friendlyError } from "@/lib/errors";
import { shortAddress } from "@/lib/format";
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  subscribeProfile,
  updateProfile,
  type ProfileSettings,
} from "@/lib/profile";

const X_LOGO = "𝕏";
const CURRENCIES = ["NGN", "KES", "GHS", "ZAR", "USD", "EUR", "GBP", "INR"];
const TUMI_MASCOT =
  "https://lh3.googleusercontent.com/aida/AEtjO1U3YQh5ndXkf4Wj1tPP45eaRpfGGi349UfItqd0mVCUwmYhDfDydveF-_iU0ZcbT3vSyaW6UYeohqPtYZ7bPzQw6k7DI5nTfEY4cs71JWZfLtk4drQQ4AG1A-p3LYbwuXYPb-mKOtEJFZ7oXejsdtcEXWQE-mYGADWe3P9uFR2Dm5snoYUSYP41cavc8AaDrSSNyBWK1L9o_HqTYQ6dnuwaf1VgIWmU_QzNz-rFXayAw0fGdcwIEOpP46k";

function initials(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "TU";
}

export function ProfileView() {
  const { data: session, status } = useSession();
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  const stored = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);
  const [draft, setDraft] = useState<Partial<ProfileSettings> | null>(null);
  const settings: ProfileSettings = { ...stored, ...draft };

  const [photoOpen, setPhotoOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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
    const oldest = payments[payments.length - 1];
    return new Date(oldest.createdAt * 1000).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [payments]);

  const displayName = settings.displayName || session?.user?.name || handle || "Your name";
  const avatarSrc = settings.avatar || session?.user?.image || "";
  const bio = settings.bio || (handle ? `Send me USDC on Tuma with one ${X_LOGO} login.` : "");
  const publicLink = handle ? `${typeof window === "undefined" ? "" : window.location.origin}/send?handle=${handle}` : "";

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function save() {
    updateProfile({
      displayName: settings.displayName,
      bio: settings.bio,
      currency: settings.currency,
      avatar: settings.avatar,
      notifications: settings.notifications,
      companion: settings.companion,
    });
    setDraft(null);
    flash("Profile saved.");
  }

  function discard() {
    setDraft(null);
    flash("Changes discarded.");
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      flash("Could not copy to clipboard.");
    }
  }

  async function handleConnect(connector: Connector) {
    setConnectError(null);
    try {
      await connectAsync({ connector });
      setPickerOpen(false);
    } catch (e) {
      setConnectError(friendlyError(e));
    }
  }

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col px-space-md">
          <div className="flex items-center gap-space-sm px-space-sm mb-space-xl">
            <span className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">T</span>
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">Tuma</span>
          </div>
          <nav className="flex flex-col gap-space-xs">
            <Link href="/dashboard" className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="font-label-lg text-label-lg">Home</span>
            </Link>
            <Link href="/send" className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="font-label-lg text-label-lg">Send</span>
            </Link>
            <Link href="/payments" className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="font-label-lg text-label-lg">Activity</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-space-md px-space-md py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm transition-all">
              <span className="font-label-lg text-label-lg">Profile</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="font-label-lg text-label-lg">Settings</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="font-label-lg text-label-lg">Admin</span>
            </Link>
          </nav>
        </div>
        <div className="px-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Preferred currency</span>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">{settings.currency}</span>
              <span className="font-label-md text-label-md text-primary font-bold">Default</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Used for live FX estimates</span>
          </div>
        </div>
      </aside>

      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-64 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface">
                {handle ? `Signed in as @${handle}` : "Not signed in"}
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_4px_12px_rgba(26,24,22,0.03)]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Balance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{balance ? `${balance.formatted.slice(0, 8)} USDC` : "—"}</span>
              </div>
              {ready ? (
                <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
                  {initials(handle ?? address ?? "")}
                </span>
              ) : (
                <button onClick={() => setPickerOpen(true)} className="rounded-full bg-primary-container text-on-primary px-space-md py-space-xs font-label-lg text-label-lg shadow-sm hover:bg-primary transition-colors">
                  Connect wallet
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="w-full pt-20 px-space-xl pb-space-xl flex-1 bg-background">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-space-xl pb-16">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm tracking-wider uppercase font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    {handle ? `${X_LOGO}-verified identity` : "Identity not linked"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
                    {ready ? "Wallet connected" : "No wallet"}
                  </span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Profile</h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                  Manage your public transfer handle, preferred currency, and connected wallet credentials.
                </p>
              </div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <Link href="/settings" className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-[0_4px_12px_rgba(26,24,22,0.04)] hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </Link>
                <button onClick={() => signOut()} className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-[0_4px_12px_rgba(26,24,22,0.04)] hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign out
                </button>
                <button onClick={() => flash("Support: reach the Tuma team from the Ask Tumi widget.")} className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-[0_4px_12px_rgba(26,24,22,0.04)] hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-secondary">chat_bubble</span>
                  Support
                </button>
                <button onClick={save} className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-[0_6px_16px_rgba(255,90,54,0.3)] hover:opacity-95 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Save changes
                </button>
              </div>
            </div>

            {status === "unauthenticated" ? (
              <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col sm:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <span className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{X_LOGO === "𝕏" ? "alternate_email" : "alternate_email"}</span>
                  </span>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">Link your {X_LOGO} account</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Your {X_LOGO} handle is how people send you USDC on Tuma.</p>
                  </div>
                </div>
                <button onClick={() => signIn("twitter")} className="px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors">
                  Sign in with {X_LOGO}
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left */}
              <div className="lg:col-span-8 space-y-space-lg">
                {/* Identity */}
                <div className="relative bg-surface-container-lowest rounded-lg p-space-lg lg:p-space-xl shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="relative flex flex-col md:flex-row items-start md:items-center gap-space-lg">
                    <div className="relative">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-secondary-container via-primary-container to-primary-fixed shadow-md">
                        {avatarSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="Profile" className="w-full h-full object-cover rounded-full bg-surface-container" src={avatarSrc} />
                        ) : (
                          <span className="w-full h-full rounded-full bg-surface-container flex items-center justify-center font-display-hero text-[32px] text-on-surface">
                            {initials(displayName)}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-1 right-1 bg-surface-container-lowest p-1 rounded-full shadow-md">
                        <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-space-xs">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{displayName}</h2>
                        {handle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-md text-label-md font-bold">
                            @{handle}
                            <button onClick={() => copy(`@${handle}`, "handle")} className="text-on-surface-variant hover:text-primary transition-colors" title="Copy handle">
                              <span className="material-symbols-outlined text-[14px]">{copied === "handle" ? "check" : "content_copy"}</span>
                            </button>
                          </span>
                        ) : null}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                        {memberSince ? `Member since ${memberSince} • ` : ""}{transfers} {transfers === 1 ? "transfer" : "transfers"}
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md">
                          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                          <span>Escrow-protected account</span>
                        </div>
                        <span className="text-label-sm font-label-sm text-outline font-semibold">Payments on {arc.name}</span>
                      </div>
                      <div className="pt-space-sm relative inline-block">
                        <button onClick={() => setPhotoOpen((open) => !open)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                          Change photo
                          <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </button>
                        {photoOpen ? (
                          <div className="absolute left-0 top-10 z-30 w-64 p-1.5 rounded-xl bg-surface-container-lowest shadow-[0_12px_28px_-6px_rgba(26,24,22,0.14)] space-y-1">
                            {session?.user?.image ? (
                              <button onClick={() => { setDraft((d) => ({ ...d, avatar: session.user?.image ?? "" })); setPhotoOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">
                                <span className="material-symbols-outlined text-[18px] text-primary">upload</span>
                                Use my {X_LOGO} photo
                              </button>
                            ) : null}
                            <button onClick={() => { setDraft((d) => ({ ...d, avatar: TUMI_MASCOT })); setPhotoOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">
                              <span className="material-symbols-outlined text-[18px] text-secondary">pets</span>
                              Use Tumi mascot
                            </button>
                            <div className="flex items-center gap-1 px-2 py-1.5">
                              <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="Paste image URL" className="w-full bg-surface-container rounded-lg px-2 py-1.5 font-body-sm text-body-sm outline-none" />
                              <button onClick={() => { if (avatarUrl.trim()) { setDraft((d) => ({ ...d, avatar: avatarUrl.trim() })); setAvatarUrl(""); setPhotoOpen(false); } }} className="text-primary">
                                <span className="material-symbols-outlined text-[18px]">check</span>
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet identity */}
                <div className="relative bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low rounded-lg p-space-lg shadow-sm overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-36 opacity-5 pointer-events-none flex items-center justify-center">
                    <span className="material-symbols-outlined text-[140px] text-on-surface">shield</span>
                  </div>
                  <div className="flex items-center justify-between gap-space-sm mb-space-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                      </span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Connected wallet identity (non-editable)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                      {ready ? "Signer available" : "Not connected"}
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-[0_4px_12px_rgba(26,24,22,0.02)]">
                    <div className="flex items-start gap-space-md">
                      <div className="w-12 h-12 rounded-full bg-secondary-fixed/40 flex items-center justify-center text-secondary shrink-0">
                        <span className="material-symbols-outlined text-[24px]">token</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-mono">{address ? shortAddress(address, 6) : "No wallet connected"}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">Immutable</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xl">
                          Bound to your wallet key. Tuma never holds your keys — you sign approvals and deposits yourself.
                        </p>
                        {balance ? (
                          <p className="font-label-md text-label-md text-on-surface font-semibold mt-1">{balance.formatted.slice(0, 8)} USDC on {arc.name}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ready ? (
                        <>
                          <button onClick={() => address && copy(address, "address")} className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px]">{copied === "address" ? "check" : "copy_all"}</span>
                            Copy address
                          </button>
                          <a href={`${ARC_EXPLORER}/address/${address}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md font-bold hover:bg-surface-container transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                            Explorer
                          </a>
                        </>
                      ) : (
                        <button onClick={() => setPickerOpen(true)} className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-colors">
                          Connect wallet
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-surface-container-lowest rounded-lg p-space-lg lg:p-space-xl shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] space-y-space-lg">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Personal information</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Saved locally in your browser for this demo (no database yet).</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Live profile
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <label className="space-y-space-xs">
                      <span className="block font-label-md text-label-md text-on-surface font-semibold">Display name</span>
                      <input
                        value={settings.displayName}
                        onChange={(event) => setDraft((d) => ({ ...d, displayName: event.target.value }))}
                        placeholder={session?.user?.name ?? "Your name"}
                        className="w-full h-14 px-4 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md outline-none focus:bg-surface-container-low transition-all"
                      />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Appears on receipts and the public preview.</span>
                    </label>
                    <label className="space-y-space-xs">
                      <span className="block font-label-md text-label-md text-on-surface font-semibold">Username handle</span>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 font-headline-sm text-headline-sm text-on-surface-variant">@</span>
                        <input
                          value={handle ?? ""}
                          readOnly
                          placeholder="sign in with X"
                          className="w-full h-14 pl-9 pr-24 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md outline-none font-semibold opacity-80"
                        />
                        <span className="absolute right-3 px-2 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">From {X_LOGO}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">link</span>
                        {publicLink || "Sign in to get your payment link"}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <label className="space-y-space-xs">
                      <span className="block font-label-md text-label-md text-on-surface font-semibold">Email address</span>
                      <input
                        value={email ?? ""}
                        readOnly
                        placeholder="not shared by X"
                        className="w-full h-14 px-4 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md outline-none opacity-80"
                      />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Provided by your {X_LOGO} login when available.</span>
                    </label>
                    <label className="space-y-space-xs">
                      <span className="block font-label-md text-label-md text-on-surface font-semibold">Mobile phone</span>
                      <input
                        value="Not linked"
                        readOnly
                        className="w-full h-14 px-4 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md outline-none opacity-80"
                      />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Coming with notifications support.</span>
                    </label>
                  </div>

                  <label className="block space-y-space-xs">
                    <span className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Public bio</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{settings.bio.length} / 160</span>
                    </span>
                    <textarea
                      value={settings.bio}
                      maxLength={160}
                      rows={3}
                      onChange={(event) => setDraft((d) => ({ ...d, bio: event.target.value }))}
                      placeholder="Add a friendly note for people sending you funds."
                      className="w-full p-4 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md outline-none focus:bg-surface-container-low transition-all resize-none"
                    />
                  </label>

                  <div className="pt-space-sm flex items-center justify-end gap-space-sm">
                    <button onClick={discard} className="px-space-md py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high transition-colors">
                      Discard
                    </button>
                    <button onClick={save} className="px-space-xl py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-[0_4px_14px_rgba(255,90,54,0.3)] hover:opacity-95 active:scale-95 transition-all">
                      Save profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="lg:col-span-4 space-y-space-lg">
                {/* Public preview */}
                <div className="bg-surface-container-lowest rounded-lg p-space-md lg:p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)]">
                  <div className="mb-space-md">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Public profile preview</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">How senders see you when they pay your {X_LOGO} handle.</p>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-gradient-to-b from-surface-container-low to-surface-container-lowest shadow-sm">
                    <div className="h-24 bg-gradient-to-r from-secondary-container via-primary-container to-secondary-fixed flex items-center justify-between px-space-md">
                      <span className="font-label-sm text-label-sm uppercase font-bold tracking-widest text-on-primary opacity-80">Tuma instant</span>
                      <span className="material-symbols-outlined text-[20px] text-on-primary opacity-80">qr_code_2</span>
                    </div>
                    <div className="px-space-md pb-space-lg -mt-10 flex flex-col items-center text-center space-y-space-xs">
                      <div className="w-20 h-20 rounded-full p-1 bg-surface-container-lowest shadow-md">
                        {avatarSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="Preview" className="w-full h-full object-cover rounded-full" src={avatarSrc} />
                        ) : (
                          <span className="w-full h-full rounded-full bg-surface-container flex items-center justify-center font-headline-md text-on-surface">{initials(displayName)}</span>
                        )}
                      </div>
                      <div className="pt-1">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface">{displayName}</h4>
                        <span className="font-label-md text-label-md text-primary font-bold">{handle ? `@${handle}` : "@handle"}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-1 px-2">{bio || "Add a friendly note for friends sending funds."}</p>
                      <div className="w-full pt-space-sm">
                        <Link href={handle ? `/send?handle=${handle}` : "/send"} className="w-full py-3 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-[0_4px_12px_rgba(255,90,54,0.25)] flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          Send money to {handle ? `@${handle}` : "me"}
                        </Link>
                      </div>
                      <div className="w-full pt-space-md flex items-center justify-between gap-space-sm bg-surface-container-lowest p-3 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
                          </div>
                          <div>
                            <span className="block font-label-sm text-label-sm text-on-surface-variant font-bold">SCAN TO PAY</span>
                            <span className="font-body-sm text-body-sm font-semibold text-on-surface">{handle ? `/send?handle=${handle}` : "—"}</span>
                          </div>
                        </div>
                        <button onClick={() => publicLink && copy(publicLink, "link")} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" title="Copy payment link">
                          <span className="material-symbols-outlined text-[18px]">{copied === "link" ? "check" : "share"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] space-y-space-md">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Settings & preferences</h4>
                  <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                      </div>
                      <div>
                        <span className="block font-label-lg text-label-lg text-on-surface">Preferred currency</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Drives live FX estimates</span>
                      </div>
                    </div>
                    <select
                      value={settings.currency}
                      onChange={(event) => { setDraft((d) => ({ ...d, currency: event.target.value })); updateProfile({ currency: event.target.value }); }}
                      className="bg-surface-container-lowest rounded-full px-3 py-1.5 font-label-md text-label-md text-primary font-bold outline-none"
                    >
                      {CURRENCIES.map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <ToggleRow
                    icon="notifications_active"
                    title="Notifications"
                    subtitle="Payment and claim alerts"
                    enabled={settings.notifications}
                    onToggle={() => { const next = !settings.notifications; setDraft((d) => ({ ...d, notifications: next })); updateProfile({ notifications: next }); }}
                  />
                  <ToggleRow
                    icon="psychology"
                    title="Tumi companion"
                    subtitle="Friendly chatter & rate tips"
                    enabled={settings.companion}
                    onToggle={() => { const next = !settings.companion; setDraft((d) => ({ ...d, companion: next })); updateProfile({ companion: next }); }}
                  />

                  <button onClick={() => { disconnect(); signOut(); }} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out & disconnect
                  </button>
                </div>

                <div className="rounded-xl p-space-md bg-surface-container flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[26px]">support_agent</span>
                    <div>
                      <span className="block font-label-md text-label-md text-on-surface font-bold">24/7 priority support</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Chat with a human or Tumi</span>
                    </div>
                  </div>
                  <button onClick={() => flash("Support: ask Tumi anything from the chat widget.")} className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors">
                    Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-2.5 rounded-full font-label-md text-label-md shadow-2xl flex items-center gap-2 transition-all duration-300 ${toast ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
        <span>{toast ?? ""}</span>
      </div>

      {/* Connect modal */}
      {pickerOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-md" onClick={() => setPickerOpen(false)}>
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-lg shadow-[0_20px_32px_-8px_rgba(26,24,22,0.18)] p-space-lg flex flex-col gap-space-sm" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">Connect a wallet</span>
              <button onClick={() => setPickerOpen(false)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {connectors
              .filter((connector, index, list) => list.findIndex((c) => c.name === connector.name) === index)
              .map((connector) => (
                <button key={connector.id} onClick={() => handleConnect(connector)} disabled={connecting} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-surface-container-low transition-colors disabled:opacity-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-[11px] font-bold uppercase">{connector.name.slice(0, 1)}</span>
                  <span className="font-body-md text-body-md text-on-surface">{connector.name}</span>
                </button>
              ))}
            {connectError ? <p className="font-body-sm text-body-sm text-error">{connectError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  enabled,
  onToggle,
}: {
  icon: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <div>
          <span className="block font-label-lg text-label-lg text-on-surface">{title}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-primary-container" : "bg-surface-container-highest"}`}
      >
        <span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${enabled ? "translate-x-5" : ""}`}></span>
      </button>
    </div>
  );
}
