import Link from "next/link";
import type { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import { ARTICLES } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Learn: sending USDC to X handles, escrow and Arc",
  description:
    "Guides on sending USDC to an X (Twitter) handle, receiving crypto without a wallet, remittances to Nigeria, escrow safety and the Arc network.",
  path: "/learn",
  keywords: [
    "how to send USDC to X handle",
    "receive USDC without wallet",
    "USDC escrow guide",
    "Arc blockchain guide",
  ],
});

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: ARTICLES.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: article.title,
    url: absoluteUrl(`/learn/${article.slug}`),
  })),
};

export default function LearnIndexPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-on-surface">
      <StructuredData data={itemList} />
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Tuma" className="h-8 w-8 rounded-lg object-cover" src="/images/tuma-logo.jpg" />
          <Link href="/" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
            Tuma
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          Practical guides on sending USDC to an X (Twitter) handle, receiving crypto without a
          wallet, remittances to Nigeria, escrow safety and the Arc network.
        </p>

        <ul className="mt-10 flex flex-col gap-4">
          {ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/learn/${article.slug}`}
                className="block rounded-2xl border border-surface-container bg-surface-container-lowest p-6 transition hover:border-outline-variant"
              >
                <h2 className="text-lg font-semibold text-on-surface">{article.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {article.description}
                </p>
                <span className="mt-3 inline-block text-xs font-semibold text-primary">
                  {article.readingMinutes} min read
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-on-surface-variant">
          Have a question?{" "}
          <Link href="/faq" className="font-semibold text-primary underline">
            Read the FAQ
          </Link>{" "}
          or{" "}
          <Link href="/support" className="font-semibold text-primary underline">
            contact support
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
