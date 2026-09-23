import type { Metadata } from "next";
import { HomeDashboard } from "@/components/home-dashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Dashboard",
  description:
    "Your Tuma dashboard: wallet, live FX rates and recent on-chain activity.",
  path: "/dashboard",
  noindex: true,
});

export default function DashboardPage() {
  return <HomeDashboard />;
}
