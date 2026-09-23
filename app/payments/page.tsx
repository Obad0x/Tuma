import type { Metadata } from "next";
import { ActivityFeed } from "@/components/activity-feed";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Activity",
  description: "Your USDC escrow activity on Tuma — open, claimed and refundable payments.",
  path: "/payments",
  noindex: true,
});

export default function PaymentsPage() {
  return <ActivityFeed />;
}
