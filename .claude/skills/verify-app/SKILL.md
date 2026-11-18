---
name: verify-app
description: Launch, health-check, drive and capture evidence from the Software Factories site (Next.js + OpenNext Cloudflare + local D1). Use to prove a change works in the real app: "verify the app", "run the site", "screenshot the home page", "check search/filter/sort", or before finishing any ticket that touches pages, data or migrations.
---

# verify-app: Software Factories

All of this runs locally with no Docker. `npm run dev` serves Next.js, and `initOpenNextCloudflareForDev()` (in `next.config.ts`) gives it the same `env.DB` binding as production, backed by wrangler's local D1 in `.wrangler/state`.

Run every command from the repo root. The scripts live in `.claude/skills/verify-app/scripts/` (the same files are in `.agents/skills/verify-app/scripts/`). Evidence goes to `verify-evidence/<run-id>/`, which is git-ignored and kept after cleanup.

## 1. Launch (from an empty local D1)

```bash
bash .claude/skills/verify-app/scripts/launch.sh          # PORT=3000 by default
```

This script:
1. runs `npm install` if `node_modules` is missing;
2. **deletes `.wrangler/state`** (local D1 only, never the remote database);
3. runs `npm run db:migrate:local`, which applies `migrations/0001_init.sql`, `0002_seed.sql` and `0003_admin_login_attempts.sql`;
4. starts `npm run dev` in the background and writes its PID to `verify-evidence/.dev.pid` and its log to `verify-evidence/dev.log`;
5. waits until **ready**: `GET /` returns 200 **and** the HTML contains at least one `data-testid="factory-row"`, as many as the seeded rows. It fails after 120s.

If port 3000 is already taken, set `PORT=3100` for every script.

To drive the admin, create `.dev.vars` (copy `.dev.vars.example`; see `features/admin.md`) **before** launching: the dev server reads it only at start.

## 2. Doctor (read-only)

```bash
bash .claude/skills/verify-app/scripts/doctor.sh
```

Prints the node, npm, next and wrangler versions; the local migration status (`wrangler d1 migrations list DB --local`); row counts for `factories`, `reviews`, published reviews and editor's picks (exactly 1 is expected); and whether the dev server answers. It changes nothing.

## 3. Drive

```bash
bash .claude/skills/verify-app/scripts/drive.sh            # HTTP + DOM assertions, exits non-zero on failure
node .claude/skills/verify-app/scripts/screenshot.mjs      # real-browser screenshots (desktop 1280, phone 390)
bash .claude/skills/verify-app/scripts/drive-admin.sh      # /admin: redirects + 401s by curl, lockout, then the browser flow
```

`drive-admin.sh` needs `.dev.vars` and Playwright; see `features/admin.md`.

`drive.sh` makes real requests against the running dev server and asserts on the rendered HTML. See `features/` for each feature's routes, selectors and expectations.

`screenshot.mjs` needs Playwright. It is not a project dependency, so install it without touching `package.json`:
`npm i --no-save playwright && npx playwright install chromium`. It also types into the search box and clicks a chip, then records the resulting URL.

Stable selectors (on the home page):
| What | Selector |
|---|---|
| hero kicker | `[data-testid=hero-kicker]` |
| search input | `[data-testid=search-input]` (debounced, updates `?q=`) |
| category chips | `[data-testid=category-chips] a[data-category=<value or all>]`, active one has `aria-current="true"` |
| sort | `[data-testid=sort-select]` (`score`, `name`, `newest`) |
| rows | `[data-testid=factory-row]` with `data-slug`, links to `/factories/<slug>` |
| row score | `[data-testid=score]` |
| empty state | `[data-testid=empty-state]` |

Selectors for the review and compare pages are in `features/factory-page.md` and `features/compare.md`.

## 4. Evidence

Each drive writes `verify-evidence/<run-id>/`:
- `drive.log`: every request (URL, HTTP status) and assertion result, which covers the action taken and the resulting state;
- `*.html`: the raw HTML for each driven URL (DOM/text evidence);
- `*.png`: screenshots from `screenshot.mjs` (`home-1280.png`, `home-390.png`, `search-*.png`, `chip-*.png`, `empty-*.png`, `factory-1280.png`, `factory-390.png`, `compare-1280.png`, `compare-390.png`, `compare-empty-1280.png`); it also drives the compare selector for 2 and then 3 factories;
- `side-effects.txt`: D1 row counts before and after driving. The home page is read-only, so the counts must be identical.

To attach evidence to a Fredrin ticket, run `./.fredrin/fredrin ticket upload <png> --kind after --pair home`.

## 5. Cleanup

```bash
bash .claude/skills/verify-app/scripts/cleanup.sh
```

This kills **only** the process tree whose PID `launch.sh` recorded (never `pkill -f next`, because that pattern also matches unrelated shells). It leaves `verify-evidence/` and the local D1 in place.

## Feature map

One file per top feature in `features/`:
- `features/home-listing.md`: home listing, search, category filter, sort, row links, empty state (**live**)
- `features/factory-page.md`: `/factories/[slug]` review page (**live**)
- `features/compare.md`: `/compare`, `/methodology`, `/about`, `sitemap.xml`, `robots.txt` (**live**)
- `features/admin.md`: password-protected `/admin`: login, create/edit/publish/delete, 401s without a session (**live**, `scripts/drive-admin.sh`)

When a later ticket builds one of these, fill in its file and extend `drive.sh`.
