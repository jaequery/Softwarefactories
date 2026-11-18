import { z } from "zod";
import { CATEGORIES, SUB_SCORES, type Category } from "@/lib/factories";

export const SCORE_FIELDS = [{ key: "overall_score", label: "overall" }, ...SUB_SCORES] as const;
export type ScoreField = (typeof SCORE_FIELDS)[number]["key"];

/** Raw form values as the editor shows them (scores stay strings so a bad entry round-trips unchanged). */
export type FactoryFormValues = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  website_url: string;
  logo_url: string;
  category: string;
  pricing_summary: string;
  open_source: boolean;
  verdict: string;
  body_markdown: string;
  pros: string[];
  cons: string[];
  editors_pick: boolean;
  published: boolean;
} & Record<ScoreField, string>;

export const EMPTY_FORM: FactoryFormValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  website_url: "",
  logo_url: "",
  category: "autonomous-agent",
  pricing_summary: "",
  open_source: false,
  overall_score: "",
  score_autonomy: "",
  score_quality: "",
  score_speed: "",
  score_value: "",
  verdict: "",
  body_markdown: "",
  pros: [],
  cons: [],
  editors_pick: false,
  published: false,
};

export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

const text = (max: number) => z.string().trim().max(max, `At most ${max} characters.`);

const url = (optional: boolean) =>
  text(500).refine((v) => {
    if (v === "") return optional;
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, optional ? "Must be an http(s) URL, or empty." : "Enter an http(s) URL.");

const score = z
  .string()
  .trim()
  .min(1, "Required.")
  .transform(Number)
  .pipe(
    z
      .number({ error: "Enter a number." })
      .min(0, "Must be between 0 and 10.")
      .max(10, "Must be between 0 and 10.")
      .refine((n) => Math.abs(n * 10 - Math.round(n * 10)) < 1e-9, "Use at most one decimal place."),
  );

const list = z.array(text(300)).max(20, "At most 20 items.").transform((items) => items.filter((s) => s !== ""));

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [Category, ...Category[]];

export const factorySchema = z.object({
  name: text(120).min(1, "Required."),
  slug: z
    .string()
    .trim()
    .min(1, "Required.")
    .max(80, "At most 80 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, digits and single hyphens only."),
  tagline: text(200),
  description: text(5000),
  website_url: url(true),
  logo_url: url(true).transform((v) => (v === "" ? null : v)),
  category: z.enum(CATEGORY_VALUES, { error: "Pick a category." }),
  pricing_summary: text(500),
  open_source: z.boolean(),
  overall_score: score,
  score_autonomy: score,
  score_quality: score,
  score_speed: score,
  score_value: score,
  verdict: text(500),
  body_markdown: text(50000),
  pros: list,
  cons: list,
  editors_pick: z.boolean(),
  published: z.boolean(),
});

export type FactoryInput = z.output<typeof factorySchema>;
export type FieldErrors = Partial<Record<keyof FactoryFormValues, string[]>>;

/** Read the editor form. Checkboxes are present only when ticked. */
export function readFactoryForm(fd: FormData): FactoryFormValues {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };
  const strs = (k: string) => fd.getAll(k).filter((v): v is string => typeof v === "string");
  return {
    name: str("name"),
    slug: str("slug"),
    tagline: str("tagline"),
    description: str("description"),
    website_url: str("website_url"),
    logo_url: str("logo_url"),
    category: str("category"),
    pricing_summary: str("pricing_summary"),
    open_source: fd.has("open_source"),
    overall_score: str("overall_score"),
    score_autonomy: str("score_autonomy"),
    score_quality: str("score_quality"),
    score_speed: str("score_speed"),
    score_value: str("score_value"),
    verdict: str("verdict"),
    body_markdown: str("body_markdown"),
    pros: strs("pros"),
    cons: strs("cons"),
    editors_pick: fd.has("editors_pick"),
    published: fd.has("published"),
  };
}

export function validateFactory(values: FactoryFormValues):
  | { ok: true; data: FactoryInput }
  | { ok: false; errors: FieldErrors } {
  const r = factorySchema.safeParse(values);
  if (r.success) return { ok: true, data: r.data };
  const errors: FieldErrors = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as keyof FactoryFormValues;
    (errors[key] ??= []).push(issue.message);
  }
  return { ok: false, errors };
}
