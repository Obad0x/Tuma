import { NextResponse } from "next/server";

/// Free USD exchange rates (no API key). Cached for an hour.
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`rates request failed: ${res.status}`);

    const data = (await res.json()) as {
      result?: string;
      base_code?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };

    if (data.result !== "success" || !data.rates) {
      throw new Error("rates response malformed");
    }

    return NextResponse.json({
      base: data.base_code ?? "USD",
      rates: data.rates,
      updatedAt: data.time_last_update_utc ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Could not load exchange rates." }, { status: 502 });
  }
}
