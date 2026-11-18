import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { CategoryBadge, FactoryIcon, ProsCons } from "@/components/review-parts";
import {
  MAX_COMPARE,
  SUB_SCORES,
  categoryLabel,
  getFactoryReviews,
  listPublishedFactories,
  parseCompareSlugs,
  type FactoryOption,
  type FactoryReview,
} from "@/lib/factories";
import { SITE_NAME } from "@/lib/site";

// Read D1 on every request so admin edits show up without a rebuild.
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: PageProps<"/compare">): Promise<Metadata> {
  const slugs = parseCompareSlugs((await searchParams).f);
  const picked = await getFactoryReviews(slugs);
  const title = picked.length >= 2 ? `${picked.map((p) => p.name).join(" vs ")} · ${SITE_NAME}` : `Compare AI software factories · ${SITE_NAME}`;
  const description =
    picked.length >= 2
      ? `Side-by-side scores, pricing, pros and cons for ${picked.map((p) => p.name).join(", ")}.`
      : "Compare two or three AI software factories side by side: autonomy, quality, speed, value, pricing, pros and cons.";
  return { title, description, openGraph: { title, description, siteName: SITE_NAME } };
}

/** Up to four suggested pairs: the overall top two, then the top two of each category. */
function suggestedPairs(options: FactoryOption[]): [FactoryOption, FactoryOption][] {
  const pairs: [FactoryOption, FactoryOption][] = [];
  const seen = new Set<string>();
  const add = (a?: FactoryOption, b?: FactoryOption) => {
    if (!a || !b) return;
    const key = [a.slug, b.slug].sort().join(",");
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push([a, b]);
  };
  add(options[0], options[1]);
  for (const cat of new Set(options.map((o) => o.category))) {
    const inCat = options.filter((o) => o.category === cat);
    add(inCat[0], inCat[1]);
  }
  return pairs.slice(0, 4);
}

