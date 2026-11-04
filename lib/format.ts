import type { Decision, Stream } from "@/lib/types";

export const DECISION_LABEL: Record<Decision, string> = {
  reuse: "Reuse",
  recycle: "Recycle",
  compost: "Compost",
  landfill: "Landfill",
  special: "Drop-off",
};

export const STREAM_LABEL: Record<Stream, string> = {
  recycle: "Recycle",
  compost: "Compost",
  landfill: "Landfill",
  special: "Drop-off",
};

export function formatMassKg(kg: number): string {
  if (!Number.isFinite(kg)) return "—";
  if (Math.abs(kg) >= 1) return `${kg.toFixed(2)} kg`;
  const grams = kg * 1000;
  if (Math.abs(grams) >= 10) return `${grams.toFixed(0)} g`;
  return `${grams.toFixed(1)} g`;
}

export function formatCo2eMagnitude(kg: number): string {
  const abs = Math.abs(kg);
  if (abs >= 0.1) return abs.toFixed(2);
  if (abs >= 0.001) return abs.toFixed(3);
  return abs.toFixed(4);
}

export type DeltaTone = "avoided" | "added" | "baseline" | "unknown";

export function formatDelta(deltaKg: number | null): { tone: DeltaTone; text: string } {
  if (deltaKg === null || Number.isNaN(deltaKg)) {
    return { tone: "unknown", text: "Not estimated" };
  }
  if (Math.abs(deltaKg) < 0.0005) {
    return { tone: "baseline", text: "0 — landfill baseline" };
  }
  if (deltaKg < 0) {
    return {
      tone: "avoided",
      text: `${formatCo2eMagnitude(deltaKg)} kg CO2e avoided`,
    };
  }
  return {
    tone: "added",
    text: `${formatCo2eMagnitude(deltaKg)} kg CO2e added vs landfill`,
  };
}

export function formatMiles(miles: number): string {
  if (miles < 0.1) return `${miles.toFixed(3)} miles`;
  if (miles < 10) return `${miles.toFixed(2)} miles`;
  return `${miles.toFixed(1)} miles`;
}
