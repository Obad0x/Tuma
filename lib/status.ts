import { createPublicClient, http } from "viem";
import { TumaEscrowABI } from "./abi";
import { ESCROW_ADDRESS, arc, isEscrowConfigured } from "./arc";
import { getDb } from "./db";

export type CheckStatus = "operational" | "degraded" | "down";
export type SystemCheck = { name: string; status: CheckStatus; detail: string };

export async function getSystemStatus(): Promise<SystemCheck[]> {
  const checks: SystemCheck[] = [];
  const client = createPublicClient({
    chain: arc,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC),
  });

  try {
    const block = await client.getBlockNumber();
    checks.push({ name: "Arc RPC", status: "operational", detail: `block #${block}` });
  } catch {
    checks.push({ name: "Arc RPC", status: "down", detail: "unreachable" });
  }

  if (!isEscrowConfigured) {
    checks.push({ name: "Escrow contract", status: "degraded", detail: "not deployed yet" });
  } else {
    try {
      const nextId = await client.readContract({
        address: ESCROW_ADDRESS,
        abi: TumaEscrowABI,
        functionName: "nextId",
      });
      checks.push({
        name: "Escrow contract",
        status: "operational",
        detail: `${Math.max(0, Number(nextId) - 1)} payments recorded`,
      });
    } catch {
      checks.push({ name: "Escrow contract", status: "down", detail: "read failed" });
    }
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    checks.push({
      name: "FX rates",
      status: res.ok ? "operational" : "degraded",
      detail: res.ok ? "live feed reachable" : "upstream error",
    });
  } catch {
    checks.push({ name: "FX rates", status: "down", detail: "unreachable" });
  }

  const db = getDb();
  if (!db) {
    checks.push({ name: "Database", status: "degraded", detail: "not configured" });
  } else {
    try {
      await db.$queryRaw`SELECT 1`;
      checks.push({ name: "Database", status: "operational", detail: "connected" });
    } catch {
      checks.push({ name: "Database", status: "down", detail: "query failed" });
    }
  }

  return checks;
}
