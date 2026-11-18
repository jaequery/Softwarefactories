import { getDB } from "@/lib/db";
import type { Category } from "@/lib/factories";
import { EMPTY_FORM, type FactoryFormValues, type FactoryInput } from "./schema";

const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export type AdminFactoryRow = {
  id: number;
  slug: string;
  name: string;
  category: Category;
  overall_score: number | null;
  editors_pick: number | null;
  published: number | null;
  updated_at: string;
};

/** Every factory, published or not (a factory may briefly have no review row), most recently updated first. */
export async function listAdminFactories(): Promise<AdminFactoryRow[]> {
  const { results } = await (await getDB())
    .prepare(
      `SELECT f.id, f.slug, f.name, f.category, r.overall_score, r.editors_pick, r.published,
              MAX(f.updated_at, COALESCE(r.updated_at, f.updated_at)) AS updated_at
         FROM factories f
         LEFT JOIN reviews r ON r.factory_id = f.id
        ORDER BY updated_at DESC, f.name COLLATE NOCASE ASC`,
    )
    .all<AdminFactoryRow>();
  return results;
}

type EditRow = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  logo_url: string | null;
  category: string;
  pricing_summary: string;
  open_source: number;
  overall_score: number | null;
  score_autonomy: number | null;
  score_quality: number | null;
  score_speed: number | null;
  score_value: number | null;
  verdict: string | null;
  body_markdown: string | null;
  pros: string | null;
  cons: string | null;
  editors_pick: number | null;
  published: number | null;
  reviewed_at: string | null;
  updated_at: string;
};

