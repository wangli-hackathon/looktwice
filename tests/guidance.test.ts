import { describe, expect, it, vi } from "vitest";
import {
  ENHANCE_SYSTEM,
  buildEnhanceMessages,
  enhanceGuidance,
  parseEnhanceInput,
  presentDecision,
} from "@/lib/guidance";

describe("guidance", () => {
  it("writes a pizza-box paragraph that keeps the green cart and the blank factor", () => {
    const presentation = presentDecision("pizza-box", "sf", "compost", 0.2);
    expect(presentation).not.toBeNull();
    expect(presentation!.rule.stream).toBe("compost");
    expect(presentation!.guidance.toLowerCase()).toContain("green compost cart");
    expect(presentation!.guidance.toLowerCase()).toMatch(/not borrowed|na|not estimated/);
    expect(presentation!.climate.deltaKg).toBeNull();
  });

  it("builds a prompt that forbids a different stream", () => {
    const presentation = presentDecision("coffee-cup", "seattle", "landfill", 0.015)!;
    const messages = buildEnhanceMessages(presentation);
    expect(messages.system).toBe(ENHANCE_SYSTEM);
    expect(messages.system).toMatch(/Do not assign a different stream/);
    expect(messages.user).toContain("Seattle");
    expect(messages.user).toContain("landfill");
  });

  it("does not call the network when no key is set", async () => {
    const fetchImpl = vi.fn();
    const result = await enhanceGuidance(
      { itemId: "pizza-box", localityId: "sf", decision: "compost", weightKg: 0.2 },
      { fetchImpl },
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.enhanced).toBe(false);
    expect(result.notice).toBe("no_key");
    expect(result.stream).toBe("compost");
    expect(result.guidance.toLowerCase()).toContain("green compost cart");
  });

  it("uses model wording and still returns the rule-table stream", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!input || !init) throw new Error("The model request was incomplete.");
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "Empty it and use the green cart." } }],
        }),
        { status: 200 },
      );
    });
    const result = await enhanceGuidance(
      { itemId: "pizza-box", localityId: "sf", decision: "compost", weightKg: 0.2 },
      { apiKey: "test-key", fetchImpl },
    );
    expect(result.enhanced).toBe(true);
    expect(result.guidance).toBe("Empty it and use the green cart.");
    expect(result.stream).toBe("compost");
    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(body.messages[0].content).toMatch(/Do not assign a different stream/);
  });

  it("falls back when the model request fails", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 503 }));
    const result = await enhanceGuidance(
      { itemId: "aluminum-can", localityId: "nyc", decision: "recycle", weightKg: 0.0149 },
      { apiKey: "test-key", fetchImpl },
    );
    expect(result.enhanced).toBe(false);
    expect(result.notice).toBe("model_error");
    expect(result.stream).toBe("recycle");
    expect(result.guidance).toContain("New York City");
  });

  it("rejects a bad enhance payload", () => {
    expect(parseEnhanceInput({ itemId: "nope" }).ok).toBe(false);
    expect(
      parseEnhanceInput({
        itemId: "pizza-box",
        localityId: "sf",
        decision: "compost",
        weightKg: 0,
      }).ok,
    ).toBe(false);
    expect(
      parseEnhanceInput({
        itemId: "pizza-box",
        localityId: "sf",
        decision: "compost",
        weightKg: 0.2,
      }).ok,
    ).toBe(true);
  });
});
