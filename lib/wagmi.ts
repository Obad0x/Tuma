import { createConfig, http, type CreateConnectorFn } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { arc } from "./arc";

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
        url: "https://tuma.app",
        icons: [],
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
