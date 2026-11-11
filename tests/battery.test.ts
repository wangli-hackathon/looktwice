import { describe, expect, it } from "vitest";
import {
  defaultAnswer,
  defaultCondition,
  isCartDecision,
  resolveGate,
  stopCard,
  type BatteryAnswer,
} from "@/lib/battery";
import { batteryHint, classify } from "@/lib/classify";
import { enhanceGuidance, presentDecision } from "@/lib/guidance";
import { BATTERY_SAMPLE_IDS, getItem, items, requireItem } from "@/lib/items";
import { buildEntry, isLogEntry, summarize } from "@/lib/log";
import { LOCALITY_IDS } from "@/lib/localities";

const batteryItems = items.filter((item) => item.battery);
const ANSWERS: (BatteryAnswer | null)[] = ["yes", "unsure", null, "no"];

describe("battery fire check: catalog", () => {
  it("adds the six SafeSpace items and tags the existing battery carriers", () => {
    for (const id of [
      "power-bank",
      "disposable-vape",
      "wireless-earbuds",
      "e-cigarette",
      "light-up-toy",
      "swollen-battery",
    ]) {
      expect(getItem(id)?.battery, id).toBe("built-in");
    }
    expect(requireItem("phone").battery).toBe("built-in");
    expect(requireItem("lithium-battery").battery).toBe("built-in");
    expect(requireItem("light-up-shoes").battery).toBe("maybe");
    expect(requireItem("musical-greeting-card").battery).toBe("maybe");
    for (const id of BATTERY_SAMPLE_IDS) expect(getItem(id), id).toBeDefined();
  });

  it("keeps item ids unique after the merge", () => {
    const ids = items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every built-in battery item a drop-off rule in every locality", () => {
    for (const item of batteryItems.filter((row) => row.battery === "built-in")) {
      for (const locality of LOCALITY_IDS) {
        expect(item.rules[locality].stream, `${item.id} @ ${locality}`).toBe("special");
      }
    }
  });

  it("tells people to tape or bag the cell for every new built-in item", () => {
    for (const id of ["power-bank", "wireless-earbuds", "battery-gadget"]) {
      expect(requireItem(id).prep.join(" ")).toMatch(/tape|bag/i);
    }
  });
});

describe("battery fire check: the gate", () => {
  it("never resolves a battery-bearing item to trash, recycling, or compost", () => {
    for (const item of batteryItems) {
      for (const locality of LOCALITY_IDS) {
        for (const answer of ANSWERS) {
          const gate = resolveGate(item, locality, answer);
          if (!gate.hasBattery) continue;
          expect(gate.rule.stream, `${item.id} @ ${locality} (${answer})`).toBe("special");
          expect(isCartDecision(gate.rule.stream)).toBe(false);
        }
      }
    }
  });

  it("treats unsure and unanswered as a battery", () => {
    const card = requireItem("musical-greeting-card");
    for (const locality of LOCALITY_IDS) {
      expect(resolveGate(card, locality, "unsure").hasBattery).toBe(true);
      expect(resolveGate(card, locality, null).hasBattery).toBe(true);
      expect(resolveGate(card, locality, "unsure").rule.stream).toBe("special");
    }
    expect(defaultAnswer(card)).toBe("unsure");
  });

  it("lets only an explicit No restore the ordinary rule", () => {
    const card = requireItem("musical-greeting-card");
    const gate = resolveGate(card, "seattle", "no");
    expect(gate.hasBattery).toBe(false);
    expect(gate.rule.stream).toBe("recycle");
    const yes = resolveGate(card, "seattle", "yes");
    expect(yes.overridden).toBe(true);
    expect(yes.rule.stream).toBe("special");
  });

  it("ignores No for built-in batteries", () => {
    for (const id of ["power-bank", "disposable-vape", "phone"]) {
      const gate = resolveGate(requireItem(id), "nyc", "no");
      expect(gate.hasBattery, id).toBe(true);
      expect(gate.rule.stream, id).toBe("special");
    }
  });

  it("feeds the gate into the written guidance", () => {
    const yes = presentDecision("musical-greeting-card", "seattle", "special", 0.06, "unsure");
    expect(yes?.rule.stream).toBe("special");
    expect(yes?.guidance).toMatch(/drop-off/i);
    const no = presentDecision("musical-greeting-card", "seattle", "recycle", 0.02, "no");
    expect(no?.rule.stream).toBe("recycle");
  });
});

