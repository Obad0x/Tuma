import { arc } from "viem/chains";

/// Arc Mainnet. viem ships the chain metadata: id 5042, USDC gas token
/// (18 native decimals), and https://explorer.arc.io.
export { arc };

export const ARC_EXPLORER = arc.blockExplorers.default.url;

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
