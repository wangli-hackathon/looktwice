import {
  deltaKgPerKg,
  getWarmRow,
  KG_CO2E_PER_VEHICLE_MILE,
  type WarmRow,
} from "@/lib/factors";
import type { Decision } from "@/lib/types";

export type ClimateColumn =
  | "source-reduction"
  | "recycling"
  | "composting"
  | "landfill-baseline"
  | "unavailable";

export interface ClimateSubject {
  materialId: string;
  reuseColumn: "source-reduction" | "none";
  specialColumn: "recycling" | "none";
  climateCaveat?: string;
}

export interface ClimateResult {
  /** kg CO2e for this decision minus landfilling, at the given weight. Negative avoids emissions. */
  deltaKg: number | null;
  /** Same difference per kilogram of material. */
  perKg: number | null;
  factorId: string | null;
  column: ClimateColumn;
  shortBasis: string;
  basis: string;
}

function columnValue(
  row: WarmRow,
  column: Exclude<ClimateColumn, "landfill-baseline" | "unavailable">,
): number | null {
  if (column === "source-reduction") return row.sourceReduction;
  if (column === "recycling") return row.recycling;
  return row.composting;
}

function columnLabel(column: ClimateColumn): string {
  if (column === "source-reduction") return "source reduction (current mix)";
  if (column === "recycling") return "recycling";
  if (column === "composting") return "composting";
  if (column === "landfill-baseline") return "landfilling";
  return "no factor";
}

function unavailableShort(row: WarmRow, decision: Decision): string {
  if (row.id === "corrugated" && decision === "compost") {
    return "Not estimated. WARM v16 lists composting of corrugated containers as NA. The food-waste compost factor is not borrowed for a cardboard box.";
  }
  if (row.id === "mixed-paper" && decision === "compost") {
    return "Not estimated. WARM v16 has no composting factor for mixed paper. Soiled paper still counts as kilograms diverted when a city composts it.";
  }
  if (row.id === "ldpe") {
    return "Not estimated. WARM v16 has no recycling factor for LDPE film. The rigid HDPE recycling factor is a different product and is not used for bags or wrap.";
  }
  if (row.id === "ps") {
    return "Not estimated. WARM v16 has no recycling factor for polystyrene foam.";
  }
  if (row.id === "yard" && decision === "reuse") {
    return "Not estimated. WARM v16 has no source-reduction factor for yard trimmings.";
  }
  return `Not estimated. WARM v16 “${row.warmName}” has no ${decision} factor for this path.`;
}

function wantedColumn(
  subject: ClimateSubject,
  decision: Decision,
): Exclude<ClimateColumn, "unavailable"> | "none" {
  if (decision === "landfill") return "landfill-baseline";
  if (decision === "reuse") {
    return subject.reuseColumn === "source-reduction" ? "source-reduction" : "none";
  }
  if (decision === "compost") return "composting";
  if (decision === "recycle") return "recycling";
  return subject.specialColumn === "recycling" ? "recycling" : "none";
}

export function climateFor(
  subject: ClimateSubject,
  decision: Decision,
  weightKg: number,
): ClimateResult {
  const row = subject.materialId === "none" ? undefined : getWarmRow(subject.materialId);
  if (!row || row.landfilling === null) {
    const short =
      subject.climateCaveat ??
      "Not estimated. This material is not a WARM v16 row, and no proxy is used.";
    return {
      deltaKg: null,
      perKg: null,
      factorId: null,
      column: "unavailable",
      shortBasis: short,
      basis: short,
    };
  }

  const wanted = wantedColumn(subject, decision);
  if (wanted === "none") {
    const short =
      subject.climateCaveat ??
      unavailableShort(row, decision);
    return {
      deltaKg: null,
      perKg: null,
      factorId: row.id,
      column: "unavailable",
      shortBasis: short,
      basis: `${short} ${row.caveat ?? ""}`.trim(),
    };
  }

  if (wanted === "landfill-baseline") {
    const short =
      "Landfill is the baseline, so the relative CO2e is zero. Other paths are measured against this material’s WARM landfilling factor.";
    return {
      deltaKg: 0,
      perKg: 0,
      factorId: row.id,
      column: "landfill-baseline",
      shortBasis: short,
      basis: `${short} ${row.warmName} landfilling factor: ${row.landfilling} MTCO2e per short ton.`,
    };
  }

  const alternative = columnValue(row, wanted);
  if (alternative === null) {
    const short = unavailableShort(row, decision);
    return {
      deltaKg: null,
      perKg: null,
      factorId: row.id,
      column: "unavailable",
      shortBasis: short,
      basis: `${short} ${row.caveat ?? ""}`.trim(),
    };
  }

  const perKg = deltaKgPerKg(alternative, row.landfilling);
  const deltaKg = perKg * weightKg;
  const diff = alternative - row.landfilling;
  const caveat = [subject.climateCaveat, row.caveat].filter(Boolean).join(" ");
  const short = `WARM v16 ${row.warmName}: ${columnLabel(wanted)} (${alternative}) minus landfilling (${row.landfilling}) = ${round(diff)} MTCO2e per short ton.`;
  const basis = `${short} Converted with 1 short ton = 907.18474 kg, then multiplied by ${weightKg} kg. ${caveat}`.trim();

  return {
    deltaKg,
    perKg,
    factorId: row.id,
    column: wanted,
    shortBasis: caveat ? `${short} ${caveat}` : short,
    basis,
  };
}

function round(value: number): string {
  return value.toFixed(2);
}

export function milesEquivalent(deltaKg: number | null): number | null {
  if (deltaKg === null || deltaKg >= 0) return null;
  return Math.abs(deltaKg) / KG_CO2E_PER_VEHICLE_MILE;
}

export function compareDecisions(
  subject: ClimateSubject,
  weightKg: number,
  decisions: Decision[],
): { decision: Decision; climate: ClimateResult }[] {
  return decisions.map((decision) => ({
    decision,
    climate: climateFor(subject, decision, weightKg),
  }));
}
