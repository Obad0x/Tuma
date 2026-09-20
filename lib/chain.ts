import { createPublicClient, http } from "viem";
import { TumaEscrowABI } from "./abi";
import { ESCROW_ADDRESS, USDC_DECIMALS, arc } from "./arc";
import { formatUnits } from "./format";

/// Server-side read-only client for Arc Mainnet.
export const arcPublicClient = createPublicClient({
  chain: arc,
  transport: http(process.env.NEXT_PUBLIC_ARC_RPC),
});

export type PaymentView = {
  id: string;
  sender: `0x${string}`;
  amount: string;
  handle: string;
  expiry: number;
  expiryLabel: string;
  expired: boolean;
  status: number;
};

/// Reads a payment from the escrow. Returns null when the id is invalid or the
/// payment does not exist. Throws on RPC errors so callers can tell the two apart.
export async function getPayment(id: string): Promise<PaymentView | null> {
  if (!/^\d+$/.test(id)) return null;

  const [sender, amount, handle, expiry, status] = await arcPublicClient.readContract({
    address: ESCROW_ADDRESS,
    abi: TumaEscrowABI,
    functionName: "payments",
    args: [BigInt(id)],
  });

  if (sender === "0x0000000000000000000000000000000000000000") return null;

  const expirySeconds = Number(expiry);
  return {
    id,
    sender,
    amount: formatUnits(amount, USDC_DECIMALS),
    handle,
    expiry: expirySeconds,
    expiryLabel: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(expirySeconds * 1000),
    ),
    expired: status === 0 && Math.floor(Date.now() / 1000) > expirySeconds,
    status: Number(status),
  };
}
