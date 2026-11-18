import { categoryLabel, type Category } from "@/lib/factories";
import { tileColor } from "@/components/factory-list";

export function FactoryIcon({ slug, name, logoUrl, size = "md" }: { slug: string; name: string; logoUrl: string | null; size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-16 rounded-[14px] text-2xl" : "size-10 rounded-[9px] text-base";
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- remote logos, no image optimizer binding
    return <img src={logoUrl} alt="" className={`${box} flex-none bg-panel object-contain`} />;
  }
  return (
    <div aria-hidden className={`${box} grid flex-none place-items-center font-bold text-bg ${tileColor(slug)}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function CategoryBadge({ category, wrap = false }: { category: Category; wrap?: boolean }) {
  return (
    <span
      className={`inline-block rounded-md border border-cyan/35 px-2 py-1 font-mono text-xs text-cyan ${wrap ? "" : "whitespace-nowrap"}`}
      data-testid="category"
    >
      {categoryLabel(category)}
    </span>
  );
}

export function OpenSourceTag() {
  return (
    <span className="rounded-md border border-neon/35 px-2 py-1 font-mono text-xs whitespace-nowrap text-neon" data-testid="open-source">
      open source
    </span>
  );
}

/** Labelled 0–10 bar for a sub-score. */
export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[84px_1fr_40px] items-center gap-3 font-mono text-[13px]" data-testid="score-bar" data-label={label}>
      <span className="text-mute">{label}</span>
      <div
        className="h-2 overflow-hidden rounded bg-track"
        role="meter"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
      >
        <div className="bar-fill h-full rounded" style={{ width: `${Math.max(0, Math.min(10, value)) * 10}%` }} />
      </div>
      <span className="text-right text-text">{value.toFixed(1)}</span>
    </div>
  );
}

export function ProsCons({ pros, cons, compact = false }: { pros: string[]; cons: string[]; compact?: boolean }) {
  const col = (title: string, items: string[], mark: string, color: string, testid: string) => (
    <div data-testid={testid}>
      <h3 className={`mb-3 font-mono tracking-[0.08em] text-mute uppercase ${compact ? "text-[11px]" : "text-xs"}`}>{title}</h3>
      {items.length ? (
        <ul className={`flex flex-col ${compact ? "gap-1.5 text-sm" : "gap-2.5"}`}>
          {items.map((it, i) => (
            <li key={i} className="grid grid-cols-[18px_1fr] gap-1.5">
              <span aria-hidden className={`font-mono font-bold ${color}`}>
                {mark}
              </span>
              <span className="text-text/85">{it}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-[13px] text-mute">{"// none listed yet"}</p>
      )}
    </div>
  );
  return (
    <div className={`grid gap-6 ${compact ? "" : "sm:grid-cols-2"}`} data-testid="pros-cons">
      {col("pros", pros, "✓", "text-neon", "pros")}
      {col("cons", cons, "✕", "text-pink", "cons")}
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
