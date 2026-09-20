import { ClaimPanel } from "@/components/claim-panel";
import { isEscrowConfigured } from "@/lib/arc";
import { getPayment, type PaymentView } from "@/lib/chain";

export const dynamic = "force-dynamic";

export default async function ClaimPage({ params }: PageProps<"/claim/[id]">) {
  const { id } = await params;

  let payment: PaymentView | null = null;
  let loadError = false;

  if (isEscrowConfigured) {
    try {
      payment = await getPayment(id);
    } catch {
      loadError = true;
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Claim your USDC</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with the X account this payment was sent to.
        </p>
      </div>

      {!isEscrowConfigured ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          The escrow contract is not deployed yet. Set{" "}
          <code className="font-mono">NEXT_PUBLIC_ESCROW_ADDRESS</code> in{" "}
          <code className="font-mono">.env.local</code>.
        </div>
      ) : (
        <ClaimPanel id={id} payment={payment} loadError={loadError} />
      )}
    </main>
  );
}
