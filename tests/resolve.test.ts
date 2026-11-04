import { describe, expect, it } from "vitest";
import { items, resolveRule } from "@/lib/items";
import { LOCALITY_IDS } from "@/lib/localities";

const cases: [string, string, string][] = [
  ["pizza-box", "sf", "compost"],
  ["pizza-box", "seattle", "compost"],
  ["pizza-box", "nyc", "compost"],
  ["pizza-box", "austin", "compost"],
  ["pizza-box", "baseline", "landfill"],
  ["alkaline-battery", "nyc", "landfill"],
  ["alkaline-battery", "seattle", "special"],
  ["alkaline-battery", "sf", "special"],
  ["lithium-battery", "nyc", "special"],
  ["lithium-battery", "baseline", "special"],
  ["coffee-cup", "austin", "recycle"],
  ["coffee-cup", "sf", "recycle"],
  ["coffee-cup", "seattle", "landfill"],
  ["coffee-cup", "nyc", "landfill"],
  ["coffee-cup", "baseline", "landfill"],
  ["pp-tub", "seattle", "landfill"],
  ["pp-tub", "sf", "recycle"],
  ["plastic-film", "sf", "special"],
  ["plastic-film", "austin", "special"],
  ["plastic-film", "nyc", "landfill"],
  ["plastic-film", "seattle", "landfill"],
  ["plastic-utensil", "sf", "recycle"],
  ["plastic-utensil", "nyc", "recycle"],
  ["plastic-utensil", "seattle", "landfill"],
  ["plastic-utensil", "austin", "landfill"],
  ["ceramic", "nyc", "landfill"],
  ["textile", "austin", "special"],
  ["phone", "nyc", "special"],
  ["food-scraps", "baseline", "landfill"],
  ["food-scraps", "nyc", "compost"],
  ["yard-trimmings", "sf", "compost"],
  ["yard-trimmings", "baseline", "landfill"],
  ["paper-napkin", "sf", "compost"],
  ["paper-napkin", "nyc", "landfill"],
];

describe("city rules", () => {
  it("resolves the disagreements the demo depends on", () => {
    for (const [itemId, localityId, stream] of cases) {
      const resolved = resolveRule(itemId, localityId);
      expect(resolved, `${itemId} in ${localityId}`).not.toBeNull();
      expect(resolved!.rule.stream, `${itemId} in ${localityId}`).toBe(stream);
      expect(resolved!.rule.setout.length).toBeGreaterThan(10);
      expect(resolved!.rule.note.length).toBeGreaterThan(20);
    }
  });

  it("has a rule for every item in every city", () => {
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    for (const item of items) {
      for (const localityId of LOCALITY_IDS) {
        const resolved = resolveRule(item.id, localityId);
        expect(resolved, item.id + " " + localityId).not.toBeNull();
      }
    }
  });

  it("rejects an unknown pair", () => {
    expect(resolveRule("nope", "sf")).toBeNull();
    expect(resolveRule("pizza-box", "paris")).toBeNull();
  });
});
