import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arc } from "./arc";

/// wagmi config for the browser. `ssr: true` avoids hydration mismatches in
/// the Next.js App Router. NEXT_PUBLIC_ARC_RPC is an optional RPC override.
export const wagmiConfig = createConfig({
  chains: [arc],
  connectors: [injected()],
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
