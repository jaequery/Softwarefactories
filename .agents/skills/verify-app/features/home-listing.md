# Feature: home listing (`/`), live

**Code:** `src/app/page.tsx`, `src/components/listing-controls.tsx`, `src/components/factory-list.tsx`, `src/lib/factories.ts`
**Data:** `factories` JOIN `reviews` WHERE `published = 1`

| Behaviour | Drive | Expect |
|---|---|---|
| Listing | `GET /` | 200; one `[data-testid=factory-row]` per published review; kicker `// N factories reviewed · updated Mon YYYY` |
| Default sort | `GET /` | `[data-testid=score]` values descending; the editor's pick row has class `factory-pick` and an amber "editor's pick" label |
| Search | `GET /?q=<text>`, or type in `[data-testid=search-input]` (URL updates after 250ms) | only rows whose name/tagline contains the text (case-insensitive) |
| Category | `GET /?category=<autonomous-agent\|platform\|ide-agent\|open-source\|cli-agent>`, or click `a[data-category=…]` | only that category; the chip has `aria-current="true"` |
| Sort | `GET /?sort=score\|name\|newest`, or `[data-testid=sort-select]` | the order changes; unknown values fall back to `score` |
| Empty state | `GET /?q=zzzz` | `[data-testid=empty-state]` with a "clear filters" link to `/` |
| Row links | click a row | `/factories/<slug>` returns 200 (review page); an unknown slug returns 404 |
| Responsive | screenshot at 390px | rows stack: rank, name and score on top, then type badge, then bars |

Side effects: none. The page is read-only, so D1 row counts are unchanged (checked by `drive.sh`).
