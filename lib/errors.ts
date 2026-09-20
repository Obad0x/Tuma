/// Turns wallet / RPC errors into short, human-friendly messages.

export function friendlyError(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as { shortMessage?: string; message?: string };
    const msg = e.shortMessage ?? e.message ?? "";

    if (/user rejected|user denied|rejected the request/i.test(msg)) {
      return "You rejected the request in your wallet.";
    }
    if (/insufficient funds/i.test(msg)) {
      return "Not enough USDC to cover the amount and gas.";
    }
    if (/chain .*not.*(added|configured)|unrecognized chain/i.test(msg)) {
      return "Arc Testnet is not in your wallet yet. Approve adding it, then try again.";
    }
    if (e.shortMessage) return e.shortMessage;
    if (e.message) return e.message;
  }
  return "Something went wrong. Please try again.";
}
