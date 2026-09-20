import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "./arc";

/// wagmi config for the browser. `ssr: true` avoids hydration mismatches in
/// the Next.js App Router.
export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
