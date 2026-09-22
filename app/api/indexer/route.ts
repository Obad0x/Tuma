import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { arc, isEscrowConfigured } from "@/lib/arc";
import { isAdminRequest } from "@/lib/admin-auth";
import { dbEnabled } from "@/lib/db";
import { isSameOrigin } from "@/lib/http";
import { indexEscrow, isRateLimited } from "@/lib/ledger";

export const runtime = "nodejs";

/// Backfill escrow payments + tx hashes from chain events into the database.
/// Protected by ADMIN_SECRET (header) or the console cookie.
async function run(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  if (!dbEnabled) {
    return NextResponse.json({ error: "No database configured." }, { status: 503 });
  }
  if (!isEscrowConfigured) {
    return NextResponse.json(
      { error: "Escrow is not configured yet (deploy it first)." },
      { status: 503 },
    );
  }
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (await isRateLimited("indexer", 6, 60)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const client = createPublicClient({
      chain: arc,
      transport: http(process.env.NEXT_PUBLIC_ARC_RPC),
    });
    const result = await indexEscrow(client);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Indexer failed." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return run(request);
}

export async function GET(request: Request) {
  return run(request);
}