function Selector({ options, selected }: { options: FactoryOption[]; selected: string[] }) {
  return (
    <form action="/compare" method="get" className="flex flex-col gap-3 md:flex-row md:items-end" data-testid="compare-form">
      {Array.from({ length: MAX_COMPARE }, (_, i) => (
        <label key={i} className="flex flex-1 flex-col gap-1.5 font-mono text-xs text-mute">
          {i < 2 ? `factory ${i + 1}` : `factory ${i + 1} (optional)`}
          <select
            name="f"
            defaultValue={selected[i] ?? ""}
            data-testid={`compare-select-${i + 1}`}
            className="cursor-pointer rounded-[10px] border border-line bg-panel px-3 py-3 font-sans text-sm text-text focus:border-neon/60 focus:outline-none"
          >
            <option value="">— pick a factory —</option>
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name} ({o.overall_score.toFixed(1)})
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="submit"
        data-testid="compare-submit"
        className="rounded-[10px] border border-neon bg-neon/10 px-5 py-3 font-mono text-sm text-neon transition-colors hover:bg-neon/20"
      >
        compare →
      </button>
    </form>
  );
}

/** Indexes of the highest value(s) in a row; ties are all highlighted. */
function bestOf(values: number[]): Set<number> {
  const max = Math.max(...values);
  return new Set(values.flatMap((v, i) => (v === max ? [i] : [])));
}

function Row({ label, cells, n, testid }: { label: string; cells: ReactNode[]; n: number; testid?: string }) {
  return (
    <div className="compare-row grid gap-x-4 gap-y-2 border-t border-line py-4" style={{ "--n": n } as CSSProperties} data-testid={testid}>
      <div className="col-span-full font-mono text-xs tracking-[0.08em] text-mute uppercase md:col-span-1 md:pt-1">{label}</div>
      {cells}
    </div>
  );
}

function ScoreRow({ label, values, n, testid }: { label: string; values: number[]; n: number; testid: string }) {
  const best = bestOf(values);
  return (
    <Row
      label={label}
      n={n}
      testid={testid}
      cells={values.map((v, i) => (
        <div
          key={i}
          data-best={best.has(i) ? "true" : undefined}
          className={`font-mono ${testid === "row-overall" ? "text-3xl font-bold tracking-[-0.03em]" : "text-lg"} ${
            best.has(i) ? "text-neon" : "text-text/80"
          }`}
        >
          {v.toFixed(1)}
          {best.has(i) && (
            <span className="ml-2 align-middle text-[11px] font-normal tracking-normal text-neon/80" aria-label="best in row">
              ▲ best
            </span>
          )}
          {testid !== "row-overall" && (
            <div className="mt-1.5 h-[5px] overflow-hidden rounded-[3px] bg-track">
              <div className={`h-full rounded-[3px] ${best.has(i) ? "bar-fill" : "bg-mute/50"}`} style={{ width: `${Math.max(0, Math.min(10, v)) * 10}%` }} />
            </div>
          )}
        </div>
      ))}
    />
  );
}

function CompareTable({ picked }: { picked: FactoryReview[] }) {
  const n = picked.length;
  const text = (f: (r: FactoryReview) => ReactNode) => picked.map((r) => <div key={r.slug} className="text-sm text-text/85">{f(r)}</div>);
  return (
    <div data-testid="compare-table" data-count={n}>
      <div className="compare-row grid gap-x-4 gap-y-2 pb-5" style={{ "--n": n } as CSSProperties}>
        <div className="hidden md:block" />
        {picked.map((r) => (
          <div key={r.slug} className="flex min-w-0 flex-col gap-2" data-testid="compare-col" data-slug={r.slug}>
            <FactoryIcon slug={r.slug} name={r.name} logoUrl={r.logo_url} />
            <Link href={`/factories/${r.slug}`} className="text-lg leading-tight font-semibold hover:text-neon">
              {r.name}
            </Link>
            {r.editors_pick === 1 && <span className="font-mono text-[11px] text-amber">★ editor&apos;s pick</span>}
          </div>
        ))}
      </div>
      <ScoreRow label="overall" values={picked.map((r) => r.overall_score)} n={n} testid="row-overall" />
      {SUB_SCORES.map((s) => (
        <ScoreRow key={s.key} label={s.label} values={picked.map((r) => r[s.key])} n={n} testid={`row-${s.label}`} />
      ))}
      <Row label="category" n={n} cells={picked.map((r) => <div key={r.slug}><CategoryBadge category={r.category} wrap /></div>)} />
      <Row label="pricing" n={n} cells={text((r) => r.pricing_summary || "Not published.")} />
      <Row label="open source" n={n} cells={text((r) => (r.open_source ? <span className="font-mono text-neon">yes</span> : <span className="font-mono text-mute">no</span>))} />
      <Row label="verdict" n={n} cells={text((r) => r.verdict || "—")} />
      <Row label="pros / cons" n={n} cells={picked.map((r) => <ProsCons key={r.slug} pros={r.pros} cons={r.cons} compact />)} />
      <Row
        label="review"
        n={n}
        cells={picked.map((r) => (
          <Link key={r.slug} href={`/factories/${r.slug}`} className="font-mono text-[13px] text-cyan hover:underline" data-testid="review-link">
            read the {r.name} review →
          </Link>
        ))}
      />
    </div>
  );
}

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const sp = await searchParams;
  const slugs = parseCompareSlugs(sp.f);
  // The no-JS selector submits ?f=a&f=b&f=; normalise to the shareable ?f=a,b form.
  if (Array.isArray(sp.f) || (typeof sp.f === "string" && sp.f !== slugs.join(","))) {
    redirect(slugs.length ? `/compare?f=${slugs.join(",")}` : "/compare");
  }
  const [options, picked] = await Promise.all([listPublishedFactories(), getFactoryReviews(slugs)]);

  return (
    <main className="px-5 pt-12 pb-16 sm:px-14 sm:pt-16">
      <p className="mb-4 font-mono text-[13px] text-neon">{"// compare"}</p>
      <h1 className="max-w-[820px] text-[34px] leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
        {picked.length >= 2 ? picked.map((p) => p.name).join(" vs ") : "Compare factories side by side"}
      </h1>
      <p className="mt-4 max-w-[640px] text-mute">
        Pick two or three factories. Scores are out of 10; the best in each row is highlighted.{" "}
        <Link href="/methodology" className="text-cyan hover:underline">
          How we score
        </Link>
        .
      </p>

      <section className="mt-8 rounded-xl border border-line bg-panel/70 p-5">
        <Selector key={slugs.join(",")} options={options} selected={picked.map((p) => p.slug)} />
      </section>

      {picked.length >= 2 ? (
        <section className="mt-10">
          <CompareTable picked={picked} />
        </section>
      ) : (
        <section className="mt-10" data-testid="compare-empty">
          {picked.length === 1 && (
            <p className="mb-6 font-mono text-sm text-amber">
              {`// ${picked[0].name} selected. Pick at least one more factory to compare.`}
            </p>
          )}
          <h2 className="mb-4 font-mono text-xs tracking-[0.08em] text-mute uppercase">suggested comparisons</h2>
          <ul className="grid gap-3 sm:grid-cols-2" data-testid="suggested-pairs">
            {suggestedPairs(options).map(([a, b]) => (
              <li key={`${a.slug},${b.slug}`}>
                <Link
                  href={`/compare?f=${a.slug},${b.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-5 py-4 transition-colors hover:border-neon/50"
                >
                  <span className="font-semibold">
                    {a.name} <span className="font-mono text-sm font-normal text-mute">vs</span> {b.name}
                  </span>
                  <span className="font-mono text-xs whitespace-nowrap text-mute">
                    {a.category === b.category ? categoryLabel(a.category) : "top rated"} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
