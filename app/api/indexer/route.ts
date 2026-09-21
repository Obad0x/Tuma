import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { arc } from "@/lib/arc";
import { dbEnabled } from "@/lib/db";
import { indexEscrow } from "@/lib/ledger";

export const runtime = "nodejs";

/// Backfill escrow payments + tx hashes from chain events into the database.
/// Run once after deploy, or on a schedule.
async function run() {
  if (!dbEnabled) {
    return NextResponse.json({ error: "No database configured." }, { status: 503 });
  }
  const client = createPublicClient({
    chain: arc,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC),
  });
  const result = await indexEscrow(client);
  return NextResponse.json(result);
}

export async function POST() {
  try {
    return await run();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Indexer failed." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}
