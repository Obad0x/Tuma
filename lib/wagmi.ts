import { createConfig, http, type CreateConnectorFn } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { arc } from "./arc";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/// Injected wallets (MetaMask, Rabby, ...) plus an explicit Zerion target so it
/// shows up as its own option. WalletConnect is enabled when a project id is set,
/// which is how Zerion mobile connects.
const connectors: CreateConnectorFn[] = [injected(), injected({ target: "zerion" })];

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: "Tuma",
        description: "Send USDC to an X handle. They claim it with one login.",
        url: "https://tuma.app",
        icons: [],
      },
    }),
  );
}

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
