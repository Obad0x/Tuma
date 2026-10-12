import { arc } from "viem/chains";

/// Arc Mainnet. viem ships the chain metadata: id 5042, USDC gas token
/// (18 native decimals), and https://explorer.arc.io.
export { arc };

export const ARC_EXPLORER = arc.blockExplorers.default.url;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

/// Env values may be missing, blank, or left as the `<...>` placeholders from
/// `.env.example`. Never let a bad value leak into the app or crash the build.
function readAddress(value: string | undefined, fallback: `0x${string}`): `0x${string}` {
  const trimmed = value?.trim();
  return trimmed && ADDRESS_PATTERN.test(trimmed) ? (trimmed as `0x${string}`) : fallback;
}

function readDeployBlock(value: string | undefined): bigint {
  const trimmed = value?.trim();
  return trimmed && /^\d+$/.test(trimmed) ? BigInt(trimmed) : 0n;
}

/// USDC is exposed both as the native gas token (18 decimals) and as an ERC-20
/// interface (6 decimals). Always use this address with 6 decimals.
export const USDC_ADDRESS = readAddress(
  process.env.NEXT_PUBLIC_USDC_ADDRESS,
  "0x3600000000000000000000000000000000000000",
);

export const USDC_DECIMALS = 6;

/// Filled in after deploying the escrow (see docs/SETUP.md).
export const ESCROW_ADDRESS = readAddress(process.env.NEXT_PUBLIC_ESCROW_ADDRESS, ZERO_ADDRESS);

export const ESCROW_DEPLOY_BLOCK = readDeployBlock(process.env.NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK);

export const isEscrowConfigured = ESCROW_ADDRESS !== ZERO_ADDRESS;
