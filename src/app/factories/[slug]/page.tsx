import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Markdown } from "@/components/markdown";
import { CategoryBadge, FactoryIcon, OpenSourceTag, ProsCons, ScoreBar, formatDate } from "@/components/review-parts";
import { SUB_SCORES, getFactoryReview, listPublishedFactories } from "@/lib/factories";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

// Read D1 on every request so admin edits show up without a rebuild.
export const dynamic = "force-dynamic";

// generateMetadata and the page share one D1 read per request.
const loadReview = cache(getFactoryReview);

export async function generateMetadata({ params }: PageProps<"/factories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const review = await loadReview(slug);
  if (!review) return { title: `Not found · ${SITE_NAME}` };
  const title = `${review.name} review: ${review.overall_score.toFixed(1)}/10 · ${SITE_NAME}`;
  const description = review.verdict
    ? `${review.tagline}. Verdict: ${review.verdict}`
    : review.tagline || review.description;
  const url = `${await getSiteUrl()}/factories/${review.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", siteName: SITE_NAME, ...(review.logo_url ? { images: [review.logo_url] } : {}) },
    twitter: { card: "summary", title, description },
  };
}

export default async function FactoryPage({ params }: PageProps<"/factories/[slug]">) {
  const { slug } = await params;
  const [review, all] = await Promise.all([loadReview(slug), listPublishedFactories()]);
  if (!review) notFound();
  const pick = review.editors_pick === 1;
  const others = all.filter((o) => o.slug !== review.slug);
  // Same category first, then the top-scored rest.
  const rivals = [...others.filter((o) => o.category === review.category), ...others.filter((o) => o.category !== review.category)].slice(0, 3);

  return (
    <main className="px-5 pt-10 pb-16 sm:px-14 sm:pt-14" data-testid="factory-page" data-slug={review.slug}>
      <Link href="/" className="font-mono text-[13px] text-mute hover:text-text">
        ← all reviews
      </Link>

      <header className="mt-6 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex min-w-0 gap-5">
          <FactoryIcon slug={review.slug} name={review.name} logoUrl={review.logo_url} size="lg" />
          <div className="min-w-0">
            <h1 className="text-[34px] leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl" data-testid="factory-name">
              {review.name}
            </h1>
            {review.tagline && <p className="mt-2.5 max-w-[640px] text-base text-mute sm:text-lg">{review.tagline}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <CategoryBadge category={review.category} />
              {review.open_source === 1 && <OpenSourceTag />}
              {review.website_url && (
                <a
                  href={review.website_url}
                  target="_blank"
                  rel="noopener nofollow"
                  data-testid="visit-site"
                  className="ml-1 font-mono text-[13px] text-cyan hover:underline"
                >
                  Visit site ↗
                </a>
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex items-end gap-3 rounded-xl border bg-panel px-6 py-5 font-mono lg:min-w-[220px] lg:flex-col lg:items-end lg:gap-0 ${pick ? "factory-pick" : "border-line"}`}
          data-testid="overall"
        >
          <div className="text-[64px] leading-none font-bold tracking-[-0.04em] text-neon" data-testid="score">
            {review.overall_score.toFixed(1)}
          </div>
          <div className="pb-2 text-left lg:pb-0 lg:text-right">
            <div className="text-sm text-mute">/ 10 overall</div>
            {pick && (
              <div className="mt-1 text-[13px] text-amber" data-testid="editors-pick">
                ★ editor&apos;s pick
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          {review.verdict && (
            <p className="text-xl leading-snug font-semibold tracking-[-0.02em] text-text sm:text-2xl" data-testid="verdict">
              <span className="font-mono text-base text-neon">{"// verdict "}</span>
              {review.verdict}
            </p>
          )}
          <Markdown source={review.body_markdown} className="mt-8 max-w-[720px] text-[16.5px]" />
          <section className="mt-12 rounded-xl border border-line bg-panel p-6">
            <ProsCons pros={review.pros} cons={review.cons} />
          </section>
        </article>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-line bg-panel p-5" data-testid="score-breakdown">
            <h2 className="mb-4 font-mono text-xs tracking-[0.08em] text-mute uppercase">score breakdown</h2>
            <div className="flex flex-col gap-3">
              {SUB_SCORES.map((s) => (
                <ScoreBar key={s.key} label={s.label} value={review[s.key]} />
              ))}
            </div>
            <Link href="/methodology" className="mt-4 inline-block font-mono text-xs text-mute hover:text-text">
              how we score →
            </Link>
          </section>

          <section className="rounded-xl border border-line bg-panel p-5" data-testid="pricing">
            <h2 className="mb-2 font-mono text-xs tracking-[0.08em] text-mute uppercase">pricing</h2>
            <p className="text-sm text-text/85">{review.pricing_summary || "Not published."}</p>
          </section>

          <p className="font-mono text-[13px] text-mute" data-testid="reviewed-at">
            Reviewed {formatDate(review.reviewed_at)}
          </p>

          {rivals.length > 0 && (
            <section className="rounded-xl border border-line bg-panel p-5" data-testid="compare-links">
              <h2 className="mb-3 font-mono text-xs tracking-[0.08em] text-mute uppercase">compare with</h2>
              <ul className="flex flex-col gap-2 font-mono text-[13px]">
                {rivals.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/compare?f=${review.slug},${o.slug}`} className="text-cyan hover:underline">
                      {review.name} vs {o.name} →
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={`/compare?f=${review.slug}`} className="text-mute hover:text-text">
                    pick others…
                  </Link>
                </li>
              </ul>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
