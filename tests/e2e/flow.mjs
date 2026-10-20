// End-to-end check of the web build. Saves screenshots to tests/e2e/output.
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const APP = process.env.APP_URL ?? "http://localhost:8090";
const OUT = new URL("./output/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const cafes = JSON.parse(readFileSync(new URL("../../src/data/cafes.json", import.meta.url), "utf8"));

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [];
const step = async (name, fn) => {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`FAIL ${name}\n     ${String(error.message).split("\n")[0]}`);
  }
};

const shot = (page, name) => page.screenshot({ path: `${OUT}${name}.png` });
const pins = (page) => page.locator(".leaflet-marker-icon.cm-pin");

async function noHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) throw new Error(`page overflows horizontally by ${overflow}px`);
}

async function pinsInsideViewport(page) {
  const outside = await pins(page).evaluateAll((els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right < 0 || r.bottom < 0 || r.left > window.innerWidth || r.top > window.innerHeight;
      })
      .map((el) => el.getAttribute("title")),
  );
  if (outside.length > 0) throw new Error(`pins outside the viewport: ${outside.join(", ")}`);
}

for (const [device, viewport, scheme] of [
  ["mobile", { width: 390, height: 844 }, "light"],
  ["desktop", { width: 1280, height: 800 }, "light"],
  ["mobile-dark", { width: 390, height: 844 }, "dark"],
]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`${device} page error: ${error.message}`));

  await step(`${device}: header and full-screen map`, async () => {
    await page.goto(APP);
    await page.getByRole("heading", { name: "CafeMap" }).waitFor();
    await page.getByText(`İstanbul · ${cafes.length} kafe`).waitFor();
    const box = await page.locator(".cm-map").boundingBox();
    if (!box || box.width < viewport.width - 1 || box.height < viewport.height - 1) {
      throw new Error(`map is not full screen: ${JSON.stringify(box)}`);
    }
    await noHorizontalOverflow(page);
  });

  await step(`${device}: one pin per cafe, all in view`, async () => {
    await pins(page).first().waitFor();
    const titles = await pins(page).evaluateAll((els) => els.map((el) => el.getAttribute("title")));
    const expected = cafes.map((c) => c.name);
    if (titles.length !== expected.length) throw new Error(`expected ${expected.length} pins, got ${titles.length}`);
    for (const name of expected) if (!titles.includes(name)) throw new Error(`missing pin: ${name}`);
    await pinsInsideViewport(page);
  });

  await step(`${device}: pins are keyboard reachable and named`, async () => {
    const pin = page.getByRole("button", { name: cafes[0].name, exact: true });
    await pin.focus();
    await pin.hover();
    await page.locator(".cm-tooltip").getByText(cafes[0].name).waitFor();
    await page.waitForTimeout(300);
    await shot(page, `${device}-map`);
  });

  await context.close();
}

await browser.close();
if (failures.length > 0) {
  console.log(`\n${failures.length} step(s) failed`);
  process.exit(1);
}
console.log("\nall steps passed");
