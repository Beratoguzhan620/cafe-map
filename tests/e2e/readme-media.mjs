// Records the README walkthrough (tests/e2e/output/walkthrough.webm) and stills on a phone-sized viewport.
// Needs network access for the map tiles.
import { mkdirSync, renameSync } from "node:fs";
import { chromium } from "playwright";

const APP = process.env.APP_URL ?? "http://localhost:8090";
const OUT = new URL("./output/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const viewport = { width: 390, height: 844 };
const CARD_INTERVAL = 312;

const pin = (page, name) => page.getByRole("button", { name, exact: true }).and(page.locator(".cm-pin"));
const sheet = (page) => page.getByTestId("cafe-sheet");
const tiles = (page) => page.waitForLoadState("networkidle").catch(() => {});

async function glide(page, from, to, ms = 700) {
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    await page.getByTestId("cafe-list").evaluate((el, left) => {
      el.scrollLeft = left;
    }, x);
    await page.waitForTimeout(ms / steps);
  }
}

// Stills
for (const scheme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2, colorScheme: scheme });
  await page.goto(APP);
  await page.locator(".cm-pin").first().waitFor();
  await tiles(page);
  await page.waitForTimeout(800);
  if (scheme === "light") await page.screenshot({ path: `${OUT}readme-map.png` });

  await pin(page, "Kuzguncuk Bahçe").click();
  await sheet(page).waitFor();
  await page.waitForTimeout(1200);
  await tiles(page);
  await page.screenshot({ path: `${OUT}readme-sheet${scheme === "dark" ? "-dark" : ""}.png` });

  if (scheme === "light") {
    await sheet(page).getByRole("button", { name: "Kapat" }).click();
    await sheet(page).waitFor({ state: "detached" });
    await page.getByLabel("Kafe ara").fill("deniz manzarasi");
    await page.waitForTimeout(1200);
    await tiles(page);
    await page.screenshot({ path: `${OUT}readme-search.png` });
  }
  await page.close();
}

// Walkthrough
{
  const context = await browser.newContext({ viewport, recordVideo: { dir: OUT, size: viewport } });
  const page = await context.newPage();
  const pause = (ms) => page.waitForTimeout(ms);
  await page.goto(APP);
  await page.locator(".cm-pin").first().waitFor();
  await tiles(page);
  await pause(1500);

  await glide(page, 0, CARD_INTERVAL * 2);
  await pause(1500);
  await glide(page, CARD_INTERVAL * 2, CARD_INTERVAL * 5);
  await pause(1500);

  await page.getByTestId("card-galata-kose").click();
  await pause(2200);
  await sheet(page).getByRole("button", { name: "Kapat" }).click();
  await pause(1400);

  await pin(page, "Kuzguncuk Bahçe").click();
  await pause(2400);
  await sheet(page).getByRole("button", { name: "Kapat" }).click();
  await pause(1200);

  await page.getByLabel("Kafe ara").pressSequentially("deniz", { delay: 120 });
  await pause(1800);
  await page.getByTestId("card-bebek-sahil").click();
  await pause(2400);

  const video = page.video();
  await context.close();
  renameSync(await video.path(), `${OUT}walkthrough.webm`);
}

await browser.close();
console.log("recorded README media");