describe("battery fire check: swollen path", () => {
  it("opens the swollen sample on the stop-handling card", () => {
    expect(defaultCondition(requireItem("swollen-battery"))).toBe("swollen");
    expect(defaultCondition(requireItem("power-bank"))).toBe("normal");
  });

  it("shows no card for a normal battery and a stop card otherwise", () => {
    expect(stopCard("normal", "sf")).toBeNull();
    const swollen = stopCard("swollen", "sf");
    expect(swollen?.title).toBe("Stop handling it.");
    expect(swollen?.steps.join(" ")).toMatch(/away from anything that can catch fire/);
    expect(swollen?.emergency).toMatch(/911/);
    expect(stopCard("fire", "austin")?.title).toMatch(/911/);
  });

  it("uses the FDNY line in New York and a non-emergency line elsewhere", () => {
    expect(stopCard("swollen", "nyc")?.localLine).toMatch(/call 911/);
    expect(stopCard("swollen", "seattle")?.localLine).toMatch(/non-emergency/);
  });
});

describe("battery fire check: classifier", () => {
  it("routes typed hidden-battery objects to the battery items", () => {
    expect(classify({ query: "disposable vape" }).itemId).toBe("disposable-vape");
    expect(classify({ query: "light-up sneakers" }).itemId).toBe("light-up-shoes");
    expect(classify({ query: "power bank" }).itemId).toBe("power-bank");
    expect(classify({ query: "airpods" }).itemId).toBe("wireless-earbuds");
    expect(classify({ query: "swollen battery" }).itemId).toBe("swollen-battery");
  });

  it("treats battery words as a battery instead of trusting a cart match", () => {
    expect(batteryHint("rechargeable bike light")).toBe("rechargeable");
    expect(batteryHint("pizza box")).toBeNull();
    const result = classify({ query: "wireless mouse" });
    expect(result.itemId).toBe("battery-gadget");
    expect(result.notes[0]).toMatch(/wireless/);
    const shirt = classify({ query: "light up shirt" });
    expect(getItem(shirt.itemId ?? "")?.battery).toBeTruthy();
  });

  it("leaves non-battery objects alone", () => {
    expect(classify({ query: "pizza box" }).itemId).toBe("pizza-box");
    expect(classify({ query: "alkaline battery" }).itemId).toBe("alkaline-battery");
  });
});

describe("battery fire check: log counter", () => {
  function entry(itemId: string, decision: "special" | "landfill" | "reuse", battery?: boolean) {
    const built = buildEntry({
      id: `${itemId}-${decision}`,
      at: "2026-11-12T00:00:00.000Z",
      itemId,
      localityId: "seattle",
      decision,
      weightKg: 0.05,
      method: "sample",
      battery,
    });
    if (!built) throw new Error("entry failed");
    return built;
  }

  it("counts batteries kept out of carts separately from kilograms", () => {
    const entries = [
      entry("power-bank", "special"),
      entry("musical-greeting-card", "special", true),
      entry("wireless-earbuds", "reuse"),
      entry("disposable-vape", "landfill"),
      entry("pizza-box", "special"),
    ];
    const summary = summarize(entries);
    expect(summary.batteriesKeptOut).toBe(3);
    expect(summary.batteriesInCarts).toBe(1);
    expect(entries[0]?.deltaKg).toBeNull();
    expect(entries.every(isLogEntry)).toBe(true);
  });

  it("does not flag a card the user said has no battery", () => {
    const plain = entry("musical-greeting-card", "special", false);
    expect(plain.battery).toBeUndefined();
    expect(summarize([plain]).batteriesKeptOut).toBe(0);
  });

  it("rejects a stored entry with a malformed battery flag", () => {
    const bad = { ...entry("power-bank", "special"), battery: "yes" };
    expect(isLogEntry(bad)).toBe(false);
  });
});

describe("battery fire check: no model rewrite", () => {
  it("returns rule text for a battery item even with an API key", async () => {
    let called = false;
    const result = await enhanceGuidance(
      { itemId: "power-bank", localityId: "sf", decision: "special", weightKg: 0.2 },
      {
        apiKey: "test-key",
        fetchImpl: (async () => {
          called = true;
          return new Response("{}");
        }) as typeof fetch,
      },
    );
    expect(called).toBe(false);
    expect(result.enhanced).toBe(false);
    expect(result.notice).toBe("battery_rules_only");
    expect(result.stream).toBe("special");
  });
});
