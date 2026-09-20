/// Small display helpers shared by the pages.

export function shortAddress(address?: string | null, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

/// Formats a token amount without pulling in a big-number library.
export function formatUnits(value: bigint, decimals = 6): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  if (fraction === 0n) return whole.toString();
  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fractionStr}`;
}
