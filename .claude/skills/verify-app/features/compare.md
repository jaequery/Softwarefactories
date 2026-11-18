# Feature: compare (`/compare`), methodology, about, sitemap/robots, live

**Code:** `src/app/compare/page.tsx`, `src/app/methodology/page.tsx`, `src/app/about/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `parseCompareSlugs()` / `getFactoryReviews()` in `src/lib/factories.ts`

## Compare

URL state: `?f=<slug>,<slug>[,<slug>]`. Up to 3 unique slugs; unknown or unpublished slugs are dropped. The selector is a plain GET form (works without JS) that submits `?f=a&f=b&f=`; the page 307-redirects that (and any non-canonical `f`, e.g. upper case or duplicates) to `?f=a,b`.

| Behaviour | Drive | Expect |
|---|---|---|
| Two factories | `GET /compare?f=a,b` | 200; `[data-testid=compare-table][data-count=2]`; 2 × `[data-testid=compare-col]` in URL order |
| Three factories | `GET /compare?f=a,b,c` | `data-count=3`; 3 columns |
| Best in row | same | rows `[data-testid=row-overall\|row-autonomy\|row-quality\|row-speed\|row-value]`; the highest cell(s) have `data-best="true"` (ties all highlighted) |
| Rows | same | category, pricing, open source, verdict, pros/cons; `[data-testid=review-link]` → `/factories/<slug>` |
| Selector | choose `[data-testid=compare-select-1..3]`, click `[data-testid=compare-submit]` | lands on `/compare?f=a,b[,c]` with that many columns |
| No-JS form URL | `GET /compare?f=a&f=b&f=` | 307 → `/compare?f=a,b` |
| Nothing picked | `GET /compare` | `[data-testid=compare-empty]`, selector, `[data-testid=suggested-pairs]` links to `/compare?f=x,y` |
| One picked | `GET /compare?f=a` | same empty state plus "pick at least one more" note |
| Responsive | `compare-1280.png`, `compare-390.png` | row label in its own column at ≥768px, above the cells on phones |

## Static pages and SEO

| Behaviour | Drive | Expect |
|---|---|---|
| Methodology | `GET /methodology` | 200; `[data-testid=methodology]`, `[data-testid=sub-scores]` (4), `[data-testid=formula]`; says overall is set by hand |
| About | `GET /about` | 200; `[data-testid=about]`, `[data-testid=contact]` placeholder line |
| Sitemap | `GET /sitemap.xml` | one `<loc>…/factories/<slug></loc>` per published review, plus `/`, `/compare`, `/methodology`, `/about`; absolute URLs from the request host |
| Robots | `GET /robots.txt` | `Allow: /`, `Disallow: /admin`, `Sitemap: <origin>/sitemap.xml` |

Side effects: none (read-only).
