import type { MetadataRoute } from "next";
import { listPublishedFactories } from "@/lib/factories";
import { getSiteUrl } from "@/lib/site";

// Read D1 on every request so newly published reviews appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [base, factories] = await Promise.all([getSiteUrl(), listPublishedFactories()]);
  const latest = factories.reduce<string | undefined>((m, f) => (!m || f.updated_at > m ? f.updated_at : m), undefined);
  return [
    { url: `${base}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/compare`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/methodology`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.3 },
    ...factories.map((f) => ({
      url: `${base}/factories/${f.slug}`,
      lastModified: f.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
