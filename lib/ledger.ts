import { PaymentStatus } from "@prisma/client";
import type { PublicClient } from "viem";
import { TumaEscrowABI } from "./abi";
import { arc, ESCROW_ADDRESS, ESCROW_DEPLOY_BLOCK, USDC_DECIMALS } from "./arc";
import { getDb } from "./db";
import { formatUnits } from "./format";

export type DepositInput = {
  escrowId: string;
  sender: string;
  handle: string;
  amountWei: string;
  amountUsdc: string;
  expiry: number;
  depositTxHash: string;
  depositBlock: number;
  note?: string;
};

/// Persist a deposit + its on-chain tx hash. No-op without a database.
export async function recordDeposit(input: DepositInput): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.payment.upsert({
    where: { escrowId: input.escrowId },
    create: {
      escrowId: input.escrowId,
      chainId: arc.id,
      contractAddress: ESCROW_ADDRESS.toLowerCase(),
      sender: input.sender.toLowerCase(),
      handle: input.handle.toLowerCase(),
      amountWei: input.amountWei,
      amountUsdc: input.amountUsdc,
      expiry: new Date(input.expiry * 1000),
      status: PaymentStatus.OPEN,
      depositTxHash: input.depositTxHash,
      depositBlock: BigInt(input.depositBlock),
      note: input.note,
    },
    update: {
      depositTxHash: input.depositTxHash,
      depositBlock: BigInt(input.depositBlock),
    },
  });
}

/// Upsert the signed-in X user.
export async function upsertUser(input: {
  xUserId: string;
  username: string;
  name?: string | null;
  image?: string | null;
}): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const user = await db.user.upsert({
    where: { xUserId: input.xUserId },
    create: {
      xUserId: input.xUserId,
      username: input.username.toLowerCase(),
      name: input.name ?? null,
      image: input.image ?? null,
    },
    update: {
      username: input.username.toLowerCase(),
      name: input.name ?? null,
      image: input.image ?? null,
    },
  });
  return user.id;
}

/// Record a release (claim) with its tx hash.
export async function recordClaim(input: {
  escrowId: string;
  recipient: string;
  txHash: string;
  userId?: string | null;
  username?: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  const payment = await db.payment.findUnique({ where: { escrowId: input.escrowId } });
  if (!payment) return;
  await db.$transaction([
    db.payment.update({
      where: { escrowId: input.escrowId },
      data: {
        status: PaymentStatus.CLAIMED,
        releaseTxHash: input.txHash,
        recipient: input.recipient.toLowerCase(),
      },
    }),
    db.claim.create({
      data: {
        paymentId: payment.id,
        userId: input.userId ?? undefined,
        username: input.username ?? null,
        recipient: input.recipient.toLowerCase(),
        txHash: input.txHash,
      },
    }),
  ]);
}

/// Record a refund with its tx hash.
export async function recordRefund(input: { escrowId: string; txHash: string }): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.payment
    .update({
      where: { escrowId: input.escrowId },
      data: { status: PaymentStatus.REFUNDED, refundTxHash: input.txHash },
    })
    .catch(() => undefined);
}

/// Payments (with tx hashes) for a sender wallet.
export async function listPaymentsForSender(sender: string) {
  const db = getDb();
  if (!db) return [];
  return db.payment.findMany({
    where: { sender: sender.toLowerCase() },
    orderBy: { depositBlock: "desc" },
  });
}

/// A single payment by its on-chain id (with tx hashes).
export async function getPaymentRecord(escrowId: string) {
  const db = getDb();
  if (!db) return null;
  return db.payment.findUnique({ where: { escrowId } });
}

/// Backfill payments from escrow events into the database.
export async function indexEscrow(client: PublicClient): Promise<{ indexed: number }> {
  const db = getDb();
  if (!db) return { indexed: 0 };

  const latest = await client.getBlockNumber();
  const state = await db.indexerState.findUnique({ where: { id: "escrow" } });
  const deployBlock = ESCROW_DEPLOY_BLOCK;
  const start = state && state.lastBlock > deployBlock ? state.lastBlock + 1n : deployBlock;

  let from = start;
  let count = 0;
  const CHUNK = 10_000n;
  while (from <= latest) {
    const to = from + CHUNK - 1n > latest ? latest : from + CHUNK - 1n;
    const events = (await client.getContractEvents({
      address: ESCROW_ADDRESS,
      abi: TumaEscrowABI,
      fromBlock: from,
      toBlock: to,
    })) as Array<{ eventName: string; args: Record<string, unknown>; blockNumber: bigint; transactionHash: string }>;

    for (const event of events) {
      const id = event.args.id;
      if (id === undefined) continue;
      const escrowId = String(id);
      if (event.eventName === "Deposited") {
        const amount = event.args.amount as bigint;
        const expiry = Number(event.args.expiry);
        await db.payment.upsert({
          where: { escrowId },
          create: {
            escrowId,
            chainId: arc.id,
            contractAddress: ESCROW_ADDRESS.toLowerCase(),
            sender: String(event.args.sender).toLowerCase(),
            handle: String(event.args.handle).toLowerCase(),
            amountWei: amount.toString(),
            amountUsdc: formatUnits(amount, USDC_DECIMALS),
            expiry: new Date(expiry * 1000),
            status: PaymentStatus.OPEN,
            depositTxHash: event.transactionHash,
            depositBlock: event.blockNumber,
          },
          update: {
            depositTxHash: event.transactionHash,
            depositBlock: event.blockNumber,
          },
        });
        count++;
      } else if (event.eventName === "Released") {
        await db.payment
          .update({ where: { escrowId }, data: { status: PaymentStatus.CLAIMED, releaseTxHash: event.transactionHash, recipient: String(event.args.to).toLowerCase() } })
          .catch(() => undefined);
      } else if (event.eventName === "Refunded") {
        await db.payment
          .update({ where: { escrowId }, data: { status: PaymentStatus.REFUNDED, refundTxHash: event.transactionHash } })
          .catch(() => undefined);
      }
    }

    from = to + 1n;
  }

  await db.indexerState.upsert({
    where: { id: "escrow" },
    create: { id: "escrow", lastBlock: latest },
    update: { lastBlock: latest },
  });

  return { indexed: count };
}
