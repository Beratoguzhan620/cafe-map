/// <reference types="node" />
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { cafes } from "../src/lib/cafes";

describe("cafe images", () => {
  it("has a bundled cover for every cafe", () => {
    for (const cafe of cafes) {
      expect(existsSync(new URL(`../assets/cafes/${cafe.image}`, import.meta.url)), cafe.image).toBe(true);
    }
  });
});
