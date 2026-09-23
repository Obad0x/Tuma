import type { Metadata } from "next";
import { SupportView } from "@/components/support-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "Create a support ticket, track replies, and get help with USDC transfers, escrow claims and refunds on Tuma.",
  path: "/support",
});

export default function SupportPage() {
  return <SupportView />;
}
