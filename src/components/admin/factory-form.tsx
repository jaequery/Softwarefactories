"use client";

import { useActionState, useState, type ReactNode } from "react";
import { saveFactory, type FactoryFormState } from "@/app/admin/factory-actions";
import { Markdown } from "@/components/markdown";
import { CATEGORIES } from "@/lib/factories";
import { SCORE_FIELDS, slugify, type FactoryFormValues, type FieldErrors } from "@/lib/admin/schema";

const input =
  "w-full rounded-lg border border-line bg-bg px-3 py-2 text-text outline-none placeholder:text-mute/50 focus:border-neon/60 aria-[invalid=true]:border-pink/70";

function Field({ label, name, errors, hint, children }: { label: string; name: keyof FactoryFormValues; errors?: FieldErrors; hint?: string; children: ReactNode }) {
  const errs = errors?.[name];
  return (
    <div className="flex flex-col gap-1.5" data-field={name}>
      <label htmlFor={`f-${name}`} className="font-mono text-xs tracking-[0.08em] text-mute uppercase">
        {label}
      </label>
      {children}
      {hint && !errs && <p className="font-mono text-[11px] text-mute/80">{hint}</p>}
      {errs?.map((e) => (
        <p key={e} className="font-mono text-[12px] text-pink" data-testid={`error-${name}`}>
          {e}
        </p>
      ))}
    </div>
  );
}

