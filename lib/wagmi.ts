import { createConfig, http, type CreateConnectorFn } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { arc } from "./arc";
import { SITE_URL } from "./site";

/// Must match the domain the app is served from, or WalletConnect Verify flags the
/// site as a possible scam. Uses the live origin in the browser, SITE_URL on the server.
const siteUrl = typeof window !== "undefined" ? window.location.origin : SITE_URL;

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/// Two options only: WalletConnect (QR / mobile) and the injected browser wallet.
const connectors: CreateConnectorFn[] = [];

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: "Tuma",
        description: "Send USDC to an X handle. They claim it with one login.",
        url: siteUrl,
        icons: [`${siteUrl}/icon.jpg`],
      },
    }),
  );
}

connectors.push(injected());

export const wagmiConfig = createConfig({
  chains: [arc],
  connectors,
  transports: {
    [arc.id]: http(process.env.NEXT_PUBLIC_ARC_RPC),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
