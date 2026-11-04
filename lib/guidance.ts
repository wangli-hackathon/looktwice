import { getLocality } from "@/lib/localities";
import { climateFor, milesEquivalent, type ClimateResult } from "@/lib/impact";
import { getItem, type Item } from "@/lib/items";
import type { CityRule, Decision } from "@/lib/types";
import { DECISION_LABEL } from "@/lib/format";
import type { Locality } from "@/lib/localities";

export interface Presentation {
  item: Item;
  locality: Locality;
  rule: CityRule;
  decision: Decision;
  climate: ClimateResult;
  guidance: string;
  miles: number | null;
}

export function writeGuidance(input: {
  item: Item;
  locality: Locality;
  rule: CityRule;
  decision: Decision;
  climate: ClimateResult;
}): string {
  const place = `${input.item.name} in ${input.locality.city}.`;
  const reuse = input.item.reuse.summary;
  let action: string;
  if (input.decision === "reuse") {
    action = `Logging this as kept in use, not as ${DECISION_LABEL[input.rule.stream].toLowerCase()}. If it does have to leave, the ${input.locality.snapshot} snapshot says: ${input.rule.setout} ${input.rule.note}`;
  } else if (input.decision === input.rule.stream) {
    action = `The ${input.locality.snapshot} snapshot says: ${input.rule.setout} ${input.rule.note}`;
  } else {
    action = `Logging this as ${DECISION_LABEL[input.decision].toLowerCase()} even though the snapshot says ${DECISION_LABEL[input.rule.stream].toLowerCase()}. The snapshot still says: ${input.rule.setout}`;
  }
  const prep = input.item.prep.length ? `Before it leaves: ${input.item.prep.join(" ")}` : "";
  return [place, reuse, action, prep, input.climate.shortBasis].filter(Boolean).join(" ");
}

export function presentDecision(
  itemId: string,
  localityId: string,
  decision: Decision,
  weightKg: number,
): Presentation | null {
  const item = getItem(itemId);
  const locality = getLocality(localityId);
  if (!item || !locality) return null;
  const rule = item.rules[locality.id];
  const climate = climateFor(item, decision, weightKg);
  return {
    item,
    locality,
    rule,
    decision,
    climate,
    guidance: writeGuidance({ item, locality, rule, decision, climate }),
    miles: milesEquivalent(climate.deltaKg),
  };
}

export const ENHANCE_SYSTEM = [
  "You rewrite waste-sorting guidance for a resident.",
  "Do not assign a different stream.",
  "The stream has already been decided by a rule table.",
  "Do not invent facilities, prices, fines, or emission numbers.",
  "Do not claim a climate benefit when the draft says the factor is unavailable.",
  "Keep it under 120 words.",
  "Plain sentences.",
  "No bullet characters.",
].join(" ");

const DECISION_VALUES: Decision[] = ["reuse", "recycle", "compost", "landfill", "special"];

export interface EnhanceInput {
  itemId: string;
  localityId: string;
  decision: Decision;
  weightKg: number;
}

export function parseEnhanceInput(body: unknown): { ok: true; value: EnhanceInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Expected a JSON object." };
  const record = body as Record<string, unknown>;
  const itemId = record.itemId;
  const localityId = record.localityId;
  const decision = record.decision;
  const weightKg = record.weightKg;
  if (typeof itemId !== "string" || !getItem(itemId)) {
    return { ok: false, error: "Unknown item." };
  }
  if (typeof localityId !== "string" || !getLocality(localityId)) {
    return { ok: false, error: "Unknown city." };
  }
  if (typeof decision !== "string" || !DECISION_VALUES.includes(decision as Decision)) {
    return { ok: false, error: "Unknown decision." };
  }
  if (typeof weightKg !== "number" || !Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 50) {
    return { ok: false, error: "Weight must be a number of kilograms between 0 and 50." };
  }
  return {
    ok: true,
    value: { itemId, localityId, decision: decision as Decision, weightKg },
  };
}

export function buildEnhanceMessages(presentation: Presentation): {
  system: string;
  user: string;
} {
  const user = [
    `City: ${presentation.locality.city}`,
    `Item: ${presentation.item.name}`,
    `Assigned stream if it leaves: ${presentation.rule.stream}`,
    `Setout: ${presentation.rule.setout}`,
    `Decision the resident is logging: ${presentation.decision}`,
    `Draft, which you may rewrite but must not contradict:`,
    presentation.guidance,
  ].join("\n");
  return { system: ENHANCE_SYSTEM, user };
}

export interface EnhanceOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

export interface EnhanceResponse {
  enhanced: boolean;
  guidance: string;
  stream: Presentation["rule"]["stream"];
  decision: Decision;
  notice?: string;
}

export async function enhanceGuidance(
  input: EnhanceInput,
  options: EnhanceOptions = {},
): Promise<EnhanceResponse> {
  const presentation = presentDecision(
    input.itemId,
    input.localityId,
    input.decision,
    input.weightKg,
  );
  if (!presentation) {
    return {
      enhanced: false,
      guidance: "That item or city is not in the snapshot.",
      stream: "landfill",
      decision: input.decision,
      notice: "unknown",
    };
  }

  const local = presentation.guidance;
  const key = options.apiKey?.trim();
  if (!key) {
    return {
      enhanced: false,
      guidance: local,
      stream: presentation.rule.stream,
      decision: input.decision,
      notice: "no_key",
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const base = (options.baseUrl?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = options.model?.trim() || "gpt-4o-mini";
  const messages = buildEnhanceMessages(presentation);

  try {
    const response = await fetchImpl(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 280,
        messages: [
          { role: "system", content: messages.system },
          { role: "user", content: messages.user },
        ],
      }),
    });
    if (!response.ok) {
      return {
        enhanced: false,
        guidance: local,
        stream: presentation.rule.stream,
        decision: input.decision,
        notice: "model_error",
      };
    }
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return {
        enhanced: false,
        guidance: local,
        stream: presentation.rule.stream,
        decision: input.decision,
        notice: "empty_model",
      };
    }
    return {
      enhanced: true,
      guidance: text,
      stream: presentation.rule.stream,
      decision: input.decision,
    };
  } catch {
    return {
      enhanced: false,
      guidance: local,
      stream: presentation.rule.stream,
      decision: input.decision,
      notice: "model_error",
    };
  }
}
