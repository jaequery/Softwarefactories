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

export type FactoryReview = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  logo_url: string | null;
  category: Category;
  pricing_summary: string;
  open_source: number;
  overall_score: number;
  score_autonomy: number;
  score_quality: number;
  score_speed: number;
  score_value: number;
  verdict: string;
  body_markdown: string;
  pros: string[];
  cons: string[];
  editors_pick: number;
  reviewed_at: string;
  updated_at: string;
};

type FactoryReviewRow = Omit<FactoryReview, "pros" | "cons"> & { pros: string; cons: string };

export const SUB_SCORES = [
  { key: "score_autonomy", label: "autonomy" },
  { key: "score_quality", label: "quality" },
  { key: "score_speed", label: "speed" },
  { key: "score_value", label: "value" },
] as const satisfies readonly { key: keyof FactoryReview; label: string }[];

/** Pros/cons are stored as JSON arrays of strings; anything malformed reads as an empty list. */
function parseList(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
  } catch {
    return [];
  }
}

const REVIEW_SELECT = `SELECT f.slug, f.name, f.tagline, f.description, f.website_url, f.logo_url, f.category,
              f.pricing_summary, f.open_source,
              r.overall_score, r.score_autonomy, r.score_quality, r.score_speed, r.score_value,
              r.verdict, r.body_markdown, r.pros, r.cons, r.editors_pick, r.reviewed_at, r.updated_at
         FROM factories f
         JOIN reviews r ON r.factory_id = f.id AND r.published = 1`;

function toReview(row: FactoryReviewRow): FactoryReview {
  return { ...row, pros: parseList(row.pros), cons: parseList(row.cons) };
}

/** The published review for a slug, or null when the slug is unknown or its review is unpublished. */
export async function getFactoryReview(slug: string): Promise<FactoryReview | null> {
  const db = await getDB();
  const row = await db.prepare(`${REVIEW_SELECT} WHERE f.slug = ?1`).bind(slug).first<FactoryReviewRow>();
  return row ? toReview(row) : null;
}

/** Published reviews for the given slugs, returned in the order the slugs were given. */
export async function getFactoryReviews(slugs: string[]): Promise<FactoryReview[]> {
  if (slugs.length === 0) return [];
  const db = await getDB();
  const placeholders = slugs.map((_, i) => `?${i + 1}`).join(", ");
  const { results } = await db
    .prepare(`${REVIEW_SELECT} WHERE f.slug IN (${placeholders})`)
    .bind(...slugs)
    .all<FactoryReviewRow>();
  const bySlug = new Map(results.map((r) => [r.slug, toReview(r)]));
  return slugs.flatMap((s) => bySlug.get(s) ?? []);
}

export type FactoryOption = { slug: string; name: string; category: Category; overall_score: number; updated_at: string };

/** Every published factory, best score first: compare selector options and sitemap entries. */
export async function listPublishedFactories(): Promise<FactoryOption[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT f.slug, f.name, f.category, r.overall_score, r.updated_at
         FROM factories f
         JOIN reviews r ON r.factory_id = f.id AND r.published = 1
        ORDER BY r.overall_score DESC, f.name COLLATE NOCASE ASC`,
    )
    .all<FactoryOption>();
  return results;
}

export const MAX_COMPARE = 3;

/** `?f=a,b,c` (or repeated `?f=`) → up to three unique, well-formed slugs. */
export function parseCompareSlugs(raw: string | string[] | undefined): string[] {
  const parts = (Array.isArray(raw) ? raw : [raw ?? ""]).flatMap((v) => v.split(","));
  const slugs = parts.map((s) => s.trim().toLowerCase()).filter((s) => /^[a-z0-9-]{1,80}$/.test(s));
  return [...new Set(slugs)].slice(0, MAX_COMPARE);
}
