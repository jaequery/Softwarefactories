// Real-browser evidence: screenshots at 1280 and 390, plus typing into search and clicking a chip.
// Needs Playwright: `npm i --no-save playwright && npx playwright install chromium`.
import { mkdirSync, writeFileSync } from "node:fs";

let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  console.error("playwright not installed: npm i --no-save playwright && npx playwright install chromium"); process.exit(2);
}
const BASE = `http://localhost:${process.env.PORT ?? 3000}`;
const run = process.env.RUN_ID ?? new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "Z");
const out = `verify-evidence/${run}`; mkdirSync(out, { recursive: true });
const log = []; const note = (s) => { console.log(s); log.push(s); };

const browser = await chromium.launch();
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${out}/home-${width}.png`, fullPage: true });
    note(`home @${width}: ${await page.locator("[data-testid=factory-row]").count()} rows -> ${out}/home-${width}.png`);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const first = await page.locator("[data-testid=factory-row] b").first().innerText();
  await page.fill("[data-testid=search-input]", first);
  await page.waitForURL(/\?q=/, { timeout: 15000 }); await page.waitForLoadState("networkidle");
  note(`typed "${first}" -> ${page.url()} -> ${await page.locator("[data-testid=factory-row]").count()} rows`);
  await page.screenshot({ path: `${out}/search-1280.png`, fullPage: true });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.click("[data-testid=category-chips] a[data-category=platform]");
  await page.waitForURL(/category=platform/, { timeout: 15000 }); await page.waitForLoadState("networkidle");
  note(`clicked chip "platform" -> ${page.url()} -> ${await page.locator("[data-testid=factory-row]").count()} rows`);
  await page.screenshot({ path: `${out}/chip-platform-1280.png`, fullPage: true });

  await page.selectOption("[data-testid=sort-select]", "name");
  await page.waitForURL(/sort=name/, { timeout: 15000 }); await page.waitForLoadState("networkidle");
  note(`sort -> name: ${page.url()} -> first row "${await page.locator("[data-testid=factory-row] b").first().innerText()}"`);

  await page.goto(`${BASE}/?q=zzzz-no-such-factory`, { waitUntil: "networkidle" });
  note(`empty state visible: ${await page.locator("[data-testid=empty-state]").isVisible()}`);
  await page.screenshot({ path: `${out}/empty-1280.png` });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.locator("[data-testid=factory-row]").first().click();
  await page.waitForURL(/\/factories\//); note(`clicked first row -> ${page.url()}`);
} finally {
  await browser.close();
  writeFileSync(`${out}/screenshot.log`, log.join("\n") + "\n");
}
