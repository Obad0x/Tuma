import Link from "next/link";
import { getSystemStatus, type SystemCheck } from "@/lib/status";

export const dynamic = "force-dynamic";

const DOT: Record<SystemCheck["status"], string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

const LABEL: Record<SystemCheck["status"], string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Outage",
};

export default async function StatusPage() {
  let checks: SystemCheck[] = [];
  try {
    checks = await getSystemStatus();
  } catch {
    checks = [];
  }
  const allOk = checks.length > 0 && checks.every((check) => check.status === "operational");

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-on-surface">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Tuma" className="h-8 w-8 rounded-lg object-cover" src="/images/tuma-logo.jpg" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tuma Status</h1>
            <p className="text-xs text-on-surface-variant">Live system health</p>
          </div>
        </div>

        <div
          className={`mb-6 rounded-2xl border p-5 ${
            allOk
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="text-sm font-semibold">
            {allOk ? "All systems operational" : "Some systems need attention"}
          </p>
          <p className="text-xs opacity-80">
            Checked {new Date().toUTCString()}
          </p>
        </div>

        <div className="divide-y divide-surface-container overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest">
          {checks.length === 0 ? (
            <div className="p-5 text-sm text-on-surface-variant">Could not run checks.</div>
          ) : (
            checks.map((check) => (
              <div key={check.name} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${DOT[check.status]}`} />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{check.name}</p>
                    <p className="text-xs text-on-surface-variant">{check.detail}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {LABEL[check.status]}
                </span>
              </div>
            ))
          )}
        </div>

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          <Link href="/" className="underline">
            Back to Tuma
          </Link>
        </p>
      </div>
    </main>
  );
}
