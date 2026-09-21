import { NextResponse } from "next/server";
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { auth } from "@/auth";
import { TumaEscrowABI } from "@/lib/abi";
import { ESCROW_ADDRESS, arc, isEscrowConfigured } from "@/lib/arc";
import { getPayment } from "@/lib/chain";
import { recordClaim, upsertUser } from "@/lib/ledger";

export const runtime = "nodejs";

const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY as `0x${string}` | undefined;

const publicClient = createPublicClient({
  chain: arc,
  transport: http(process.env.NEXT_PUBLIC_ARC_RPC),
});

/// Prevents a double-click from sending two release transactions for the same id.
const inFlight = new Set<string>();

/// Very small in-memory rate limit. Fine for a single demo server.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > RATE_MAX;
}

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function releaseErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      switch (reverted.data?.errorName) {
        case "NotOpen":
          return "This payment has already been claimed or refunded.";
        case "ZeroAddress":
          return "Enter a valid wallet address.";
        case "NotOperator":
          return "The server wallet is not allowed to release funds.";
        default:
          break;
      }
    }
    if (/user rejected|denied/i.test(error.message)) return "The transaction was rejected.";
    return error.shortMessage ?? error.message;
  }
  return "Something went wrong while releasing the funds.";
}

export async function POST(request: Request) {
  const session = await auth();
  const username = session?.user?.username?.toLowerCase();
  if (!username) return fail("Please sign in with X first.", 401);

  if (!isEscrowConfigured) return fail("Escrow is not configured yet.", 503);
  if (!OPERATOR_PRIVATE_KEY) return fail("The server operator wallet is not configured.", 503);

  if (rateLimited(username)) {
    return fail("Too many attempts. Wait a minute and try again.", 429);
  }

  let body: { id?: unknown; recipient?: unknown };
  try {
    body = (await request.json()) as { id?: unknown; recipient?: unknown };
  } catch {
    return fail("Invalid request.");
  }

  const id = String(body.id ?? "");
  const recipient = typeof body.recipient === "string" ? body.recipient.trim() : "";
  if (!/^\d+$/.test(id)) return fail("Invalid payment id.");
  if (!isAddress(recipient)) return fail("Enter a valid wallet address.");

  let payment;
  try {
    payment = await getPayment(id);
  } catch {
    return fail("Could not read the payment right now. Please try again.", 502);
  }

  if (!payment) return fail("This payment does not exist.", 404);
  if (payment.status !== 0) return fail("This payment has already been claimed or refunded.", 409);
  if (payment.handle.toLowerCase() !== username) {
    return fail(
      `You're signed in as @${username} but this payment is for @${payment.handle}.`,
      403,
    );
  }

  if (inFlight.has(id)) return fail("This claim is already being processed.", 409);
  inFlight.add(id);

  try {
    const account = privateKeyToAccount(OPERATOR_PRIVATE_KEY);
    const wallet = createWalletClient({
      account,
      chain: arc,
      transport: http(process.env.NEXT_PUBLIC_ARC_RPC),
    });

    const hash = await wallet.writeContract({
      address: ESCROW_ADDRESS,
      abi: TumaEscrowABI,
      functionName: "release",
      args: [BigInt(id), recipient],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") return fail("The release transaction failed.", 502);

    // Persist the claim + release tx hash (no-op without a database).
    const xUserId = session?.user?.xUserId ?? null;
    const userId = xUserId
      ? await upsertUser({
          xUserId,
          username,
          name: session?.user?.name ?? null,
          image: session?.user?.image ?? null,
        }).catch(() => null)
      : null;
    await recordClaim({ escrowId: id, recipient, txHash: hash, userId, username }).catch(() => undefined);

    return NextResponse.json({ txHash: hash });
  } catch (error) {
    return fail(releaseErrorMessage(error), 500);
  } finally {
    inFlight.delete(id);
  }
}
