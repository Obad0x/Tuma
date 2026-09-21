"use client";

import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { AppNav } from "./app-nav";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  usePublicClient,
  type Connector,
} from "wagmi";
import { ARC_EXPLORER, ESCROW_ADDRESS, USDC_ADDRESS, arc } from "@/lib/arc";
import { fetchSenderPayments } from "@/lib/events";
import { friendlyError } from "@/lib/errors";
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

export function SettingsView() {
  const { data: session } = useSession();
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  const stored = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);
  const [draft, setDraft] = useState<Partial<ProfileSettings> | null>(null);
  const settings: ProfileSettings = { ...stored, ...draft };

  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
    queryKey: ["settings-payments", address, chainId],
    queryFn: () => fetchSenderPayments(publicClient!, address!),
    enabled: !!publicClient && !!address && onArc,
  });

  const memberSince = useMemo(() => {
    if (!payments || payments.length === 0) return null;
    return new Date(payments[payments.length - 1].createdAt * 1000).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [payments]);

  const securityScore = useMemo(() => {
    let score = 60;
    if (ready) score += 20;
    if (handle) score += 10;
    if (settings.notifySecurity) score += 10;
    return Math.min(100, score);
  }, [ready, handle, settings.notifySecurity]);

  function set<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    updateProfile({ [key]: value } as Partial<ProfileSettings>);
  }

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
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

  const chips: { key: string; label: string }[] = [
    { key: "all", label: "All settings" },
    { key: "account-section", label: "Account" },
    { key: "security-section", label: "Security & keys" },
    { key: "notifications-section", label: "Notifications" },
    { key: "privacy-section", label: "Privacy & data" },
    { key: "support-section", label: "Support" },
  ];

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <AppNav active="settings" />
        <div className="px-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Security score</span>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">{securityScore}%</span>
              <span className="font-label-md text-label-md text-secondary font-bold">{securityScore >= 90 ? "Excellent" : "Good"}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-secondary-container rounded-full" style={{ width: `${securityScore}%` }}></div>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-64 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search settings..."
                  className="bg-transparent border-0 outline-none text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm w-72"
                />
              </div>
              <div className="hidden xl:flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface">Network: {arc.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_4px_12px_rgba(26,24,22,0.03)]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Balance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{balance ? `${balance.formatted.slice(0, 8)} USDC` : "—"}</span>
              </div>
              <Link href="/profile" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="w-full pt-20 px-space-xl pb-space-xl flex-1 bg-background">
          <div className="flex flex-col w-full">
            {/* Header */}
            <div className="flex flex-col gap-space-md mb-space-xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Preferences & safety</span>
                    <span className="text-outline-variant">•</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Global settings</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Settings</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                    Manage your account, security, notifications, and privacy. Saved locally for this demo.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => {
                      setSection(chip.key);
                      if (chip.key !== "all") {
                        document.getElementById(chip.key)?.scrollIntoView({ behavior: "smooth" });
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={`px-space-md py-1.5 rounded-full text-label-md font-label-md transition-all whitespace-nowrap ${
                      section === chip.key ? "bg-primary-container text-on-primary shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              {/* Left */}
              <div className="lg:col-span-8 flex flex-col gap-space-xl">
                <Section id="account-section" title="Account credentials" tag="Profile & contact" query={query}>
                  <Row icon="person" title="Personal information" subtitle="Display name and Tuma username handle">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">{settings.displayName || session?.user?.name || "Not set"}</span>
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{handle ? `@${handle}` : "no handle"}</span>
                    </div>
                  </Row>
                  <Divider />
                  <Row icon="mail" title="Primary email" subtitle="Provided by your X login when available" badge={email ? "Verified" : undefined}>
                    <span className="font-body-md text-body-md text-on-surface font-medium">{email ?? "Not shared by X"}</span>
                  </Row>
                  <Divider />
                  <Row icon="phone" title="Registered mobile" subtitle="Not linked yet — coming with notifications">
                    <span className="font-body-md text-body-md text-on-surface font-medium">Not linked</span>
                  </Row>
                  <Divider />
                  <Row icon="login" title="Sign-in method" subtitle="Tuma uses X OAuth 2.0 — we never store a password">
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">{X_LOGO} OAuth</span>
                  </Row>
                </Section>

                <Section id="security-section" title="Security & keys" tag={ready ? "Wallet connected" : "Action needed"} query={query}>
                  <Row icon="key" title="Transaction signing" subtitle="X handle verified + wallet signature required for every deposit or refund" badge={handle ? "Enabled" : undefined}>
                    <span className="font-label-sm text-label-sm text-outline">{handle ? `${X_LOGO} @${handle}` : "Sign in with X"}</span>
                  </Row>
                  <Divider />
                  <Row icon="account_balance_wallet" title="Connected wallet" subtitle="Tuma never holds your keys — you sign approvals yourself">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-label-md text-label-md text-on-surface">{address ? shortAddress(address, 6) : "not connected"}</span>
                      {ready ? (
                        <a href={`${ARC_EXPLORER}/address/${ESCROW_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </a>
                      ) : (
                        <button onClick={() => setPickerOpen(true)} className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">Connect</button>
                      )}
                    </div>
                  </Row>
                  <Divider />
                  <Row icon="receipt_long" title="Network & session" subtitle="Current signing network and escrow contract">
                    <span className="font-label-sm text-label-sm text-on-surface">{arc.name} · {shortAddress(ESCROW_ADDRESS, 4)}</span>
                  </Row>
                </Section>

                <Section id="notifications-section" title="Notification channels" tag="Instant routing" query={query}>
                  <ToggleRow title="Transaction notifications" subtitle="Alerts when a payment is created, claimed, refunded, or expires." enabled={settings.notifications} onToggle={() => set("notifications", !settings.notifications)} />
                  <Divider />
                  <ToggleRow title="Security & auth alerts" subtitle="Notices for new wallet connections and signing requests." badge="Recommended" enabled={settings.notifySecurity} onToggle={() => set("notifySecurity", !settings.notifySecurity)} />
                  <Divider />
                  <ToggleRow title="Support concierge & Tumi updates" subtitle="Rate locks, corridor tips, and resolved ticket updates." enabled={settings.companion} onToggle={() => set("companion", !settings.companion)} />
                </Section>

                <Section id="privacy-section" title="Privacy & discovery" tag="Directory visibility" query={query}>
                  <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface">Profile visibility</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Who can preview your handle and public payment link</span>
                    </div>
                    <select
                      value={settings.visibility}
                      onChange={(event) => set("visibility", event.target.value as ProfileSettings["visibility"])}
                      className="bg-surface-container text-on-surface font-label-md text-label-md px-4 py-2 rounded-full outline-none cursor-pointer"
                    >
                      <option value="public">Public (anyone with the link)</option>
                      <option value="contacts">Contacts only</option>
                      <option value="private">Private (direct request only)</option>
                    </select>
                  </div>
                  <Divider />
                  <ToggleRow title="Find me by payment link" subtitle="Allow senders who have your link to open a prefilled send." enabled={settings.discoverable} onToggle={() => set("discoverable", !settings.discoverable)} />
                  <Divider />
                  <ToggleRow title="Show in quick recipients" subtitle="Surface your handle in Tuma quick-send suggestions." enabled={settings.directorySearch} onToggle={() => set("directorySearch", !settings.directorySearch)} />
                </Section>

                <Section id="support-section" title="Assistance & system health" tag="Help desk" query={query}>
                  <a href="https://docs.arc.io" target="_blank" rel="noopener noreferrer" className="p-space-lg flex items-center justify-between hover:bg-surface-container-low/60 transition-colors">
                    <div className="flex items-start gap-space-md">
                      <span className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">menu_book</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface">Knowledge base</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Arc docs, USDC, and escrow settlement guides</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  </a>
                  <Divider />
                  <div className="p-space-lg flex items-center justify-between">
                    <div className="flex items-start gap-space-md">
                      <span className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">support_agent</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface">Priority concierge</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Ask Tumi anything about your payments or escrow</span>
                      </div>
                    </div>
                    <button onClick={() => flash("Tumi is ready — use the Ask Tumi widget in the corner.")} className="px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">Open chat</button>
                  </div>
                  <Divider />
                  <div className="p-space-lg flex items-center justify-between bg-surface-container-low/30">
                    <div className="flex items-center gap-space-md">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Arc network operational</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Escrow contract reachable · chain {arc.id}</span>
                      </div>
                    </div>
                    <a href={ARC_EXPLORER} target="_blank" rel="noopener noreferrer" className="font-mono text-label-sm text-label-sm text-outline hover:text-on-surface">explorer.arc.io</a>
                  </div>
                </Section>

                <Section title="Danger zone" tag="Irreversible actions" danger query={query}>
                  <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface">Sign out everywhere</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">Clear your X session and disconnect the connected wallet.</span>
                    </div>
                    <button onClick={() => { signOut(); disconnect(); }} className="px-space-md py-2 rounded-full bg-surface-container-high hover:bg-error-container hover:text-error text-on-surface font-label-md text-label-md transition-colors shrink-0">Sign out all sessions</button>
                  </div>
                  <div className="h-[1px] bg-error-container/30 mx-space-lg"></div>
                  <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-error">Reset local profile</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">Clear your locally saved profile and preferences on this device (demo data only).</span>
                    </div>
                    <button
                      onClick={() => { resetProfile(); setDraft(null); flash("Local profile reset."); }}
                      className="px-space-md py-2 rounded-full bg-error text-on-error hover:opacity-90 font-label-md text-label-md shadow-sm transition-all shrink-0"
                    >
                      Reset profile
                    </button>
                  </div>
                </Section>
              </div>

              {/* Right */}
              <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
                <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="relative">
                      <span className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-headline-sm">
                        {(settings.displayName || handle || "TU").slice(0, 2).toUpperCase()}
                      </span>
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-on-secondary-container">check</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">{settings.displayName || session?.user?.name || "Your profile"}</h3>
                      <span className="font-body-sm text-body-sm text-outline">{handle ? `@${handle}` : "not signed in"} • {memberSince ? `since ${memberSince}` : "new account"}</span>
                    </div>
                  </div>
                  <div className="h-[1px] bg-surface-container"></div>
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Account status</span>
                      <span className="font-label-md text-label-md text-primary font-bold">{ready ? "Wallet linked" : "Wallet needed"}</span>
                    </div>
                    <div className="bg-surface-container-low p-space-sm rounded-DEFAULT flex flex-col gap-1">
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Network:</span>
                        <span className="font-semibold text-on-surface">{arc.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Balance:</span>
                        <span className="text-secondary font-medium">{balance ? `${balance.formatted.slice(0, 8)} USDC` : "—"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-xs pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Security score</span>
                      <span className="font-label-md text-label-md text-secondary font-bold">{securityScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-secondary-container rounded-full" style={{ width: `${securityScore}%` }}></div>
                    </div>
                    <p className="font-body-sm text-body-sm text-outline mt-1 leading-tight">Higher when a wallet is connected and security alerts are on.</p>
                  </div>
                  <div className="h-[1px] bg-surface-container"></div>
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Preferred currency</span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-medium">{settings.currency} default</span>
                      <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-medium">USDC on Arc</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-md rounded-lg flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Escrow shield</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Funds held on-chain until claimed</span>
                    </div>
                  </div>
                </div>

                <div className="px-space-xs flex flex-col gap-0.5 text-center">
                  <span className="font-label-sm text-label-sm text-outline">Tuma web · Arc mainnet</span>
                  <span className="font-label-sm text-label-sm text-outline">Escrow-backed · USDC-native</span>
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

function Section({
  id,
  title,
  tag,
  danger,
  query,
  children,
}: {
  id?: string;
  title: string;
  tag: string;
  danger?: boolean;
  query: string;
  children: ReactNode;
}) {
  const text = `${title} ${tag}`.toLowerCase();
  const hidden = query.trim() !== "" && !text.includes(query.trim().toLowerCase());
  if (hidden) return null;
  return (
    <section id={id} className="flex flex-col gap-space-sm scroll-mt-24">
      <div className="flex items-center justify-between px-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className={`w-7 h-7 rounded-full bg-surface-container flex items-center justify-center ${danger ? "text-error" : "text-primary"}`}>
            <span className="material-symbols-outlined text-[16px]">{danger ? "warning" : "tune"}</span>
          </span>
          <h2 className={`font-headline-sm text-headline-sm ${danger ? "text-error font-bold" : "text-on-surface"}`}>{title}</h2>
        </div>
        <span className={`font-label-sm text-label-sm uppercase tracking-wider ${danger ? "text-error/80" : "text-outline"}`}>{tag}</span>
      </div>
      <div className={`bg-surface-container-lowest rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] overflow-hidden flex flex-col ${danger ? "bg-gradient-to-b from-error-container/10 to-transparent" : ""}`}>
        {children}
      </div>
    </section>
  );
}

function Row({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="p-space-lg flex items-center justify-between gap-space-md hover:bg-surface-container-low/60 transition-colors">
      <div className="flex items-start gap-space-md">
        <span className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-lg text-label-lg text-on-surface">{title}</span>
            {badge ? <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">{badge}</span> : null}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">{subtitle}</span>
          <div className="mt-1.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ title, subtitle, badge, enabled, onToggle }: { title: string; subtitle: string; badge?: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="p-space-lg flex items-center justify-between gap-space-md hover:bg-surface-container-low/60 transition-colors">
      <div className="flex flex-col pr-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-lg text-label-lg text-on-surface">{title}</span>
          {badge ? <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-container font-bold">{badge}</span> : null}
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">{subtitle}</span>
      </div>
      <button onClick={onToggle} aria-pressed={enabled} className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${enabled ? "bg-primary-container" : "bg-surface-container"}`}>
        <span className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-5" : ""}`}></span>
      </button>
    </div>
  );
}

function Divider() {
  return <div className="h-[1px] bg-surface-container mx-space-lg"></div>;
}
