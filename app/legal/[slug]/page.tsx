import Link from "next/link";
import { notFound } from "next/navigation";
import { LEGAL_DOCS, getLegalDoc } from "@/lib/legal";

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-on-surface">
      <article className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Tuma" className="h-8 w-8 rounded-lg object-cover" src="/images/tuma-logo.jpg" />
          <Link href="/" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
            Tuma
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
        <p className="mt-1 text-xs text-on-surface-variant">Last updated {doc.updated}</p>
        <p className="mt-6 text-sm leading-relaxed text-on-surface-variant">{doc.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-on-surface">{section.heading}</h2>
              <div className="mt-2 flex flex-col gap-3">
                {section.body.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav className="mt-12 flex flex-wrap gap-4 border-t border-surface-container pt-6 text-xs text-on-surface-variant">
          {LEGAL_DOCS.filter((item) => item.slug !== doc.slug).map((item) => (
            <Link key={item.slug} href={`/legal/${item.slug}`} className="underline">
              {item.title}
            </Link>
          ))}
        </nav>
      </article>
    </main>
  );
}
