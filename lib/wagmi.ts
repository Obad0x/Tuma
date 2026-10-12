import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { ARC_RPC_URL, arc } from "./arc";
import { SITE_URL } from "./site";

/// Must match the domain the app is served from, or WalletConnect Verify flags the
/// site as a possible scam. Uses the live origin in the browser, SITE_URL on the server.
const siteUrl = typeof window !== "undefined" ? window.location.origin : SITE_URL;

/// Public Reown project id (a client identifier, safe to ship in the bundle). A
/// committed default keeps WalletConnect working when the env var is missing or
/// blank, e.g. when a host sets it to an empty value. An explicit but invalid
/// value disables AppKit, so setting it to "off" only offers injected wallets.
const DEFAULT_WALLETCONNECT_PROJECT_ID = "86f83c9d3b272f9ccf2a029ff4c1b410";
const projectIdPattern = /^[0-9a-f]{32}$/i;
const rawProjectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "").trim();
const projectId = rawProjectId === "" ? DEFAULT_WALLETCONNECT_PROJECT_ID : rawProjectId;

const transports = { [arc.id]: http(ARC_RPC_URL) };

/// Whether the Reown AppKit connection layer is active. Kept at module scope so the
/// AppKit / injected components never call the AppKit hooks conditionally.
export const appKitEnabled = projectIdPattern.test(projectId);

const wagmiAdapter = appKitEnabled
  ? new WagmiAdapter({
      projectId,
      networks: [arc],
      transports,
      ssr: true,
    })
  : undefined;

/// Must run once at module level (never inside a component or effect), otherwise
/// `useAppKit()` throws.
if (wagmiAdapter) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [arc],
    defaultNetwork: arc,
    metadata: {
      name: "Tuma",
      description: "Send USDC to an X handle. They claim it with one login.",
      url: siteUrl,
      icons: [`${siteUrl}/icon-192.png`],
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
      history: false,
    },
  });
}

export const wagmiConfig = wagmiAdapter
  ? wagmiAdapter.wagmiConfig
  : createConfig({
      chains: [arc],
      connectors: [injected()],
      transports,
      ssr: true,
    });

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
