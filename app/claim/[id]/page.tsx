import { ClaimExperience } from "@/components/claim-experience";
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

  return <ClaimExperience id={id} payment={payment} loadError={loadError} />;
}
