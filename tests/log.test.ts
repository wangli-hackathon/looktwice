import { describe, expect, it } from "vitest";
import { milesEquivalent } from "@/lib/impact";
import {
  buildEntry,
  demoWeek,
  loadCity,
  loadLog,
  saveCity,
  saveLog,
  serializeLog,
  summarize,
  type KeyValueStore,
} from "@/lib/log";

class MemoryStorage implements KeyValueStore {
  map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

describe("waste log", () => {
  it("summarizes a demo week without inventing factors for the blanks", () => {
    const entries = demoWeek();
    const summary = summarize(entries);
    expect(summary.count).toBe(5);
    expect(summary.landfillKg).toBe(0);
    expect(summary.divertedKg).toBeCloseTo(0.25 + 0.2 + 0.0149 + 0.18 + 0.023, 6);
    expect(summary.unestimatedDivertedKg).toBeCloseTo(0.2 + 0.18 + 0.023, 6);
    expect(summary.avoidedKgCo2e).toBeGreaterThan(0);
    expect(summary.addedKgCo2e).toBe(0);
    expect(summary.netKgCo2e).toBeLessThan(0);
    expect(milesEquivalent(summary.netKgCo2e)).toBeGreaterThan(0);

    const pizza = entries.find((entry) => entry.itemId === "pizza-box");
    expect(pizza?.deltaKg).toBeNull();
    const leftovers = entries.find((entry) => entry.itemId === "food-scraps");
    expect(leftovers?.deltaKg).toBeLessThan(0);
  });

  it("round-trips entries and ignores corrupt storage", () => {
    const storage = new MemoryStorage();
    const entry = buildEntry({
      id: "1",
      at: "2026-11-04T15:00:00.000Z",
      itemId: "aluminum-can",
      localityId: "sf",
      decision: "recycle",
      weightKg: 0.0149,
      method: "sample",
    });
    expect(entry).not.toBeNull();
    saveLog(storage, [entry!]);
    expect(loadLog(storage)).toEqual([entry]);
    storage.setItem("looktwice.log.v1", "{not json");
    expect(loadLog(storage)).toEqual([]);
    storage.setItem("looktwice.log.v1", JSON.stringify([{ id: "bad" }]));
    expect(loadLog(storage)).toEqual([]);
  });

  it("only restores a known city", () => {
    const storage = new MemoryStorage();
    expect(loadCity(storage)).toBeNull();
    saveCity(storage, "seattle");
    expect(loadCity(storage)).toBe("seattle");
    saveCity(storage, "paris");
    expect(loadCity(storage)).toBeNull();
  });

  it("exports an audit envelope", () => {
    const raw = serializeLog(demoWeek(), "2026-11-04T16:00:00.000Z");
    const parsed = JSON.parse(raw) as { app: string; factors: string; entries: unknown[] };
    expect(parsed.app).toBe("looktwice");
    expect(parsed.factors).toContain("WARM v16");
    expect(parsed.entries).toHaveLength(5);
  });
});
