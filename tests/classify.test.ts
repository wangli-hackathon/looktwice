import { describe, expect, it } from "vitest";
import {
  classify,
  itemIdForVisionLabel,
  needsConfirmation,
  searchItems,
  summarizeRgba,
} from "@/lib/classify";

function solid(r: number, g: number, b: number, count = 32): Uint8ClampedArray {
  const data = new Uint8ClampedArray(count * 4);
  for (let i = 0; i < count; i += 1) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return data;
}

describe("classifier cascade", () => {
  it("trusts a sample tray id", () => {
    const result = classify({ sampleItemId: "pizza-box" });
    expect(result.method).toBe("sample");
    expect(result.itemId).toBe("pizza-box");
    expect(needsConfirmation(result)).toBe(false);
  });

  it("reads a greasy pizza box from the file name", () => {
    const result = classify({ filename: "greasy-pizza-box.JPG" });
    expect(result.method).toBe("filename");
    expect(result.itemId).toBe("pizza-box");
    expect(needsConfirmation(result)).toBe(false);
  });

  it("does not invent a match for a camera filename", () => {
    const result = classify({ filename: "IMG_1234.jpg" });
    expect(result.method).toBe("unknown");
    expect(result.itemId).toBeNull();
  });

  it("maps ImageNet labels onto waste items", () => {
    expect(itemIdForVisionLabel("banana")).toBe("produce");
    expect(itemIdForVisionLabel("cellular_telephone")).toBe("phone");
    expect(itemIdForVisionLabel("Pizza")).toBe("food-scraps");
    expect(itemIdForVisionLabel("notebook, notebook computer")).toBe("phone");
    const result = classify({
      vision: [
        { label: "banana", probability: 0.62 },
        { label: "orange", probability: 0.1 },
      ],
    });
    expect(result.method).toBe("vision");
    expect(result.itemId).toBe("produce");
    expect(needsConfirmation(result)).toBe(true);
  });

  it("turns a green photo into produce and asks for confirmation", () => {
    const pixels = summarizeRgba(solid(40, 160, 40));
    expect(pixels.leafy).toBeGreaterThan(0.9);
    const result = classify({ pixels });
    expect(result.method).toBe("heuristic");
    expect(result.itemId).toBe("produce");
    expect(result.alternates.some((alt) => alt.itemId === "yard-trimmings")).toBe(true);
    expect(needsConfirmation(result)).toBe(true);
    expect(result.confidence).toBeLessThanOrEqual(0.55);
  });

  it("tells aluminum from a gray photo and cardboard from brown", () => {
    expect(classify({ pixels: summarizeRgba(solid(170, 170, 175)) }).itemId).toBe("aluminum-can");
    const brown = classify({ pixels: summarizeRgba(solid(180, 140, 70)) });
    expect(brown.itemId).toBe("cardboard-box");
    expect(brown.alternates.some((alt) => alt.itemId === "pizza-box")).toBe(true);
  });

  it("prefers an exact battery alias and still offers lithium", () => {
    const hits = searchItems("battery", 4);
    expect(hits[0]?.itemId).toBe("alkaline-battery");
    expect(hits.some((hit) => hit.itemId === "lithium-battery")).toBe(true);
    const lithium = classify({ query: "lithium battery" });
    expect(lithium.itemId).toBe("lithium-battery");
  });

  it("lets a chosen search hit outrank a filename", () => {
    const result = classify({
      selectedItemId: "ceramic",
      filename: "pizza-box.jpg",
    });
    expect(result.itemId).toBe("ceramic");
    expect(result.method).toBe("search");
  });
});
