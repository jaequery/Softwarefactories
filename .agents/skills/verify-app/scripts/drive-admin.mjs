// Drive /admin in a real browser (Playwright/Chromium) against the running dev server.
// Usage: node drive-admin.mjs <out-dir>   (env: BASE, ADMIN_PASSWORD). Exits non-zero if any assertion fails.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const PASSWORD = process.env.ADMIN_PASSWORD;
const out = process.argv[2] ?? "verify-evidence/admin";
mkdirSync(out, { recursive: true });
const log = [];
let failed = 0;
const note = (m) => { log.push(m); console.log(m); };
const check = (cond, msg) => { note(`  ${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failed = 1; };
const sql = (q) =>
  JSON.parse(execFileSync("npx", ["wrangler", "d1", "execute", "DB", "--local", "--json", "--command", q], { stdio: ["ignore", "pipe", "ignore"] }).toString())[0].results;
const homeSlugs = async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  return page.locator("[data-testid=factory-row]").evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
};

if (!PASSWORD) { console.error("ADMIN_PASSWORD is not set (put it in .dev.vars)"); process.exit(2); }

const RUN = Date.now().toString(36);
const NAME = `Verify Factory ${RUN}`;
const SLUG = `verify-factory-${RUN}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on("dialog", (d) => { note(`dialog: "${d.message()}" -> accept`); d.accept(); });

try {
  note("== login");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  check(page.url() === `${BASE}/admin/login`, `/admin without a session -> ${page.url()}`);
  await page.screenshot({ path: `${out}/admin-login.png`, fullPage: true });

  await page.fill("[data-testid=password-input]", "definitely-wrong");
  await page.click("[data-testid=login-submit]");
  await page.waitForSelector("[data-testid=login-error]");
  const err = await page.textContent("[data-testid=login-error]");
  check(err.includes("Wrong password") && page.url().endsWith("/admin/login"), `wrong password rejected: "${err}"`);
  await page.screenshot({ path: `${out}/admin-login-wrong.png`, fullPage: true });
  check((await context.cookies()).every((c) => c.name !== "sf_admin_session"), "no session cookie after a wrong password");

  await page.fill("[data-testid=password-input]", PASSWORD);
  await Promise.all([page.waitForURL(`${BASE}/admin`), page.click("[data-testid=login-submit]")]);
  check(true, "right password -> /admin");
  const cookie = (await context.cookies()).find((c) => c.name === "sf_admin_session");
  const days = cookie ? (cookie.expires * 1000 - Date.now()) / 86400000 : 0;
  check(cookie && cookie.httpOnly && cookie.secure && cookie.sameSite === "Lax" && days > 6.9 && days <= 7,
    `session cookie HttpOnly=${cookie?.httpOnly} Secure=${cookie?.secure} SameSite=${cookie?.sameSite} expires in ${days.toFixed(2)} days`);
  const total = sql("SELECT COUNT(*) AS n FROM factories")[0].n;
  const rows = await page.locator("[data-testid=admin-row]").count();
  check(rows === total, `admin table lists all ${total} factories (drafts included): ${rows}`);
  await page.screenshot({ path: `${out}/admin-home.png`, fullPage: true });

  note("== validation errors");
  await page.click("[data-testid=new-factory]");
  await page.waitForURL(`${BASE}/admin/factories/new`);
  await page.fill("#f-name", NAME);
  check((await page.inputValue("#f-slug")) === SLUG, `slug auto-filled from name: ${await page.inputValue("#f-slug")}`);
  await page.fill("#f-website_url", "not a url");
  await page.fill("#f-overall_score", "11");
  await page.fill("#f-score_autonomy", "7.25");
  await page.click("[data-testid=save-factory]");
  await page.waitForSelector("[data-testid=form-error]");
  const errs = Object.fromEntries(
    await Promise.all(["overall_score", "score_autonomy", "score_quality", "website_url"].map(async (k) => [k, (await page.locator(`[data-testid=error-${k}]`).allTextContents()).join(" ")])),
  );
  check(errs.overall_score.includes("between 0 and 10") && errs.score_autonomy.includes("one decimal") && errs.score_quality.includes("Required") && errs.website_url.includes("URL"),
    `field errors shown: ${JSON.stringify(errs)}`);
  check((await page.inputValue("#f-name")) === NAME && (await page.inputValue("#f-overall_score")) === "11", "submitted values kept after a failed save");
  check(sql(`SELECT COUNT(*) AS n FROM factories WHERE slug = '${SLUG}'`)[0].n === 0, "nothing written on a failed save");
  await page.screenshot({ path: `${out}/admin-form-errors.png`, fullPage: true });

  note("== create + publish");
  await page.fill("#f-website_url", "https://example.com/verify");
  await page.fill("#f-tagline", "Created by the verify-app admin drive");
  await page.fill("#f-description", "A throwaway factory written through /admin.");
  await page.selectOption("#f-category", "cli-agent");
  await page.fill("#f-pricing_summary", "Free");
  for (const [k, v] of [["overall_score", "9.9"], ["score_autonomy", "9.5"], ["score_quality", "9"], ["score_speed", "8.5"], ["score_value", "10"]]) await page.fill(`#f-${k}`, v);
  await page.fill("#f-verdict", "Verified end to end.");
  await page.fill("#f-body_markdown", "## Hands-on\n\nIt **works**:\n\n- created in the admin\n- shown on the home page");
  await page.click("[data-testid=body-tab-preview]");
  check((await page.locator("[data-testid=body-preview] h3").textContent()) === "Hands-on" && (await page.locator("[data-testid=body-preview] strong").count()) === 1, "markdown preview renders the ## heading (as h3) + bold");
  await page.click("[data-testid=body-tab-write]");
  await page.click("[data-testid=pros-add]"); await page.locator("[data-testid=pros-item]").nth(0).fill("Fast");
  await page.click("[data-testid=pros-add]"); await page.locator("[data-testid=pros-item]").nth(1).fill("Cheap");
  await page.click("[data-testid=pros-add]"); await page.locator("[data-testid=pros-item]").nth(2).fill("To be removed");
  await page.locator("[data-testid=pros-remove]").nth(2).click();
  await page.click("[data-testid=cons-add]"); await page.locator("[data-testid=cons-item]").nth(0).fill("Imaginary");
  await page.check("[data-testid=published-input]");
  await page.screenshot({ path: `${out}/admin-edit-form.png`, fullPage: true });
  await Promise.all([page.waitForURL(/\/admin\/factories\/\d+\?saved=1$/), page.click("[data-testid=save-factory]")]);
  const id = Number(new URL(page.url()).pathname.split("/").pop());
  note(`saved -> ${page.url()}`);
  const [row] = sql(`SELECT f.id, f.slug, f.category, r.overall_score, r.pros, r.cons, r.published, r.editors_pick, r.reviewed_at, r.updated_at FROM factories f JOIN reviews r ON r.factory_id = f.id WHERE f.id = ${id}`);
  note(`D1 row: ${JSON.stringify(row)}`);
  check(row && row.slug === SLUG && row.overall_score === 9.9 && row.pros === '["Fast","Cheap"]' && row.cons === '["Imaginary"]' && row.published === 1 && row.reviewed_at && row.updated_at,
    "factory + review rows written (pros/cons as JSON arrays, timestamps set)");
  await page.screenshot({ path: `${out}/admin-edit-saved.png`, fullPage: true });

  let slugs = await homeSlugs(page);
  check(slugs[0] === SLUG, `published factory is first on / (score 9.9): ${slugs.slice(0, 3).join(", ")}`);
  await page.screenshot({ path: `${out}/home-with-new.png` });
  let res = await page.goto(`${BASE}/factories/${SLUG}`, { waitUntil: "networkidle" });
  check(res.status() === 200 && (await page.textContent("[data-testid=factory-name]")) === NAME && (await page.textContent("[data-testid=score]")) === "9.9", `/factories/${SLUG} -> ${res.status()}, shows name and 9.9`);
  await page.screenshot({ path: `${out}/factory-new.png`, fullPage: true });

  note("== edit score reorders the home list");
  await page.goto(`${BASE}/admin/factories/${id}`, { waitUntil: "networkidle" });
  await page.fill("#f-overall_score", "0.1");
  await Promise.all([page.waitForURL(/\?saved=1$/), page.click("[data-testid=save-factory]")]);
  slugs = await homeSlugs(page);
  check(slugs[slugs.length - 1] === SLUG, `after score 0.1 it is last on /: ${slugs.slice(-2).join(", ")}`);

  note("== editor's pick is exclusive");
  await page.goto(`${BASE}/admin/factories/${id}`, { waitUntil: "networkidle" });
  await page.check("[data-testid=editors-pick-input]");
  await Promise.all([page.waitForURL(/\?saved=1$/), page.click("[data-testid=save-factory]")]);
  const picks = sql("SELECT f.slug FROM reviews r JOIN factories f ON f.id = r.factory_id WHERE r.editors_pick = 1").map((r) => r.slug);
  check(picks.length === 1 && picks[0] === SLUG, `exactly one editor's pick, the new factory: ${picks.join(",")}`);

  note("== unpublish hides it");
  await page.goto(`${BASE}/admin/factories/${id}`, { waitUntil: "networkidle" });
  await page.uncheck("[data-testid=published-input]");
  await Promise.all([page.waitForURL(/\?saved=1$/), page.click("[data-testid=save-factory]")]);
  slugs = await homeSlugs(page);
  check(!slugs.includes(SLUG), "unpublished factory is gone from /");
  res = await page.goto(`${BASE}/factories/${SLUG}`);
  check(res.status() === 404, `/factories/${SLUG} -> ${res.status()} once unpublished`);
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  check((await page.locator(`[data-testid=admin-row][data-slug="${SLUG}"] [data-testid=admin-status]`).textContent()) === "draft", "admin table still lists it as a draft");

  note("== delete removes factory + review");
  await page.goto(`${BASE}/admin/factories/${id}`, { waitUntil: "networkidle" });
  await Promise.all([page.waitForURL(`${BASE}/admin?deleted=1`), page.click("[data-testid=delete-factory]")]);
  const left = sql(`SELECT (SELECT COUNT(*) FROM factories WHERE id = ${id}) AS f, (SELECT COUNT(*) FROM reviews WHERE factory_id = ${id}) AS r`)[0];
  check(left.f === 0 && left.r === 0, `rows left for id ${id}: factories=${left.f} reviews=${left.r}`);
  check((await page.locator(`[data-testid=admin-row][data-slug="${SLUG}"]`).count()) === 0, "gone from the admin table");

  note("== restore the seeded editor's pick (Factory) through the admin");
  const seedId = sql("SELECT id FROM factories WHERE slug = 'factory'")[0]?.id;
  if (seedId) {
    await page.goto(`${BASE}/admin/factories/${seedId}`, { waitUntil: "networkidle" });
    await page.check("[data-testid=editors-pick-input]");
    await Promise.all([page.waitForURL(/\?saved=1$/), page.click("[data-testid=save-factory]")]);
    check(sql("SELECT COUNT(*) AS n FROM reviews WHERE editors_pick = 1")[0].n === 1, "one editor's pick again");
  }

  note("== logout");
  await Promise.all([page.waitForURL(`${BASE}/admin/login`), page.click("[data-testid=logout]")]);
  check(!(await context.cookies()).some((c) => c.name === "sf_admin_session" && c.value), "session cookie cleared");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  check(page.url() === `${BASE}/admin/login`, `/admin after logout -> ${page.url()}`);
} catch (e) {
  failed = 1;
  note(`ERROR ${e?.stack ?? e}`);
  await page.screenshot({ path: `${out}/admin-error.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
  writeFileSync(`${out}/drive-admin.log`, log.join("\n") + "\n");
}
note(failed ? "BROWSER RESULT: FAIL" : "BROWSER RESULT: PASS");
process.exit(failed);
