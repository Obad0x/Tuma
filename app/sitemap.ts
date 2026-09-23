import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/content";
import { LEGAL_DOCS } from "@/lib/legal";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/send", changeFrequency: "monthly", priority: 0.9 },
  { path: "/learn", changeFrequency: "weekly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/support", changeFrequency: "monthly", priority: 0.5 },
  { path: "/status", changeFrequency: "daily", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const legalEntries: MetadataRoute.Sitemap = LEGAL_DOCS.map((doc) => ({
    url: `${SITE_URL}/legal/${doc.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/learn/${article.slug}`,
    lastModified: new Date(article.updated),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...articleEntries, ...legalEntries];
}
