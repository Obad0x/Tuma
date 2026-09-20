import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminData, type AdminData } from "@/lib/admin";
import { isEscrowConfigured } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Protocol overview, payment monitor and operator tools.
        </p>
      </div>

      {!isEscrowConfigured ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          The escrow contract is not deployed yet. Set{" "}
          <code className="font-mono">NEXT_PUBLIC_ESCROW_ADDRESS</code> in{" "}
          <code className="font-mono">.env.local</code>.
        </div>
      ) : (
        <AdminContent />
      )}
    </main>
  );
}

async function AdminContent() {
  let data: AdminData | null = null;
  let errorMessage: string | null = null;

  try {
    data = await getAdminData();
  } catch (error) {
    errorMessage = friendlyError(error);
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Could not load admin data. {errorMessage}
      </div>
    );
  }

  return <AdminDashboard overview={data.overview} payments={data.payments} />;
}
