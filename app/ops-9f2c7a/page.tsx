import { cookies } from "next/headers";
import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { AdminLogout } from "@/components/admin-logout";
import { getAdminData, type AdminData } from "@/lib/admin";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { isEscrowConfigured } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import { secretMatches } from "@/lib/http";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

// Deliberately non-guessable route. Rename the folder to rotate the entry point.
export default async function ConsolePage() {
  const authed = secretMatches(
    (await cookies()).get(ADMIN_COOKIE)?.value ?? null,
    process.env.ADMIN_SECRET,
  );
  if (!authed) return <AdminLogin />;

  let data: AdminData | null = null;
  let errorMessage: string | null = null;
  if (isEscrowConfigured) {
    try {
      data = await getAdminData();
    } catch (error) {
      errorMessage = friendlyError(error);
    }
  } else {
    errorMessage = "The escrow contract is not deployed yet.";
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tuma Console</h1>
          <p className="text-sm text-zinc-500">Protocol overview, payments and operator tools.</p>
        </div>
        <AdminLogout />
      </div>

      {data ? (
        <AdminDashboard overview={data.overview} payments={data.payments} />
      ) : (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          {errorMessage}
        </div>
      )}
    </main>
  );
}
