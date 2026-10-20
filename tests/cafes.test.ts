import { describe, expect, it } from "vitest";

import { cafes, cameraFor, focusCamera, normalize, priceLabel, searchCafes } from "../src/lib/cafes";

describe("cafes.json", () => {
  it("has 15 cafes with unique ids and images", () => {
    expect(cafes).toHaveLength(15);
    expect(new Set(cafes.map((c) => c.id)).size).toBe(15);
    expect(new Set(cafes.map((c) => c.image)).size).toBe(15);
  });

  it("puts every cafe inside Istanbul", () => {
    for (const cafe of cafes) {
      expect(cafe.latitude, cafe.id).toBeGreaterThan(40.8);
      expect(cafe.latitude, cafe.id).toBeLessThan(41.3);
      expect(cafe.longitude, cafe.id).toBeGreaterThan(28.6);
      expect(cafe.longitude, cafe.id).toBeLessThan(29.4);
    }
  });

  it("fills every field", () => {
    for (const cafe of cafes) {
      expect(cafe.name.trim(), cafe.id).not.toBe("");
      expect(cafe.description.length, cafe.id).toBeGreaterThan(40);
      expect(cafe.address, cafe.id).toContain("İstanbul");
      expect(cafe.rating, cafe.id).toBeGreaterThanOrEqual(0);
      expect(cafe.rating, cafe.id).toBeLessThanOrEqual(5);
      expect([1, 2, 3], cafe.id).toContain(cafe.priceLevel);
      expect(cafe.openingHours, cafe.id).toMatch(/^\d{2}:\d{2}–\d{2}:\d{2}$/);
      expect(cafe.tags.length, cafe.id).toBeGreaterThan(0);
      expect(cafe.image, cafe.id).toBe(`${cafe.id}.jpg`);
    }
  });
});

describe("cameraFor", () => {
  it("centres on the middle of all cafes", () => {
    const camera = cameraFor(cafes);
    const lats = cafes.map((c) => c.latitude);
    const lngs = cafes.map((c) => c.longitude);
    expect(camera.latitude).toBeCloseTo((Math.min(...lats) + Math.max(...lats)) / 2, 4);
    expect(camera.longitude).toBeCloseTo((Math.min(...lngs) + Math.max(...lngs)) / 2, 4);
    expect(camera.zoom).toBeGreaterThanOrEqual(10);
    expect(camera.zoom).toBeLessThanOrEqual(13);
  });

  it("zooms in on a single cafe", () => {
    const camera = cameraFor([cafes[0]]);
    expect(camera).toEqual({ latitude: cafes[0].latitude, longitude: cafes[0].longitude, zoom: 15 });
  });

  it("falls back to central Istanbul when empty", () => {
    expect(cameraFor([])).toEqual({ latitude: 41.0082, longitude: 28.9784, zoom: 11 });
  });
});

describe("priceLabel", () => {
  it("repeats the lira sign", () => {
    expect(priceLabel(1)).toBe("₺");
    expect(priceLabel(3)).toBe("₺₺₺");
  });
});

describe("normalize", () => {
  it("handles Turkish letters and accents", () => {
    expect(normalize("Kadıköy")).toBe("kadikoy");
    expect(normalize("İSTANBUL")).toBe("istanbul");
    expect(normalize("  Üsküdar   İskele ")).toBe("uskudar iskele");
    expect(normalize("Çalışmaya uygun")).toBe("calismaya uygun");
  });
});

describe("searchCafes", () => {
  it("returns everything for an empty query", () => {
    expect(searchCafes(cafes, "   ")).toHaveLength(cafes.length);
  });

  it("matches names without Turkish characters", () => {
    expect(searchCafes(cafes, "karakoy tezgah").map((c) => c.id)).toEqual(["karakoy-tezgah"]);
  });

  it("matches neighbourhoods, districts and tags", () => {
    expect(searchCafes(cafes, "moda").map((c) => c.id)).toEqual(["kuytu-kahve"]);
    const kadikoy = searchCafes(cafes, "KADIKÖY");
    expect(kadikoy.length).toBeGreaterThan(1);
    expect(kadikoy.every((c) => c.district === "Kadıköy")).toBe(true);
    const view = searchCafes(cafes, "deniz manzarası");
    expect(view.length).toBeGreaterThan(1);
    expect(view.every((c) => c.tags.includes("Deniz manzarası"))).toBe(true);
  });

  it("needs every word to match", () => {
    expect(searchCafes(cafes, "bahçe üsküdar").map((c) => c.id)).toEqual(["kuzguncuk-bahce"]);
    expect(searchCafes(cafes, "bebek kadıköy")).toEqual([]);
  });

  it("keeps the original order", () => {
    const ids = searchCafes(cafes, "uygun").map((c) => c.id);
    expect(ids).toEqual(cafes.filter((c) => ids.includes(c.id)).map((c) => c.id));
  });
});

describe("focusCamera", () => {
  it("centres on the cafe without an offset", () => {
    const cafe = cafes[0];
    expect(focusCamera(cafe)).toEqual({ latitude: cafe.latitude, longitude: cafe.longitude, zoom: 15 });
  });

  it("moves the centre south so the cafe sits higher on screen", () => {
    const cafe = cafes[0];
    const camera = focusCamera(cafe, 200);
    expect(camera.latitude).toBeLessThan(cafe.latitude);
    // 200px at zoom 15 is about 0.0066° of latitude around Istanbul.
    expect(cafe.latitude - camera.latitude).toBeCloseTo(0.0065, 3);
    expect(camera.longitude).toBe(cafe.longitude);
  });
});
