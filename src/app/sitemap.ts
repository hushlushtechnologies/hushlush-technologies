import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { SERVICE_PAGES } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/careers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.9 },
    { url: `${siteConfig.url}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${siteConfig.url}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    ...SERVICE_PAGES.map((p) => ({ url: `${siteConfig.url}/services/${p.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
