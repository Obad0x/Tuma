import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress, parseEventLogs } from "viem";
import { auth } from "@/auth";
import { TumaEscrowABI } from "@/lib/abi";
import { ESCROW_ADDRESS, USDC_DECIMALS, arc, isEscrowConfigured } from "@/lib/arc";
import { dbEnabled } from "@/lib/db";
import { formatUnits } from "@/lib/format";
import { isSameOrigin } from "@/lib/http";
import { isRateLimited, recordDeposit } from "@/lib/ledger";

export const runtime = "nodejs";

const publicClient = createPublicClient({
  chain: arc,
  transport: http(process.env.NEXT_PUBLIC_ARC_RPC),
});

/// Persist a deposit + its tx hash. Requires a signed-in session AND verifies
/// the referenced transaction actually contains the matching Deposited event,
/// so records cannot be spoofed. No-op without a database.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const session = await auth();
  const username = session?.user?.username?.toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "Please sign in with X first." }, { status: 401 });
  }

  if (!dbEnabled) return NextResponse.json({ persisted: false });
  if (!isEscrowConfigured) {
    return NextResponse.json({ error: "Escrow is not configured yet." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const escrowId = String(body.escrowId ?? "").trim();
  const sender = String(body.sender ?? "").trim();
  const depositTxHash = String(body.depositTxHash ?? "").trim();
  const note = body.note ? String(body.note).slice(0, 140) : undefined;

  if (!/^\d{1,20}$/.test(escrowId)) {
    return NextResponse.json({ error: "Invalid payment id." }, { status: 400 });
  }
  if (!isAddress(sender)) {
    return NextResponse.json({ error: "Invalid sender address." }, { status: 400 });
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(depositTxHash)) {
    return NextResponse.json({ error: "Invalid transaction hash." }, { status: 400 });
  }

  if (await isRateLimited(`payments:${username}`, 30, 60)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // Verify the deposit really happened on-chain.
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({
      hash: depositTxHash as `0x${string}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not verify that deposit transaction on-chain." },
      { status: 400 },
    );
  }
  if (receipt.status !== "success") {
    return NextResponse.json({ error: "That transaction did not succeed." }, { status: 400 });
  }

  const [log] = parseEventLogs({
    abi: TumaEscrowABI,
    logs: receipt.logs,
    eventName: "Deposited",
  });
  if (!log || log.address.toLowerCase() !== ESCROW_ADDRESS.toLowerCase()) {
    return NextResponse.json(
      { error: "No matching deposit found in that transaction." },
      { status: 400 },
    );
  }

  const args = log.args as unknown as {
    id: bigint;
    sender: `0x${string}`;
    handle: string;
    amount: bigint;
    expiry: bigint;
  };
  if (args.id.toString() !== escrowId) {
    return NextResponse.json({ error: "Payment id mismatch." }, { status: 400 });
  }
  if (args.sender.toLowerCase() !== sender.toLowerCase()) {
    return NextResponse.json({ error: "Sender mismatch." }, { status: 400 });
  }

  try {
    await recordDeposit({
      escrowId,
      sender: args.sender,
      handle: args.handle.toLowerCase(),
      amountWei: args.amount.toString(),
      amountUsdc: formatUnits(args.amount, USDC_DECIMALS),
      expiry: Number(args.expiry),
      depositTxHash,
      depositBlock: Number(receipt.blockNumber),
      note,
    });
    return NextResponse.json({ persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not persist the payment." }, { status: 500 });
  }
}
