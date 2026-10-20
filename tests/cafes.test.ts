import { describe, expect, it } from "vitest";

import { cafes, cameraFor, priceLabel } from "../src/lib/cafes";

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
