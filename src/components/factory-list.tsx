import Link from "next/link";
import { categoryLabel, type ListingRow } from "@/lib/factories";

const TILE_COLORS = ["bg-neon", "bg-cyan", "bg-pink", "bg-amber"];

function tileColor(slug: string): string {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TILE_COLORS[h % TILE_COLORS.length];
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[78px_1fr] items-center gap-2.5 font-mono text-[11px] text-mute">
      {label}
      <div
        className="h-[5px] overflow-hidden rounded-[3px] bg-track"
        role="meter"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
      >
        <div className="bar-fill h-full rounded-[3px]" style={{ width: `${Math.max(0, Math.min(10, value)) * 10}%` }} />
      </div>
    </div>
  );
}

function FactoryRow({ row, rank }: { row: ListingRow; rank: number }) {
  const pick = row.editors_pick === 1;
  return (
    <li>
      <Link
        href={`/factories/${row.slug}`}
        data-testid="factory-row"
        data-slug={row.slug}
        className={`factory-row rounded-xl border border-line bg-panel px-4 py-4 transition-colors hover:border-mute/50 md:px-5 md:py-[18px] ${pick ? "factory-pick hover:border-neon/70" : ""}`}
      >
        <span className="area-rank font-mono text-[15px] text-mute">{String(rank).padStart(2, "0")}</span>
        <div className="area-name flex min-w-0 items-center gap-3.5">
          {row.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote logos, no image optimizer binding
            <img src={row.logo_url} alt="" className="size-10 flex-none rounded-[9px] bg-panel object-contain" />
          ) : (
            <div
              aria-hidden
              className={`grid size-10 flex-none place-items-center rounded-[9px] text-base font-bold text-bg ${tileColor(row.slug)}`}
            >
              {row.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <b className="block truncate text-[17px] font-semibold">{row.name}</b>
            <small className="block text-[13px] text-mute md:truncate">{row.tagline}</small>
          </div>
        </div>
        <span className="area-type justify-self-start rounded-md border border-cyan/35 px-2 py-1 font-mono text-xs text-cyan">
          {categoryLabel(row.category)}
        </span>
        <div className="area-bars flex flex-col gap-1.5 md:pr-6">
          <Meter label="autonomy" value={row.score_autonomy} />
          <Meter label="quality" value={row.score_quality} />
          <Meter label="value" value={row.score_value} />
        </div>
        <div className="area-score justify-self-end text-right font-mono">
          <div className="text-[30px] leading-tight font-bold tracking-[-0.03em] text-neon" data-testid="score">
            {row.overall_score.toFixed(1)}
          </div>
          {pick ? (
            <div className="text-[11px] whitespace-nowrap text-amber">editor&apos;s pick</div>
          ) : (
            <div className="text-xs text-mute">/ 10</div>
          )}
        </div>
      </Link>
    </li>
  );
}

export function FactoryList({ rows }: { rows: ListingRow[] }) {
  if (rows.length === 0) {
    return (
      <div data-testid="empty-state" className="rounded-xl border border-dashed border-line bg-panel/60 px-6 py-14 text-center">
        <p className="font-mono text-sm text-neon">{"// 0 matches"}</p>
        <p className="mt-2 text-mute">No factories match these filters.</p>
        <Link href="/" className="mt-4 inline-block font-mono text-[13px] text-cyan hover:underline">
          clear filters →
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="factory-head hidden px-5 py-2.5 font-mono text-xs tracking-[0.08em] text-mute uppercase md:grid">
        <span>#</span>
        <span>factory</span>
        <span>type</span>
        <span>breakdown</span>
        <span className="text-right">score</span>
      </div>
      <ol className="flex flex-col gap-2.5" data-testid="factory-list">
        {rows.map((row, i) => (
          <FactoryRow key={row.slug} row={row} rank={i + 1} />
        ))}
      </ol>
    </div>
  );
}
