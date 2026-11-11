/**
 * Battery fire check — built during SafeSpace Hacks (Oct 17 – Nov 22, 2026).
 *
 * The gate runs before any bin rule. For an item that might hide a battery,
 * "Yes" and "Unsure" both resolve to a drop-off; only an explicit "No" lets
 * the ordinary rule through. Items with a built-in battery ignore "No".
 */
import { batteryRule } from "@/lib/battery-items";
import type { Item } from "@/lib/items";
import type { CityRule, Decision, LocalityId } from "@/lib/types";

export type BatteryAnswer = "yes" | "no" | "unsure";
export type BatteryCondition = "normal" | "swollen" | "fire";

export const BATTERY_ANSWERS: { value: BatteryAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "unsure", label: "Not sure" },
  { value: "no", label: "No battery" },
];

export const BATTERY_CONDITIONS: { value: BatteryCondition; label: string }[] = [
  { value: "normal", label: "Looks normal" },
  { value: "swollen", label: "It’s swollen or hot" },
  { value: "fire", label: "Smoking or on fire" },
];

export const SAFESPACE_LABEL = "New · built during SafeSpace Hacks, Nov 2026";

export interface GateResult {
  /** The rule that the result card should show. */
  rule: CityRule;
  /** True when the object is treated as carrying a battery. */
  hasBattery: boolean;
  /** True when the gate replaced the item's ordinary rule. */
  overridden: boolean;
  /** Why the gate decided what it did, in plain words. */
  reason: string;
}

export function isBatteryCandidate(item: Item | undefined | null): boolean {
  return Boolean(item?.battery);
}

/** Default answer before the user touches the gate: built-in → yes, maybe → unsure. */
export function defaultAnswer(item: Item): BatteryAnswer | null {
  if (item.battery === "built-in") return "yes";
  if (item.battery === "maybe") return "unsure";
  return null;
}

export function defaultCondition(item: Item): BatteryCondition {
  return item.id === "swollen-battery" ? "swollen" : "normal";
}

export function resolveGate(
  item: Item,
  localityId: LocalityId,
  answer: BatteryAnswer | null | undefined,
): GateResult {
  const ordinary = item.rules[localityId];
  if (!item.battery) {
    return { rule: ordinary, hasBattery: false, overridden: false, reason: "" };
  }
  if (item.battery === "built-in") {
    return {
      rule: ordinary.stream === "special" ? ordinary : batteryRule(localityId),
      hasBattery: true,
      overridden: ordinary.stream !== "special",
      reason: "This object always has a battery inside, so it never goes in a cart.",
    };
  }
  const effective = answer ?? "unsure";
  if (effective === "no") {
    return {
      rule: ordinary,
      hasBattery: false,
      overridden: false,
      reason: "You said there is no battery, so the ordinary rule applies.",
    };
  }
  return {
    rule: batteryRule(localityId),
    hasBattery: true,
    overridden: ordinary.stream !== "special" || ordinary.setout !== batteryRule(localityId).setout,
    reason:
      effective === "yes"
        ? "You said it has a battery. That overrides every other rule."
        : "Not sure counts as yes. If you can’t check, treat it as a battery.",
  };
}

/** A decision that puts a battery-bearing object in a cart. */
export function isCartDecision(decision: Decision): boolean {
  return decision === "landfill" || decision === "recycle" || decision === "compost";
}

export interface SourceLink {
  label: string;
  url: string;
}

export const BATTERY_SOURCES: SourceLink[] = [
  {
    label: "EPA — Used Lithium-Ion Batteries",
    url: "https://www.epa.gov/recycle/used-lithium-ion-batteries",
  },
  {
    label: "EPA — An Analysis of Lithium-ion Battery Fires in Waste Management and Recycling (EPA 530-R-21-002, July 2021)",
    url: "https://www.epa.gov/system/files/documents/2021-08/lithium-ion-battery-report-update-7.01_508.pdf",
  },
  {
    label: "NYC311 — Lithium-Ion Battery Safety (FDNY guidance)",
    url: "https://portal.311.nyc.gov/article/?kanumber=KA-03565",
  },
];

/**
 * The stop-handling card. Static text. Every line restates published guidance:
 * NYC311/FDNY for warning signs, EPA for damaged-battery handling.
 */
export interface StopCard {
  title: string;
  lead: string;
  steps: string[];
  emergency: string;
  localLine: string;
  limit: string;
}

export function stopCard(condition: BatteryCondition, localityId: LocalityId): StopCard | null {
  if (condition === "normal") return null;
  const emergency =
    "If it is smoking or on fire, get away from it and call 911 (or your local emergency number). Do not try to put it in a bin.";
  const localLine =
    localityId === "nyc"
      ? "FDNY, through NYC311, tells New Yorkers to call 911 for a lithium-ion battery that is changing shape or color, leaking, or giving off an odor or odd noises."
      : "FDNY’s guidance for New York is to call 911 for a battery that is changing shape or color, leaking, or giving off an odor or odd noises. Elsewhere, if it is not smoking, call your fire department’s non-emergency line or your household hazardous waste program and ask what to do.";
  if (condition === "fire") {
    return {
      title: "Call 911 now.",
      lead: "A battery that is smoking or burning is an emergency, not a sorting question.",
      steps: ["Get away from it.", "Call 911 or your local emergency number."],
      emergency,
      localLine,
      limit: "Looktwice is not an emergency service. This card is static text.",
    };
  }
  return {
    title: "Stop handling it.",
    lead: "A swollen or hot lithium battery is a damaged battery.",
    steps: [
      "Stop using it and stop charging it.",
      "If it is safe to do so, move it away from anything that can catch fire.",
      "Do not put it in any cart, and do not press on it or try to flatten it.",
      "Ask the battery or device maker for handling instructions before it goes to a drop-off.",
    ],
    emergency,
    localLine,
    limit: "Looktwice is not an emergency service. This card is static text, restated from FDNY/NYC311 and EPA.",
  };
}