function ListEditor({ name, label, initial, errors, mark }: { name: "pros" | "cons"; label: string; initial: string[]; errors?: FieldErrors; mark: ReactNode }) {
  const [items, setItems] = useState<{ key: number; text: string }[]>(() => initial.map((text, key) => ({ key, text })));
  const [next, setNext] = useState(initial.length);
  const add = () => {
    setItems((xs) => [...xs, { key: next, text: "" }]);
    setNext((n) => n + 1);
  };
  return (
    <div className="flex flex-col gap-2" data-testid={`list-${name}`}>
      <span className="font-mono text-xs tracking-[0.08em] text-mute uppercase">{label}</span>
      {items.map((it, i) => (
        <div key={it.key} className="flex items-center gap-2">
          <span aria-hidden className="w-4 font-mono font-bold">
            {mark}
          </span>
          <input
            name={name}
            value={it.text}
            onChange={(e) => setItems((xs) => xs.map((x) => (x.key === it.key ? { ...x, text: e.target.value } : x)))}
            aria-label={`${label} item ${i + 1}`}
            maxLength={300}
            className={input}
            data-testid={`${name}-item`}
          />
          <button
            type="button"
            onClick={() => setItems((xs) => xs.filter((x) => x.key !== it.key))}
            aria-label={`Remove ${label} item ${i + 1}`}
            className="rounded-md border border-line px-2.5 py-1.5 font-mono text-xs text-mute hover:border-pink/60 hover:text-pink"
            data-testid={`${name}-remove`}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-dashed border-line px-3 py-1.5 font-mono text-xs text-mute hover:border-neon/60 hover:text-neon"
        data-testid={`${name}-add`}
      >
        + add {name === "pros" ? "pro" : "con"}
      </button>
      {errors?.[name]?.map((e) => (
        <p key={e} className="font-mono text-[12px] text-pink" data-testid={`error-${name}`}>
          {e}
        </p>
      ))}
    </div>
  );
}

function Fields({ id, values, errors }: { id?: number; values: FactoryFormValues; errors?: FieldErrors }) {
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  // New factories derive the slug from the name until it is edited by hand; existing slugs never change on their own.
  const [slugEdited, setSlugEdited] = useState(id !== undefined || values.slug !== slugify(values.name));
  const [body, setBody] = useState(values.body_markdown);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const inv = (k: keyof FactoryFormValues) => (errors?.[k] ? true : undefined);

  return (
    <>
      <section className="rounded-xl border border-line bg-panel p-5 sm:p-6" data-testid="factory-section">
        <h2 className="mb-5 font-mono text-xs tracking-[0.08em] text-neon uppercase">{"// factory"}</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="name" name="name" errors={errors}>
            <input
              id="f-name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              required
              maxLength={120}
              aria-invalid={inv("name")}
              className={input}
            />
          </Field>
          <Field label="slug" name="slug" errors={errors} hint={`/factories/${slug || "…"}`}>
            <input
              id="f-slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              required
              maxLength={80}
              aria-invalid={inv("slug")}
              className={`${input} font-mono`}
            />
          </Field>
          <Field label="tagline" name="tagline" errors={errors}>
            <input id="f-tagline" name="tagline" defaultValue={values.tagline} maxLength={200} aria-invalid={inv("tagline")} className={input} />
          </Field>
          <Field label="category" name="category" errors={errors}>
            <select id="f-category" name="category" defaultValue={values.category} aria-invalid={inv("category")} className={input}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="website url" name="website_url" errors={errors}>
            <input id="f-website_url" name="website_url" type="url" defaultValue={values.website_url} placeholder="https://" aria-invalid={inv("website_url")} className={input} />
          </Field>
          <Field label="logo url" name="logo_url" errors={errors} hint="Optional. Leave empty for a lettered tile.">
            <input id="f-logo_url" name="logo_url" type="url" defaultValue={values.logo_url} placeholder="https://" aria-invalid={inv("logo_url")} className={input} />
          </Field>
          <div className="md:col-span-2">
            <Field label="description" name="description" errors={errors}>
              <textarea id="f-description" name="description" defaultValue={values.description} rows={3} maxLength={5000} aria-invalid={inv("description")} className={input} />
            </Field>
          </div>
          <Field label="pricing summary" name="pricing_summary" errors={errors}>
            <input id="f-pricing_summary" name="pricing_summary" defaultValue={values.pricing_summary} maxLength={500} aria-invalid={inv("pricing_summary")} className={input} />
          </Field>
          <label className="flex items-center gap-2.5 self-end pb-2 font-mono text-[13px]">
            <input type="checkbox" name="open_source" defaultChecked={values.open_source} className="size-4 accent-[#39ff9f]" />
            open source
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-5 sm:p-6" data-testid="review-section">
        <h2 className="mb-5 font-mono text-xs tracking-[0.08em] text-neon uppercase">{"// review"}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SCORE_FIELDS.map((s) => (
            <Field key={s.key} label={s.label} name={s.key} errors={errors}>
              <input
                id={`f-${s.key}`}
                name={s.key}
                type="number"
                inputMode="decimal"
                min={0}
                max={10}
                step={0.1}
                required
                defaultValue={values[s.key]}
                aria-invalid={inv(s.key)}
                className={`${input} font-mono ${s.key === "overall_score" ? "text-neon" : ""}`}
              />
            </Field>
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] text-mute/80">Scores are 0–10 with at most one decimal.</p>

        <div className="mt-6">
          <Field label="verdict" name="verdict" errors={errors}>
            <input id="f-verdict" name="verdict" defaultValue={values.verdict} maxLength={500} aria-invalid={inv("verdict")} className={input} />
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-1.5" data-field="body_markdown">
          <div className="flex items-center justify-between">
            <label htmlFor="f-body_markdown" className="font-mono text-xs tracking-[0.08em] text-mute uppercase">
              body (markdown)
            </label>
            <div className="flex gap-1 font-mono text-xs" role="tablist">
              {(["write", "preview"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  data-testid={`body-tab-${t}`}
                  className={`rounded-md px-2.5 py-1 ${tab === t ? "bg-track text-text" : "text-mute hover:text-text"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="f-body_markdown"
            name="body_markdown"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            maxLength={50000}
            aria-invalid={inv("body_markdown")}
            className={`${input} font-mono text-[13px] leading-relaxed ${tab === "preview" ? "hidden" : ""}`}
          />
          {tab === "preview" && (
            <div className="min-h-[200px] rounded-lg border border-line bg-bg p-4" data-testid="body-preview">
              {body.trim() ? <Markdown source={body} className="text-[15px]" /> : <p className="font-mono text-[13px] text-mute">{"// nothing to preview"}</p>}
            </div>
          )}
          {errors?.body_markdown?.map((e) => (
            <p key={e} className="font-mono text-[12px] text-pink">
              {e}
            </p>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ListEditor name="pros" label="pros" initial={values.pros} errors={errors} mark={<span className="text-neon">✓</span>} />
          <ListEditor name="cons" label="cons" initial={values.cons} errors={errors} mark={<span className="text-pink">✕</span>} />
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 font-mono text-[13px]">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="editors_pick" defaultChecked={values.editors_pick} className="size-4 accent-[#fbbf24]" data-testid="editors-pick-input" />
            <span className="text-amber">★ editor&apos;s pick</span>
            <span className="text-mute">(clears it on every other factory)</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="published" defaultChecked={values.published} className="size-4 accent-[#39ff9f]" data-testid="published-input" />
            published
          </label>
        </div>
      </section>
    </>
  );
}

/** Create/edit form for a factory and its review. Validation runs on the server; errors come back per field. */
export function FactoryForm({ id, initial }: { id?: number; initial: FactoryFormValues }) {
  const [state, action, pending] = useActionState<FactoryFormState, FormData>(saveFactory, {});
  const values = state.values ?? initial;
  return (
    // Re-keyed after each failed save so the fields re-mount with what was submitted (React resets forms after an action).
    <form key={state.attempt ?? 0} action={action} noValidate className="flex flex-col gap-6" data-testid="factory-form">
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      {state.message && (
        <p className="rounded-lg border border-pink/40 bg-pink/5 px-4 py-3 font-mono text-[13px] text-pink" role="alert" data-testid="form-error">
          {state.message}
        </p>
      )}
      <Fields id={id} values={values} errors={state.errors} />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          data-testid="save-factory"
          className="rounded-lg bg-neon px-5 py-2.5 font-mono text-sm font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "saving…" : id === undefined ? "create factory" : "save changes"}
        </button>
      </div>
    </form>
  );
}
