import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/structured-data";
import { ARTICLES, getArticle } from "@/lib/content";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/learn/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: absoluteUrl(`/learn/${article.slug}`),
      siteName: SITE_NAME,
      publishedTime: article.date,
      modifiedTime: article.updated,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const pageUrl = absoluteUrl(`/learn/${article.slug}`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated,
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/tuma-logo.jpg") },
    },
    mainEntityOfPage: pageUrl,
    keywords: article.keywords.join(", "),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Learn", item: absoluteUrl("/learn") },
      { "@type": "ListItem", position: 3, name: article.title, item: pageUrl },
    ],
  };

  const related = ARTICLES.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-on-surface">
      <StructuredData data={[articleSchema, faqSchema, breadcrumb]} />
      <article className="mx-auto w-full max-w-2xl">
        <nav className="mb-8 text-xs text-on-surface-variant">
          <Link href="/" className="hover:text-on-surface">
            Tuma
          </Link>
          <span className="px-2">/</span>
          <Link href="/learn" className="hover:text-on-surface">
            Learn
          </Link>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-balance">{article.title}</h1>
        <p className="mt-2 text-xs text-on-surface-variant">
          {article.readingMinutes} min read · Updated{" "}
          {new Date(article.updated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="mt-6 text-base leading-relaxed text-on-surface-variant">{article.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-on-surface">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {article.faqs.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-on-surface">Frequently asked questions</h2>
            <div className="mt-4 flex flex-col gap-5">
              {article.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-sm font-bold text-on-surface">{faq.question}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-12 rounded-2xl bg-surface-container-low p-6">
          <p className="text-sm font-semibold text-on-surface">Ready to try it?</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Send USDC to any X handle in minutes — escrowed on Arc until they claim.
          </p>
          <Link
            href="/send"
            className="mt-4 inline-flex rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary"
          >
            Send USDC
          </Link>
        </div>

        <section className="mt-12 border-t border-surface-container pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Keep reading
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/learn/${item.slug}`}
                  className="text-sm font-semibold text-primary underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
