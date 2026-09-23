import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noindex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noindex,
}: PageSeoInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(noindex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {}),
  };
}
