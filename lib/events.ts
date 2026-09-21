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

/// Some RPCs cap eth_getLogs ranges, so we scan in chunks.
const CHUNK = 10_000n;
const MAX_CHUNKS = 200;
const CLAIM_PERIOD_SECONDS = 30 * 24 * 60 * 60;

export async function fetchSenderPayments(
  client: PublicClient,
  sender: `0x${string}`,
): Promise<SenderPayment[]> {
  const latest = await client.getBlockNumber();
  const deposits: { id: bigint; handle: string; amount: bigint; expiry: bigint; block: bigint }[] =
    [];

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
    from = to + 1n;
    chunks++;
  }

  const blockTimestamps = new Map<string, bigint>();
  const blocks = new Set(deposits.map((deposit) => deposit.block.toString()));
  await Promise.all(
    [...blocks].map(async (blockNumber) => {
      const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
      blockTimestamps.set(blockNumber, block.timestamp);
    }),
  );

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
        status: Number(status),
      } satisfies SenderPayment;
    }),
  );

  return payments.sort((a, b) => Number(BigInt(b.id) - BigInt(a.id)));
}

/// Settlement speed (seconds) per payment id, measured from the deposit block
/// timestamp to the release block timestamp, for the sender's claimed payments.
export async function fetchSettlementSpeeds(
  client: PublicClient,
  sender: `0x${string}`,
): Promise<Record<string, number>> {
  const latest = await client.getBlockNumber();
  const depositBlocks = new Map<string, bigint>();
  const releaseBlocks = new Map<string, bigint>();

  let from = ESCROW_DEPLOY_BLOCK;
  let chunks = 0;
  while (from <= latest && chunks < MAX_CHUNKS) {
    const to = from + CHUNK - 1n > latest ? latest : from + CHUNK - 1n;

    const [deposits, releases] = await Promise.all([
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

    for (const event of deposits) {
      if (event.args.id !== undefined && event.blockNumber != null) {
        depositBlocks.set(event.args.id.toString(), event.blockNumber);
      }
    }
    for (const event of releases) {
      if (event.args.id !== undefined && event.blockNumber != null) {
        releaseBlocks.set(event.args.id.toString(), event.blockNumber);
      }
    }

    from = to + 1n;
    chunks++;
  }

  const timestamps = new Map<string, bigint>();
  const blockNumbers = new Set<string>();
  for (const [, block] of depositBlocks) blockNumbers.add(block.toString());
  for (const [, block] of releaseBlocks) blockNumbers.add(block.toString());

  await Promise.all(
    [...blockNumbers].map(async (blockNumber) => {
      const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
      timestamps.set(blockNumber, block.timestamp);
    }),
  );

  const speeds: Record<string, number> = {};
  for (const [id, depositBlock] of depositBlocks) {
    const releaseBlock = releaseBlocks.get(id);
    if (releaseBlock === undefined) continue;
    const start = timestamps.get(depositBlock.toString());
    const end = timestamps.get(releaseBlock.toString());
    if (start === undefined || end === undefined) continue;
    const seconds = Number(end - start);
    if (seconds >= 0) speeds[id] = seconds;
  }

  return speeds;
}

/// Convenience wrapper returning just the durations.
export async function fetchSettlementDurations(
  client: PublicClient,
  sender: `0x${string}`,
): Promise<number[]> {
  const speeds = await fetchSettlementSpeeds(client, sender);
  return Object.values(speeds);
}
