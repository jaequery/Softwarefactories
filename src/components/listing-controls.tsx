"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, SORTS, type ListingFilters } from "@/lib/factories";

function buildHref(f: { q: string; category: string; sort: string }): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("category", f.category);
  if (f.sort && f.sort !== "score") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

/**
 * Search, category chips and sort. All state lives in the URL (?q=&category=&sort=) and the
 * server renders the list; the plain GET form keeps it working without JavaScript.
 */
export function ListingControls({ filters }: { filters: ListingFilters }) {
  const router = useRouter();
  const [q, setQ] = useState(filters.q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onSearch = (value: string) => {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.replace(buildHref({ ...filters, q: value.trim() }), { scroll: false });
    }, 250);
  };

  return (
    <form
      action="/"
      method="get"
      role="search"
      className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        router.replace(buildHref({ ...filters, q: q.trim() }), { scroll: false });
      }}
    >
      <label className="flex items-center gap-2 rounded-[10px] border border-line bg-panel px-4 py-[13px] font-mono text-sm text-mute focus-within:border-neon/60 lg:w-[300px] lg:flex-none xl:w-[330px]">
        <span aria-hidden>⌕</span>
        <span className="sr-only">Search factories</span>
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="search factories…"
          autoComplete="off"
          data-testid="search-input"
          className="w-full bg-transparent text-text placeholder:text-mute focus:outline-none"
        />
      </label>
      {filters.category && <input type="hidden" name="category" value={filters.category} />}

      <div className="flex flex-wrap items-center gap-2" data-testid="category-chips">
        {[{ value: "", label: "all" }, ...CATEGORIES].map((c) => {
          const active = filters.category === c.value;
          return (
            <Link
              key={c.value || "all"}
              href={buildHref({ ...filters, q: q.trim(), category: c.value })}
              scroll={false}
              aria-current={active ? "true" : undefined}
              data-category={c.value || "all"}
              className={`rounded-full border px-3 py-2 whitespace-nowrap font-mono text-[13px] transition-colors ${
                active
                  ? "border-neon bg-neon/8 text-neon"
                  : "border-line bg-panel text-mute hover:border-mute/60 hover:text-text"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      <label className="flex items-center gap-1 font-mono text-[13px] text-mute lg:ml-auto">
        sort:
        <select
          name="sort"
          value={filters.sort}
          data-testid="sort-select"
          onChange={(e) => router.replace(buildHref({ ...filters, q: q.trim(), sort: e.target.value }), { scroll: false })}
          className="cursor-pointer bg-transparent text-mute hover:text-text focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value} className="bg-panel text-text">
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <noscript>
        <button type="submit" className="font-mono text-[13px] text-neon">
          apply
        </button>
      </noscript>
    </form>
  );
}
