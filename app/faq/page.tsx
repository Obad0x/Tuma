import Link from "next/link";
import type { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import { LANDING_FAQS, type ArticleFAQ } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "Answers about sending USDC to an X handle, claiming without a wallet, escrow, refunds, fees and the Arc network on Tuma.",
  path: "/faq",
  keywords: ["Tuma FAQ", "send USDC FAQ", "USDC escrow questions"],
});

const EXTRA_FAQS: ArticleFAQ[] = [
  {
    question: "Is Tuma custodial?",
    answer:
      "No. Deposits sit in the TumaEscrow smart contract on Arc, not with Tuma. The contract enforces deposit, release and refund rules.",
  },
  {
    question: "Which wallets can I use to send?",
    answer:
      "Injected browser wallets, Zerion, and WalletConnect on mobile. Your wallet must be on the Arc network and hold USDC.",
  },
  {
    question: "Can the recipient send the USDC onward?",
    answer:
      "Yes. Once claimed, the USDC is in their wallet and they can hold it, spend it, or send it to someone else through Tuma.",
  },
];

const ALL_FAQS = [...LANDING_FAQS, ...EXTRA_FAQS];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-on-surface">
      <StructuredData data={faqSchema} />
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Tuma" className="h-8 w-8 rounded-lg object-cover" src="/images/tuma-logo.jpg" />
          <Link href="/" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
            Tuma
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Frequently asked questions</h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          Everything you need to know about sending USDC to an X handle, claiming without a wallet,
          escrow and refunds.
        </p>

        <div className="mt-10 flex flex-col gap-6">
          {ALL_FAQS.map((faq) => (
            <section key={faq.question}>
              <h2 className="text-base font-bold text-on-surface">{faq.question}</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{faq.answer}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/send"
            className="inline-flex rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary"
          >
            Send USDC
          </Link>
          <Link
            href="/learn"
            className="inline-flex rounded-full bg-surface-container px-5 py-2.5 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
          >
            Read the guides
          </Link>
          <Link
            href="/support"
            className="inline-flex rounded-full bg-surface-container px-5 py-2.5 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
          >
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}
