// End-to-end check of the web build. Saves screenshots to tests/e2e/output.
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const APP = process.env.APP_URL ?? "http://localhost:8090";
const OUT = new URL("./output/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const cafes = JSON.parse(readFileSync(new URL("../../src/data/cafes.json", import.meta.url), "utf8"));
const CARD_INTERVAL = 312;

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
const pin = (page, name) => page.getByRole("button", { name, exact: true }).and(page.locator(".cm-pin"));
const sheet = (page) => page.getByTestId("cafe-sheet");
const cards = (page) => page.locator('[data-testid^="card-"]');
const search = (page) => page.getByLabel("Kafe ara");

async function pinTitles(page) {
  return pins(page).evaluateAll((els) => els.map((el) => el.getAttribute("title")));
}

async function selectedPins(page) {
  return page.locator(".cm-pin--selected").evaluateAll((els) => els.map((el) => el.getAttribute("title")));
}

async function expectSelected(page, names) {
  for (let i = 0; i < 20; i++) {
    const current = await selectedPins(page);
    if (JSON.stringify(current) === JSON.stringify(names)) return;
    await page.waitForTimeout(100);
  }
  throw new Error(`selected pins: ${JSON.stringify(await selectedPins(page))}, expected ${JSON.stringify(names)}`);
}

async function noHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) throw new Error(`page overflows horizontally by ${overflow}px`);
}

async function inViewport(page, locator, what) {
  const box = await locator.boundingBox();
  const { width, height } = page.viewportSize();
  if (!box || box.x < 0 || box.y < 0 || box.x + box.width > width || box.y + box.height > height) {
    throw new Error(`${what} is outside the viewport: ${JSON.stringify(box)}`);
  }
  return box;
}

async function closeSheet(page) {
  await sheet(page).getByRole("button", { name: "Kapat" }).click();
  await sheet(page).waitFor({ state: "detached" });
}

// Same matching rules as src/lib/cafes.ts, to know what each query should return.
const normalize = (text) =>
  text.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const expectedFor = (query) => {
  const words = normalize(query).split(" ").filter(Boolean);
  return cafes
    .filter((c) => words.every((w) => normalize([c.name, c.neighbourhood, c.district, ...c.tags].join(" ")).includes(w)))
    .map((c) => c.name);
};

for (const [device, viewport, scheme] of [
  ["mobile", { width: 390, height: 844 }, "light"],
  ["desktop", { width: 1280, height: 800 }, "light"],
  ["mobile-dark", { width: 390, height: 844 }, "dark"],
]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`${device} page error: ${error.message}`));

  await step(`${device}: full-screen map, one pin and one card per cafe`, async () => {
    await page.goto(APP);
    await page.getByRole("heading", { name: "CafeMap" }).waitFor();
    await page.getByText(`İstanbul · ${cafes.length} kafe`).waitFor();
    const box = await page.locator(".cm-map").boundingBox();
    if (!box || box.width < viewport.width - 1 || box.height < viewport.height - 1) {
      throw new Error(`map is not full screen: ${JSON.stringify(box)}`);
    }
    await pins(page).first().waitFor();
    const titles = await pinTitles(page);
    if (titles.length !== cafes.length) throw new Error(`expected ${cafes.length} pins, got ${titles.length}`);
    for (const cafe of cafes) if (!titles.includes(cafe.name)) throw new Error(`missing pin: ${cafe.name}`);
    if ((await cards(page).count()) !== cafes.length) throw new Error(`expected ${cafes.length} cards`);
    await expectSelected(page, []);
    await noHorizontalOverflow(page);
    await page.waitForTimeout(300);
    await shot(page, `${device}-map`);
  });

  const target = cafes.find((c) => c.id === "kuzguncuk-bahce");

  await step(`${device}: tapping a pin opens its sheet and highlights it`, async () => {
    await pin(page, target.name).click();
    await sheet(page).getByRole("heading", { name: target.name }).waitFor();
    await sheet(page).getByText(target.description).waitFor();
    await sheet(page).getByText(target.address).waitFor();
    await sheet(page).getByText(target.openingHours).waitFor();
    await expectSelected(page, [target.name]);
    if ((await page.getByTestId("cafe-strip").getAttribute("aria-hidden")) !== "true") {
      throw new Error("card list should hide while the sheet is open");
    }
    await page.waitForTimeout(900); // camera animation
    const pinBox = await inViewport(page, pin(page, target.name), "selected pin");
    const sheetBox = await sheet(page).boundingBox();
    if (sheetBox && pinBox.y + pinBox.height > sheetBox.y) throw new Error("selected pin is hidden behind the sheet");
    await shot(page, `${device}-sheet`);
  });

  await step(`${device}: closing the sheet clears the selection`, async () => {
    await closeSheet(page);
    await expectSelected(page, []);
    if ((await page.getByTestId("cafe-strip").getAttribute("aria-hidden")) === "true") throw new Error("card list should be back");
  });

  await step(`${device}: tapping a card opens the same sheet`, async () => {
    const cafe = cafes[1];
    await page.getByTestId(`card-${cafe.id}`).click();
    await sheet(page).getByRole("heading", { name: cafe.name }).waitFor();
    await expectSelected(page, [cafe.name]);
    await closeSheet(page);
  });

  await step(`${device}: scrolling the cards moves the highlight on the map`, async () => {
    const list = page.getByTestId("cafe-list");
    for (const index of [3, 6]) {
      await list.evaluate((el, x) => {
        el.scrollLeft = x;
      }, index * CARD_INTERVAL);
      await expectSelected(page, [cafes[index].name]);
    }
    await page.waitForTimeout(900);
    await inViewport(page, pin(page, cafes[6].name), "highlighted pin");
    if (await sheet(page).count()) throw new Error("browsing cards should not open the sheet");
  });

  await step(`${device}: search filters pins and cards, ignoring Turkish letters`, async () => {
    for (const query of ["kadikoy", "deniz manzarasi", "BAHÇE üsküdar"]) {
      const expected = expectedFor(query);
      await search(page).fill(query);
      await page.getByText(`${expected.length} sonuç`).waitFor();
      const titles = await pinTitles(page);
      if (JSON.stringify([...titles].sort()) !== JSON.stringify([...expected].sort())) {
        throw new Error(`"${query}": pins ${JSON.stringify(titles)}, expected ${JSON.stringify(expected)}`);
      }
      if ((await cards(page).count()) !== expected.length) throw new Error(`"${query}": card count differs`);
    }
    await search(page).fill("deniz manzarasi");
    await page.waitForTimeout(900);
    for (const name of expectedFor("deniz manzarasi")) await inViewport(page, pin(page, name), `pin ${name}`);
    await shot(page, `${device}-search`);
  });

  await step(`${device}: empty search result and clearing it`, async () => {
    await search(page).fill("zzzz");
    await page.getByText("“zzzz” için kafe bulunamadı.").waitFor();
    if ((await pins(page).count()) !== 0) throw new Error("no pins expected");
    await page.getByRole("button", { name: "Aramayı temizle" }).last().click();
    await page.getByText(`İstanbul · ${cafes.length} kafe`).waitFor();
    if ((await pins(page).count()) !== cafes.length) throw new Error("all pins should be back");
    if ((await search(page).inputValue()) !== "") throw new Error("search box should be empty");
  });

  await context.close();
}

await browser.close();
if (failures.length > 0) {
  console.log(`\n${failures.length} step(s) failed`);
  process.exit(1);
}
console.log("\nall steps passed");
