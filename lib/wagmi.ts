import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arc } from "./arc";
import { SITE_URL } from "./site";

/// Must match the domain the app is served from, or WalletConnect Verify flags the
/// site as a possible scam. Uses the live origin in the browser, SITE_URL on the server.
const siteUrl = typeof window !== "undefined" ? window.location.origin : SITE_URL;

/// Empty when the Reown project id is not configured; the app then falls back to the
/// plain injected-wallet flow instead of AppKit. Trim whitespace and validate the
/// 32-char hex format so a stray space or `<optional>` placeholder disables AppKit
/// instead of initialising it with an invalid id.
const projectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "").trim();
const isValidProjectId = /^[0-9a-f]{32}$/i.test(projectId);

const transports = { [arc.id]: http(process.env.NEXT_PUBLIC_ARC_RPC) };

/// Whether the Reown AppKit connection layer is active. Kept at module scope so the
/// AppKit / injected components never call the AppKit hooks conditionally.
export const appKitEnabled = isValidProjectId;

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
