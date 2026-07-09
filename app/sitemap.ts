import { MetadataRoute } from "next";
import { getFiles } from "@/lib/content";

const BASE = "https://genetictesting.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const companySlugs = getFiles("companies").map((f) => f.replace(".md", ""));
  const newsSlugs = getFiles("news").map((f) => f.replace(".md", ""));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/newsletter`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/advertise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const companyRoutes: MetadataRoute.Sitemap = companySlugs.map((slug) => ({
    url: `${BASE}/directory/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const newsRoutes: MetadataRoute.Sitemap = newsSlugs.map((slug) => ({
    url: `${BASE}/news/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...companyRoutes, ...newsRoutes];
}
