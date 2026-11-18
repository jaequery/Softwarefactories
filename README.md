# Software Factories

Independent, editorial reviews of every AI "software factory" on the internet: the autonomous coding agents and platforms that turn tickets or prompts into shipped code. Only the site owner writes reviews; visitors read them.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Cloudflare D1 (SQLite) · [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)

## Local setup (no Docker)

Requirements: Node 20+ and npm.

```bash
npm install
cp .dev.vars.example .dev.vars   # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (see Admin below)
npm run db:migrate:local   # creates the local D1 in .wrangler/state and applies migrations/ (schema + seed)
npm run dev                # http://localhost:3000
```

`next.config.ts` calls `initOpenNextCloudflareForDev()`, so `npm run dev` gets the same Cloudflare bindings as production. Server components read the database with `getCloudflareContext().env.DB` (see `src/lib/db.ts`), and locally that binding is the wrangler D1 in `.wrangler/state`.

To start over from an empty database, run `rm -rf .wrangler/state && npm run db:migrate:local`.

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server with local D1 bindings |
| `npm run build` | `next build` |
| `npm run preview` | OpenNext Cloudflare build, then a local `wrangler` preview of the Worker |
| `npm run build:cf` | OpenNext Cloudflare build only (`.open-next/`) |
| `npm run db:migrate:local` | Apply `migrations/` to the local D1 |
| `npm run db:migrate:remote` | Apply `migrations/` to the hosted D1 |
| `npm run lint` / `npm run typecheck` | ESLint / route type generation + `tsc --noEmit` |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` after editing `wrangler.jsonc` |

## Database

- `migrations/0001_init.sql` holds the schema: `factories` and `reviews` (one current editorial review per factory), with indexes on slug, category and overall score.
- `migrations/0002_seed.sql` seeds 12 real AI software factories, researched on each product's own site in November 2026. Fields that could not be verified are left empty. **The seeded scores are drafts** ("Draft score: pending hands-on review") until the owner edits them.
- `migrations/0003_admin_login_attempts.sql` adds `admin_login_attempts`, the per-IP failed-login counter behind the admin's brute-force limit.
- To change data, add a new numbered migration (`0003_….sql`). Do not edit migrations that have already been applied to the hosted database.

## Admin (`/admin`)

The site owner adds, edits, publishes and deletes factories and their reviews at `/admin`. There are no user accounts: one password unlocks it.

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | The admin password checked at `/admin/login` (constant-time compare). Changing it signs every session out. **If unset, admin login is disabled**; the admin is never open by default. |
| `ADMIN_SESSION_SECRET` | Secret that HMAC-signs the session cookie (use 32+ random characters, e.g. `openssl rand -base64 48`). Changing it (or `ADMIN_PASSWORD`) signs every session out. Login is also disabled while it is unset or shorter than 32 characters. |

- **Locally:** put both in `.dev.vars` (copy `.dev.vars.example`; `.dev.vars` is git-ignored). `npm run dev` reads them through the Cloudflare dev bindings.
- **On Fredrin hosting:** set both as secrets under *Hosting → variables*. They are read at runtime, not at build. Never commit real values.
- Signing in sets an `HttpOnly`, `Secure`, `SameSite=Lax` cookie signed with HMAC-SHA-256 (Web Crypto) that expires after 7 days. *Sign out* clears it.
- Brute-force protection: every attempt waits ~400 ms, and each IP gets 5 attempts per 15-minute window, counted atomically before the password is checked (so parallel requests can't exceed it) and reset by a successful login; further attempts are refused until the window passes (counts live in the `admin_login_attempts` table).
- Every `/admin` page checks the session on the server and redirects to `/admin/login`; every server action that writes checks it again and answers **401** without a session.
- Saving revalidates the public pages, so changes show on `/` and `/factories/<slug>` immediately, with no rebuild.

## Deploying: Fredrin hosting

The site deploys on **Fredrin hosting** (`<name>.fredrin.dev`), which runs Next.js on Cloudflare Workers through OpenNext. It is not deployed to Vercel.

- The database is **Cloudflare D1**, bound to the Worker as **`env.DB`** (`d1_databases` in `wrangler.jsonc`). The `database_id` there is a placeholder: Fredrin provisions the hosted D1 database on the first deploy that stores data and wires in the real id. No outside database is used (no Turso, Supabase, Neon or Postgres).
- Migrations are applied with `wrangler d1 migrations apply DB --remote` (`npm run db:migrate:remote`).
- Pages query D1 on every request (`dynamic = "force-dynamic"`), so edits show up without a rebuild.

## Verifying changes

The `verify-app` skill (`.claude/skills/verify-app/`, mirrored in `.agents/skills/verify-app/`) launches the site from an empty local D1, health-checks it, drives search, filters, sort and row links, captures screenshots and DOM evidence into `verify-evidence/`, and cleans up after itself. Start with its `SKILL.md`.
