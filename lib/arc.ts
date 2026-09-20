import { defineChain } from "viem";

/// Arc Testnet. USDC is the native gas token, so native decimals are 18.
/// Anything the user sees or sends must use the ERC-20 interface (6 decimals).
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ARC_RPC || "https://rpc.testnet.arc.network",
        "https://rpc.blockdaemon.testnet.arc.network",
        "https://rpc.drpc.testnet.arc.network",
      ],
    },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export const ARC_EXPLORER = arcTestnet.blockExplorers.default.url;

/// USDC is exposed both as the native gas token (18 decimals) and as an
/// ERC-20 interface (6 decimals). Always use this address with 6 decimals.
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  "0x3600000000000000000000000000000000000000") as `0x${string}`;

export const USDC_DECIMALS = 6;

/// Filled in after deploying the escrow (see docs/SETUP.md).
export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const ESCROW_DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK ?? "0");

export const isEscrowConfigured = ESCROW_ADDRESS !== "0x0000000000000000000000000000000000000000";
