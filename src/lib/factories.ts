import { getDB } from "./db";

export const CATEGORIES = [
  { value: "autonomous-agent", label: "autonomous agent" },
  { value: "platform", label: "platform" },
  { value: "ide-agent", label: "ide agent" },
  { value: "open-source", label: "open source" },
  { value: "cli-agent", label: "cli agent" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const SORTS = [
  { value: "score", label: "score ↓" },
  { value: "name", label: "name A–Z" },
  { value: "newest", label: "newest" },
] as const;

export type Sort = (typeof SORTS)[number]["value"];

export type ListingRow = {
  slug: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  category: Category;
  overall_score: number;
  score_autonomy: number;
  score_quality: number;
  score_value: number;
  editors_pick: number;
};

export type ListingFilters = { q: string; category: Category | ""; sort: Sort };

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/** Normalise raw URL query values; unknown values fall back to the defaults. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): ListingFilters {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = first(sp.q).trim().slice(0, 100);
  const rawCategory = first(sp.category);
  const rawSort = first(sp.sort);
  const category = CATEGORIES.some((c) => c.value === rawCategory) ? (rawCategory as Category) : "";
  const sort = SORTS.some((s) => s.value === rawSort) ? (rawSort as Sort) : "score";
  return { q, category, sort };
}

const ORDER_BY: Record<Sort, string> = {
  score: "r.overall_score DESC, f.name COLLATE NOCASE ASC",
  name: "f.name COLLATE NOCASE ASC",
  newest: "r.reviewed_at DESC, f.created_at DESC, f.name COLLATE NOCASE ASC",
};

/** Published, reviewed factories matching the filters. */
export async function listFactories({ q, category, sort }: ListingFilters): Promise<ListingRow[]> {
  const db = await getDB();
  const like = `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
  const { results } = await db
    .prepare(
      `SELECT f.slug, f.name, f.tagline, f.logo_url, f.category,
              r.overall_score, r.score_autonomy, r.score_quality, r.score_value, r.editors_pick
         FROM factories f
         JOIN reviews r ON r.factory_id = f.id AND r.published = 1
        WHERE (?1 = '' OR f.name LIKE ?2 ESCAPE '\\' OR f.tagline LIKE ?2 ESCAPE '\\')
          AND (?3 = '' OR f.category = ?3)
        ORDER BY ${ORDER_BY[sort]}`,
    )
    .bind(q, like, category)
    .all<ListingRow>();
  return results;
}

/** Count of published reviews and the most recent review update, for the hero kicker. */
export async function getListingStats(): Promise<{ count: number; updatedAt: string | null }> {
  const db = await getDB();
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count, MAX(r.updated_at) AS updatedAt
         FROM reviews r JOIN factories f ON f.id = r.factory_id
        WHERE r.published = 1`,
    )
    .first<{ count: number; updatedAt: string | null }>();
  return { count: row?.count ?? 0, updatedAt: row?.updatedAt ?? null };
}

export async function getFactoryName(slug: string): Promise<string | null> {
  const db = await getDB();
  const row = await db.prepare("SELECT name FROM factories WHERE slug = ?1").bind(slug).first<{ name: string }>();
  return row?.name ?? null;
}
