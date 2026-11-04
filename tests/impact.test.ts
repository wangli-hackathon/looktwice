import { describe, expect, it } from "vitest";
import { deltaKgPerKg, KG_CO2E_PER_VEHICLE_MILE, SHORT_TON_KG } from "@/lib/factors";
import { climateFor, milesEquivalent } from "@/lib/impact";
import { requireItem } from "@/lib/items";

describe("WARM deltas", () => {
  it("pins the aluminum-can recycling credit for a 14.9 g can", () => {
    const perKg = deltaKgPerKg(-9.13, 0.02);
    expect(perKg).toBeCloseTo((-9.15 * 1000) / SHORT_TON_KG, 8);
    const can = climateFor(requireItem("aluminum-can"), "recycle", 0.0149);
    expect(can.deltaKg).toBeCloseTo(perKg * 0.0149, 8);
    expect(can.deltaKg).toBeCloseTo(-0.150284, 4);
    expect(can.column).toBe("recycling");
  });

  it("gives eaten food a larger credit than composting the same plate", () => {
    const weight = 0.25;
    const eaten = climateFor(requireItem("food-scraps"), "reuse", weight);
    const composted = climateFor(requireItem("food-scraps"), "compost", weight);
    expect(eaten.deltaKg).not.toBeNull();
    expect(composted.deltaKg).not.toBeNull();
    expect(eaten.deltaKg!).toBeLessThan(composted.deltaKg!);
    expect(eaten.deltaKg!).toBeCloseTo(((-3.66 - 0.5) * 1000 * weight) / SHORT_TON_KG, 6);
    expect(composted.deltaKg!).toBeLessThan(0);
  });

  it("shows yard-trimming compost as a small increase versus landfill", () => {
    const yard = climateFor(requireItem("yard-trimmings"), "compost", 1);
    expect(yard.deltaKg).toBeGreaterThan(0);
    expect(yard.deltaKg).toBeCloseTo((( -0.11 - -0.2) * 1000) / SHORT_TON_KG, 6);
    expect(yard.shortBasis.toLowerCase()).toContain("carbon storage");
  });

  it("leaves composted cardboard and film recycling blank", () => {
    const pizza = climateFor(requireItem("pizza-box"), "compost", 0.2);
    expect(pizza.deltaKg).toBeNull();
    expect(pizza.shortBasis).toMatch(/not borrowed/i);

    const film = climateFor(requireItem("plastic-film"), "special", 0.006);
    expect(film.deltaKg).toBeNull();
    expect(film.shortBasis).toMatch(/LDPE/);

    const shirt = climateFor(requireItem("textile"), "reuse", 0.18);
    expect(shirt.deltaKg).toBeNull();
    expect(shirt.shortBasis).toMatch(/no apparel/i);
  });

  it("uses the mixed-electronics recycling factor for a dropped-off phone", () => {
    const phone = climateFor(requireItem("phone"), "special", 0.19);
    expect(phone.column).toBe("recycling");
    expect(phone.deltaKg).toBeLessThan(0);
    expect(phone.shortBasis).toMatch(/not a phone-specific/i);
  });

  it("converts avoided CO2e into vehicle miles and refuses the equivalency for increases", () => {
    expect(milesEquivalent(-0.393)).toBeCloseTo(1, 6);
    expect(KG_CO2E_PER_VEHICLE_MILE).toBe(0.393);
    expect(milesEquivalent(0.1)).toBeNull();
    expect(milesEquivalent(null)).toBeNull();
  });

  it("treats landfill as a zero baseline only when a WARM row exists", () => {
    const can = climateFor(requireItem("aluminum-can"), "landfill", 0.0149);
    expect(can.deltaKg).toBe(0);
    const shirt = climateFor(requireItem("textile"), "landfill", 0.18);
    expect(shirt.deltaKg).toBeNull();
  });
});
