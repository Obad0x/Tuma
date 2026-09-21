import { NextResponse } from "next/server";
import { dbEnabled } from "@/lib/db";
import { recordDeposit } from "@/lib/ledger";

export const runtime = "nodejs";

/// Persist a deposit + its on-chain transaction hash. No-op without a database.
export async function POST(request: Request) {
  if (!dbEnabled) return NextResponse.json({ persisted: false });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const escrowId = body.escrowId ? String(body.escrowId) : "";
  const sender = body.sender ? String(body.sender) : "";
  const handle = body.handle ? String(body.handle) : "";
  const amountWei = body.amountWei ? String(body.amountWei) : "";
  const depositTxHash = body.depositTxHash ? String(body.depositTxHash) : "";
  if (!escrowId || !sender || !handle || !amountWei || !depositTxHash) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    await recordDeposit({
      escrowId,
      sender,
      handle,
      amountWei,
      amountUsdc: body.amountUsdc ? String(body.amountUsdc) : "",
      expiry: Number(body.expiry ?? 0),
      depositTxHash,
      depositBlock: Number(body.depositBlock ?? 0),
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not persist the payment." }, { status: 500 });
  }
}
