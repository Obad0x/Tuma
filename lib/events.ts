import type { PublicClient } from "viem";
import { TumaEscrowABI } from "./abi";
import { ESCROW_ADDRESS, ESCROW_DEPLOY_BLOCK, USDC_DECIMALS } from "./arc";
import { formatUnits } from "./format";

export type SenderPayment = {
  id: string;
  handle: string;
  amount: string;
  createdAt: number;
  createdLabel: string;
  expiry: number;
  expiryLabel: string;
  expired: boolean;
  status: number;
};

export type SenderOverview = {
  payments: SenderPayment[];
  /// Settlement speed (seconds) per payment id, for claimed payments.
  speeds: Record<string, number>;
};

/// Some RPCs cap eth_getLogs ranges, so we scan in chunks.
const CHUNK = 10_000n;
const MAX_CHUNKS = 200;
const CLAIM_PERIOD_SECONDS = 30 * 24 * 60 * 60;

/// When the deploy block is unknown (0), only scan a recent window instead of
/// walking from genesis — that is what makes the first load crawl.
const UNKNOWN_WINDOW = 50_000n;
function scanStart(latest: bigint): bigint {
  if (ESCROW_DEPLOY_BLOCK > 0n) return ESCROW_DEPLOY_BLOCK;
  return latest > UNKNOWN_WINDOW ? latest - UNKNOWN_WINDOW : 0n;
}

/// Single pass over the escrow logs: gets the sender's payments *and* their
/// settlement speeds together, so pages never scan the same logs twice.
export async function fetchSenderOverview(
  client: PublicClient,
  sender: `0x${string}`,
): Promise<SenderOverview> {
  const latest = await client.getBlockNumber();
  const deposits: { id: bigint; handle: string; amount: bigint; expiry: bigint; block: bigint }[] =
    [];
  const releaseBlocks = new Map<string, bigint>();

  let from = scanStart(latest);
  let chunks = 0;
  while (from <= latest && chunks < MAX_CHUNKS) {
    const to = from + CHUNK - 1n > latest ? latest : from + CHUNK - 1n;

    const [depositEvents, releaseEvents] = await Promise.all([
      client.getContractEvents({
        address: ESCROW_ADDRESS,
        abi: TumaEscrowABI,
        eventName: "Deposited",
        args: { sender },
        fromBlock: from,
        toBlock: to,
      }),
      client.getContractEvents({
        address: ESCROW_ADDRESS,
        abi: TumaEscrowABI,
        eventName: "Released",
        fromBlock: from,
        toBlock: to,
      }),
    ]);

    for (const event of depositEvents) {
      const { id, handle, amount, expiry } = event.args;
      if (
        id === undefined ||
        handle === undefined ||
        amount === undefined ||
        expiry === undefined ||
        event.blockNumber == null
      ) {
        continue;
      }
      deposits.push({ id, handle, amount, expiry, block: event.blockNumber });
    }
    for (const event of releaseEvents) {
      if (event.args.id !== undefined && event.blockNumber != null) {
        releaseBlocks.set(event.args.id.toString(), event.blockNumber);
      }
    }

    from = to + 1n;
    chunks++;
  }

  // Fetch block timestamps once (deduped) for deposits and releases.
  const blockTimestamps = new Map<string, bigint>();
  const blocks = new Set<string>();
  for (const deposit of deposits) blocks.add(deposit.block.toString());
  for (const [, block] of releaseBlocks) blocks.add(block.toString());
  await Promise.all(
    [...blocks].map(async (blockNumber) => {
      const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
      blockTimestamps.set(blockNumber, block.timestamp);
    }),
  );

  // One batched call for all statuses instead of N individual reads.
  const statuses = await client
    .multicall({
      contracts: deposits.map((deposit) => ({
        address: ESCROW_ADDRESS,
        abi: TumaEscrowABI,
        functionName: "payments",
        args: [deposit.id],
      })),
      allowFailure: true,
    })
    .catch(() => []);

  const now = Math.floor(Date.now() / 1000);
  const payments: SenderPayment[] = deposits.map((deposit, index) => {
    const result = statuses[index];
    const status =
      result && result.status === "success"
        ? Number((result.result as unknown as readonly [string, bigint, string, bigint, number])[4])
        : 0;
    const expirySeconds = Number(deposit.expiry);
    const createdBlock = blockTimestamps.get(deposit.block.toString());
    const createdSeconds =
      createdBlock !== undefined ? Number(createdBlock) : expirySeconds - CLAIM_PERIOD_SECONDS;
    return {
      id: deposit.id.toString(),
      handle: deposit.handle,
      amount: formatUnits(deposit.amount, USDC_DECIMALS),
      createdAt: createdSeconds,
      createdLabel: new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(createdSeconds * 1000)),
      expiry: expirySeconds,
      expiryLabel: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(expirySeconds * 1000),
      ),
      expired: status === 0 && now > expirySeconds,
      status,
    } satisfies SenderPayment;
  });

  const speeds: Record<string, number> = {};
  for (const deposit of deposits) {
    const id = deposit.id.toString();
    const releaseBlock = releaseBlocks.get(id);
    if (releaseBlock === undefined) continue;
    const start = blockTimestamps.get(deposit.block.toString());
    const end = blockTimestamps.get(releaseBlock.toString());
    if (start === undefined || end === undefined) continue;
    const seconds = Number(end - start);
    if (seconds >= 0) speeds[id] = seconds;
  }

  payments.sort((a, b) => Number(BigInt(b.id) - BigInt(a.id)));
  return { payments, speeds };
}

/// Payments-only convenience wrapper.
export async function fetchSenderPayments(
  client: PublicClient,
  sender: `0x${string}`,
): Promise<SenderPayment[]> {
  return (await fetchSenderOverview(client, sender)).payments;
}
