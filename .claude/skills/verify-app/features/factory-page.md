# Feature: factory review page (`/factories/[slug]`), live

**Code:** `src/app/factories/[slug]/page.tsx`, `src/components/review-parts.tsx`, `src/components/markdown.tsx`, `getFactoryReview()` in `src/lib/factories.ts`
**Data:** `factories` JOIN `reviews` WHERE `published = 1` AND `slug = ?`

| Behaviour | Drive | Expect |
|---|---|---|
| Review renders | `GET /factories/<slug>` for every published slug | 200; `[data-testid=factory-page][data-slug=<slug>]`; `[data-testid=factory-name]` = name; `[data-testid=score]` = overall (1 dp) |
| Score breakdown | same | 4 × `[data-testid=score-bar]` with `data-label` = `autonomy`, `quality`, `speed`, `value` |
| Editor's pick | the pick's page | `[data-testid=editors-pick]` (amber) and the overall box has class `factory-pick` |
| Verdict / body | same | `[data-testid=verdict]`; body Markdown rendered as React elements (no raw HTML: `<script>` shows as text, non-http(s) links lose their `href`) |
| Pros / cons | same | `[data-testid=pros-cons]` with `[data-testid=pros]` (neon ✓) and `[data-testid=cons]` (pink ✕); "// none listed yet" when empty (the seed has empty lists) |
| Header | same | `[data-testid=category]`, `[data-testid=open-source]` when `open_source = 1`, `[data-testid=visit-site]` with `rel="noopener nofollow"` |
| Meta | same | `<title>{name} review: {score}/10 · Software Factories</title>`, meta description, `og:title`, `og:url`, `og:type=article` |
| Pricing / date | same | `[data-testid=pricing]`, `[data-testid=reviewed-at]` "Reviewed Month D, YYYY" |
| Compare links | same | `[data-testid=compare-links] a[href^="/compare?f=<slug>,"]` |
| Not found | `GET /factories/does-not-exist`, or a slug whose review is unpublished | 404 |
| Responsive | `screenshot.mjs` → `factory-1280.png`, `factory-390.png` | 2 columns (body + sidebar) at 1280; stacked at 390 |

Side effects: none (read-only).
