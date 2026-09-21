import { NextResponse } from "next/server";
import { dbEnabled } from "@/lib/db";
import { getPaymentRecord } from "@/lib/ledger";

export const runtime = "nodejs";

/// A payment record (with on-chain tx hashes) from the database, if configured.
export async function GET(_request: Request, ctx: RouteContext<"/api/payments/[id]">) {
  if (!dbEnabled) return NextResponse.json({ persisted: false });

  const { id } = await ctx.params;
  const record = await getPaymentRecord(id).catch(() => null);
  if (!record) return NextResponse.json({ persisted: false });

  return NextResponse.json({
    persisted: true,
    escrowId: record.escrowId,
    contractAddress: record.contractAddress,
    sender: record.sender,
    handle: record.handle,
    amountUsdc: record.amountUsdc,
    status: record.status,
    depositTxHash: record.depositTxHash,
    depositBlock: record.depositBlock.toString(),
    releaseTxHash: record.releaseTxHash,
    refundTxHash: record.refundTxHash,
    recipient: record.recipient,
  });
}