function parseList(raw: string | null): string[] {
  try {
    const v: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const fmtScore = (n: number | null) => (n === null ? "" : String(n));

export type AdminFactory = { id: number; values: FactoryFormValues; reviewedAt: string | null; updatedAt: string };

/** One factory and its review, shaped as editor form values; null when the id is unknown. */
export async function getAdminFactory(id: number): Promise<AdminFactory | null> {
  const row = await (await getDB())
    .prepare(
      `SELECT f.id, f.slug, f.name, f.tagline, f.description, f.website_url, f.logo_url, f.category,
              f.pricing_summary, f.open_source,
              r.overall_score, r.score_autonomy, r.score_quality, r.score_speed, r.score_value,
              r.verdict, r.body_markdown, r.pros, r.cons, r.editors_pick, r.published, r.reviewed_at,
              MAX(f.updated_at, COALESCE(r.updated_at, f.updated_at)) AS updated_at
         FROM factories f
         LEFT JOIN reviews r ON r.factory_id = f.id
        WHERE f.id = ?1`,
    )
    .bind(id)
    .first<EditRow>();
  if (!row) return null;
  return {
    id: row.id,
    reviewedAt: row.reviewed_at,
    updatedAt: row.updated_at,
    values: {
      ...EMPTY_FORM,
      name: row.name,
      slug: row.slug,
      tagline: row.tagline,
      description: row.description,
      website_url: row.website_url,
      logo_url: row.logo_url ?? "",
      category: row.category,
      pricing_summary: row.pricing_summary,
      open_source: row.open_source === 1,
      overall_score: fmtScore(row.overall_score),
      score_autonomy: fmtScore(row.score_autonomy),
      score_quality: fmtScore(row.score_quality),
      score_speed: fmtScore(row.score_speed),
      score_value: fmtScore(row.score_value),
      verdict: row.verdict ?? "",
      body_markdown: row.body_markdown ?? "",
      pros: parseList(row.pros),
      cons: parseList(row.cons),
      editors_pick: row.editors_pick === 1,
      published: row.published === 1,
    },
  };
}

export async function factoryExists(id: number): Promise<boolean> {
  return (await (await getDB()).prepare("SELECT 1 AS x FROM factories WHERE id = ?1").bind(id).first()) !== null;
}

/** True when another factory (not `exceptId`) already uses `slug`. */
export async function slugTaken(slug: string, exceptId: number | null): Promise<boolean> {
  const row = await (await getDB())
    .prepare("SELECT 1 AS x FROM factories WHERE slug = ?1 AND id <> ?2")
    .bind(slug, exceptId ?? -1)
    .first();
  return row !== null;
}

/**
 * Create (id null) or update a factory and upsert its review in one D1 batch (a single transaction).
 * `reviewed_at` is set when the review is created and refreshed whenever it goes from draft to published;
 * `updated_at` is set on every save. Setting editor's pick clears it on every other review.
 * Returns the factory id.
 */
export async function saveFactoryRecord(input: FactoryInput, id: number | null): Promise<number> {
  const db = await getDB();
  const f = input;
  const factoryCols = [f.slug, f.name, f.tagline, f.description, f.website_url, f.logo_url, f.category, f.pricing_summary, f.open_source ? 1 : 0];

  const factoryStmt =
    id === null
      ? db
          .prepare(
            `INSERT INTO factories (slug, name, tagline, description, website_url, logo_url, category, pricing_summary, open_source)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
          )
          .bind(...factoryCols)
      : db
          .prepare(
            `UPDATE factories
                SET slug = ?1, name = ?2, tagline = ?3, description = ?4, website_url = ?5, logo_url = ?6,
                    category = ?7, pricing_summary = ?8, open_source = ?9, updated_at = ${NOW}
              WHERE id = ?10`,
          )
          .bind(...factoryCols, id);

  // On update the factory is addressed by id; on create by its new (UNIQUE) slug, inserted earlier in this same transaction.
  const target = id === null ? "(SELECT id FROM factories WHERE slug = ?1)" : "?1";
  const key = id === null ? f.slug : id;
  const reviewStmt = db
    .prepare(
      `INSERT INTO reviews (factory_id, overall_score, score_autonomy, score_quality, score_speed, score_value,
                            verdict, body_markdown, pros, cons, editors_pick, published)
       VALUES (${target}, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
       ON CONFLICT(factory_id) DO UPDATE SET
         overall_score = excluded.overall_score, score_autonomy = excluded.score_autonomy,
         score_quality = excluded.score_quality, score_speed = excluded.score_speed, score_value = excluded.score_value,
         verdict = excluded.verdict, body_markdown = excluded.body_markdown, pros = excluded.pros, cons = excluded.cons,
         editors_pick = excluded.editors_pick,
         reviewed_at = CASE WHEN reviews.published = 0 AND excluded.published = 1 THEN ${NOW} ELSE reviews.reviewed_at END,
         published = excluded.published,
         updated_at = ${NOW}`,
    )
    .bind(
      key,
      f.overall_score,
      f.score_autonomy,
      f.score_quality,
      f.score_speed,
      f.score_value,
      f.verdict,
      f.body_markdown,
      JSON.stringify(f.pros),
      JSON.stringify(f.cons),
      f.editors_pick ? 1 : 0,
      f.published ? 1 : 0,
    );

  const stmts = [factoryStmt, reviewStmt];
  if (f.editors_pick) {
    stmts.push(
      db
        .prepare(
          `UPDATE reviews SET editors_pick = 0, updated_at = ${NOW}
            WHERE editors_pick = 1 AND factory_id <> ${target}`,
        )
        .bind(key),
    );
  }
  stmts.push(db.prepare(`SELECT id FROM factories WHERE id = ${target}`).bind(key));
  const results = await db.batch<{ id: number }>(stmts);
  const saved = results[results.length - 1].results[0];
  if (!saved) throw new Error("Saved factory row not found");
  return saved.id;
}

/** Delete a factory and its review together. Returns false when the id was unknown. */
export async function deleteFactoryRecord(id: number): Promise<boolean> {
  const db = await getDB();
  const [, deleted] = await db.batch([
    db.prepare("DELETE FROM reviews WHERE factory_id = ?1").bind(id),
    db.prepare("DELETE FROM factories WHERE id = ?1").bind(id),
  ]);
  return (deleted.meta.changes ?? 0) > 0;
}
