# Feature: admin (`/admin`), LIVE

Password-protected editor for factories and their reviews. One password, no accounts.

## Setup

- `.dev.vars` (git-ignored; copy `.dev.vars.example`) must hold `ADMIN_PASSWORD` and an `ADMIN_SESSION_SECRET` of 32+ characters.
  A local test pair: `ADMIN_PASSWORD=local-test-password`, `ADMIN_SESSION_SECRET=local-dev-session-secret-0123456789abcdef`.
- `npm run dev` only reads `.dev.vars` at start: create it **before** `launch.sh` (or relaunch).
- `launch.sh` applies `migrations/0003_admin_login_attempts.sql` along with the rest.
- Without either variable, `/admin/login` shows `[data-testid=login-disabled]` ("Admin login is disabled") and no form; nothing can sign in.

## Drive

```bash
bash .claude/skills/verify-app/scripts/drive-admin.sh   # needs Playwright (see SKILL.md); exits non-zero on any failure
```

It reads `ADMIN_PASSWORD` from `.dev.vars` and writes `verify-evidence/admin-<timestamp>/`:
1. **No session / forged cookie, direct curl:** `GET /admin`, `/admin/factories/new`, `/admin/factories/<id>` → `307` to `/admin/login`;
   `POST`s to the `saveFactory` (create and update) and `deleteFactory` server actions (ids from `.next/dev/server/server-reference-manifest.json`, sent with a `Next-Action` header) → **`401`**; D1 counts unchanged.
2. **Brute-force limit:** 5 wrong logins from one `cf-connecting-ip` → the 6th (even with the right password) says "Too many failed attempts" and sets no cookie; 10 simultaneous wrong logins from a fresh IP → exactly 5 reach the password check (attempts are reserved atomically). Test rows are deleted afterwards.
3. **Browser (`drive-admin.mjs`):** wrong password → "Wrong password."; right one → `/admin`, cookie `HttpOnly; Secure; SameSite=Lax`, 7 days; validation errors (score 11, 2 decimals, missing scores, bad URL) shown per field with values kept; create + publish (score 9.9) → first on `/` and `/factories/<slug>` 200; score 0.1 → last on `/`; editor's pick → exactly one pick in D1; unpublish → gone from `/`, page 404, still a draft in `/admin`; delete (confirm dialog) → factory and review rows gone; the seeded pick is restored on `factory`; sign out → cookie cleared, `/admin` redirects.

D1 counts end where they started. Screenshots: `admin-login.png`, `admin-login-wrong.png`, `admin-home.png`, `admin-form-errors.png`, `admin-edit-form.png`, `admin-edit-saved.png`, `home-with-new.png`, `factory-new.png`.

## Routes and selectors

| Route | What | Selectors |
|---|---|---|
| `/admin/login` | password form, or the disabled notice | `[data-testid=password-input]`, `[data-testid=login-submit]`, `[data-testid=login-error]`, `[data-testid=login-disabled]` |
| `/admin` | every factory (drafts included), newest update first | `[data-testid=admin-row]` (`data-slug`, `data-id`), `admin-score`, `admin-status` (`published`/`draft`), `admin-pick`, `admin-edit`, `admin-view`, `[data-testid=new-factory]`, `[data-testid=logout]` |
| `/admin/factories/new` | create form | inputs `#f-<column>` (`#f-name`, `#f-slug`, `#f-overall_score`, …), `[data-testid=pros-add]`/`pros-item`/`pros-remove` (same for `cons`), `body-tab-write`/`body-tab-preview`/`body-preview`, `editors-pick-input`, `published-input`, `save-factory`, `form-error`, `error-<field>` |
| `/admin/factories/<id>` | same form, saved banner (`?saved=1`), timestamps, `delete-factory` (confirm dialog) | `[data-testid=flash]`, `[data-testid=view-public]` |

## Side effects (D1)

| Action | Rows written |
|---|---|
| failed login | `admin_login_attempts` upsert for the IP (cleared on a successful login) |
| create | one `factories` row + one `reviews` row (`pros`/`cons` JSON arrays, `reviewed_at` and `updated_at` set) |
| save | `factories` + `reviews` updated (`updated_at` = now; `reviewed_at` refreshed when a draft is published) |
| editor's pick on | `editors_pick = 0` on every other review |
| delete | the factory's `reviews` row and its `factories` row |

After every save or delete the action calls `revalidatePath("/", "layout")`; the public pages also read D1 per request, so `/` and `/factories/<slug>` change with no rebuild.
