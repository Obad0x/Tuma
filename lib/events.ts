import type { PublicClient } from "viem";
import { TumaEscrowABI } from "./abi";
import { ESCROW_ADDRESS, ESCROW_DEPLOY_BLOCK, USDC_DECIMALS } from "./arc";
import { formatUnits } from "./format";

export type SenderPayment = {
  id: string;
  handle: string;
  amount: string;
  expiry: number;
  expiryLabel: string;
  expired: boolean;
  status: number;
};

/// Some RPCs cap eth_getLogs ranges, so we scan in chunks.
const CHUNK = 10_000n;
const MAX_CHUNKS = 200;

export async function fetchSenderPayments(
  client: PublicClient,
  sender: `0x${string}`,
): Promise<SenderPayment[]> {
  const latest = await client.getBlockNumber();
  const deposits: { id: bigint; handle: string; amount: bigint; expiry: bigint }[] = [];

  let from = ESCROW_DEPLOY_BLOCK;
  let chunks = 0;
  while (from <= latest && chunks < MAX_CHUNKS) {
    const to = from + CHUNK - 1n > latest ? latest : from + CHUNK - 1n;
    const events = await client.getContractEvents({
      address: ESCROW_ADDRESS,
      abi: TumaEscrowABI,
      eventName: "Deposited",
      args: { sender },
      fromBlock: from,
      toBlock: to,
    });
    for (const event of events) {
      const { id, handle, amount, expiry } = event.args;
      if (id === undefined || handle === undefined || amount === undefined || expiry === undefined) {
        continue;
      }
      deposits.push({ id, handle, amount, expiry });
    }
    from = to + 1n;
    chunks++;
  }

  const now = Math.floor(Date.now() / 1000);
  const payments = await Promise.all(
    deposits.map(async (deposit) => {
      const [, , , , status] = await client.readContract({
        address: ESCROW_ADDRESS,
        abi: TumaEscrowABI,
        functionName: "payments",
        args: [deposit.id],
      });
      const expirySeconds = Number(deposit.expiry);
      return {
        id: deposit.id.toString(),
        handle: deposit.handle,
        amount: formatUnits(deposit.amount, USDC_DECIMALS),
        expiry: expirySeconds,
        expiryLabel: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          new Date(expirySeconds * 1000),
        ),
        expired: status === 0 && now > expirySeconds,
        status: Number(status),
      } satisfies SenderPayment;
    }),
  );

  return payments.sort((a, b) => Number(BigInt(b.id) - BigInt(a.id)));
}
