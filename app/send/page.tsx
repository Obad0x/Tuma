import { Suspense } from "react";
import type { Metadata } from "next";
import { SendExperience } from "@/components/send-experience";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Send USDC to an X (Twitter) handle",
  description:
    "Send USDC to anyone's X handle in minutes. Connect a wallet, enter a handle and amount, and the funds are escrowed on-chain on Arc until they claim — refundable after 30 days.",
  path: "/send",
  keywords: ["send USDC", "send USDC to X handle", "USDC transfer", "crypto transfer to Twitter"],
});

export default function SendPage() {
  return (
    <Suspense fallback={null}>
      <SendExperience />
    </Suspense>
  );
}
