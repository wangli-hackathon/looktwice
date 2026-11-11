import { isCartDecision } from "@/lib/battery";
import { climateFor } from "@/lib/impact";
import { getItem } from "@/lib/items";
import { getLocality } from "@/lib/localities";
import type { Decision } from "@/lib/types";

export const LOG_KEY = "looktwice.log.v1";
export const CITY_KEY = "looktwice.city.v1";

export interface LogEntry {
  id: string;
  at: string;
  itemId: string;
  itemName: string;
  localityId: string;
  localityName: string;
  decision: Decision;
  weightKg: number;
  deltaKg: number | null;
  factorId: string | null;
  column: string;
  shortBasis: string;
  method: string;
  /** Battery fire check: true when the object was treated as carrying a battery. */
  battery?: boolean;
}

export interface LogSummary {
  count: number;
  divertedKg: number;
  landfillKg: number;
  avoidedKgCo2e: number;
  addedKgCo2e: number;
  netKgCo2e: number;
  unestimatedDivertedKg: number;
  unestimatedLandfillKg: number;
  byDecision: Record<Decision, { count: number; kg: number }>;
  /** Battery-bearing objects that went to a drop-off or stayed in use. */
  batteriesKeptOut: number;
  /** Battery-bearing objects that were logged into a cart anyway. */
  batteriesInCarts: number;
}

const DECISIONS: Decision[] = ["reuse", "recycle", "compost", "landfill", "special"];

function emptyByDecision(): LogSummary["byDecision"] {
  return {
    reuse: { count: 0, kg: 0 },
    recycle: { count: 0, kg: 0 },
    compost: { count: 0, kg: 0 },
    landfill: { count: 0, kg: 0 },
    special: { count: 0, kg: 0 },
  };
}

export function buildEntry(input: {
  id: string;
  at: string;
  itemId: string;
  localityId: string;
  decision: Decision;
  weightKg: number;
  method: string;
  battery?: boolean;
}): LogEntry | null {
  const item = getItem(input.itemId);
  const locality = getLocality(input.localityId);
  if (!item || !locality) return null;
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) return null;
  const climate = climateFor(item, input.decision, input.weightKg);
  const battery = input.battery ?? item.battery === "built-in";
  return {
    id: input.id,
    at: input.at,
    itemId: item.id,
    itemName: item.name,
    localityId: locality.id,
    localityName: locality.city,
    decision: input.decision,
    weightKg: input.weightKg,
    deltaKg: climate.deltaKg,
    factorId: climate.factorId,
    column: climate.column,
    shortBasis: climate.shortBasis,
    method: input.method,
    ...(battery ? { battery: true } : {}),
  };
}

export function summarize(entries: LogEntry[]): LogSummary {
  const summary: LogSummary = {
    count: entries.length,
    divertedKg: 0,
    landfillKg: 0,
    avoidedKgCo2e: 0,
    addedKgCo2e: 0,
    netKgCo2e: 0,
    unestimatedDivertedKg: 0,
    unestimatedLandfillKg: 0,
    byDecision: emptyByDecision(),
    batteriesKeptOut: 0,
    batteriesInCarts: 0,
  };

  for (const entry of entries) {
    if (entry.battery) {
      if (isCartDecision(entry.decision)) summary.batteriesInCarts += 1;
      else summary.batteriesKeptOut += 1;
    }
    const bucket = summary.byDecision[entry.decision];
    bucket.count += 1;
    bucket.kg += entry.weightKg;
    if (entry.decision === "landfill") summary.landfillKg += entry.weightKg;
    else summary.divertedKg += entry.weightKg;

    if (entry.deltaKg === null) {
      if (entry.decision === "landfill") summary.unestimatedLandfillKg += entry.weightKg;
      else summary.unestimatedDivertedKg += entry.weightKg;
      continue;
    }
    summary.netKgCo2e += entry.deltaKg;
    if (entry.deltaKg < 0) summary.avoidedKgCo2e += -entry.deltaKg;
    else if (entry.deltaKg > 0) summary.addedKgCo2e += entry.deltaKg;
  }

  return summary;
}

export function demoWeek(at = "2026-11-04T15:00:00.000Z"): LogEntry[] {
  const specs: {
    id: string;
    itemId: string;
    localityId: string;
    decision: Decision;
    weightKg: number;
    method: string;
  }[] = [
    {
      id: "demo-leftovers",
      itemId: "food-scraps",
      localityId: "sf",
      decision: "reuse",
      weightKg: 0.25,
      method: "sample",
    },
    {
      id: "demo-pizza",
      itemId: "pizza-box",
      localityId: "sf",
      decision: "compost",
      weightKg: 0.2,
      method: "sample",
    },
    {
      id: "demo-can",
      itemId: "aluminum-can",
      localityId: "sf",
      decision: "recycle",
      weightKg: 0.0149,
      method: "sample",
    },
    {
      id: "demo-shirt",
      itemId: "textile",
      localityId: "seattle",
      decision: "reuse",
      weightKg: 0.18,
      method: "sample",
    },
    {
      id: "demo-battery",
      itemId: "alkaline-battery",
      localityId: "seattle",
      decision: "special",
      weightKg: 0.023,
      method: "sample",
    },
  ];

  return specs.map((spec, index) => {
    const entry = buildEntry({ ...spec, at });
    if (!entry) {
      throw new Error(`Demo entry ${index} failed to build.`);
    }
    return entry;
  });
}

export function serializeLog(entries: LogEntry[], exportedAt: string): string {
  return JSON.stringify(
    {
      app: "looktwice",
      exportedAt,
      factors: "EPA WARM v16",
      note: "deltaKg is negative when the path avoids emissions relative to landfilling. Null means no factor was applied.",
      entries,
    },
    null,
    2,
  );
}

function isDecision(value: unknown): value is Decision {
  return typeof value === "string" && DECISIONS.includes(value as Decision);
}

export function isLogEntry(value: unknown): value is LogEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.at === "string" &&
    typeof row.itemId === "string" &&
    typeof row.itemName === "string" &&
    typeof row.localityId === "string" &&
    typeof row.localityName === "string" &&
    isDecision(row.decision) &&
    typeof row.weightKg === "number" &&
    Number.isFinite(row.weightKg) &&
    (row.deltaKg === null || (typeof row.deltaKg === "number" && Number.isFinite(row.deltaKg))) &&
    (row.factorId === null || typeof row.factorId === "string") &&
    typeof row.column === "string" &&
    typeof row.shortBasis === "string" &&
    typeof row.method === "string" &&
    (row.battery === undefined || typeof row.battery === "boolean")
  );
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadLog(storage: Pick<KeyValueStore, "getItem">): LogEntry[] {
  try {
    const raw = storage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLogEntry);
  } catch {
    return [];
  }
}

export function saveLog(storage: Pick<KeyValueStore, "setItem">, entries: LogEntry[]): void {
  storage.setItem(LOG_KEY, JSON.stringify(entries));
}

export function loadCity(storage: Pick<KeyValueStore, "getItem">): string | null {
  const value = storage.getItem(CITY_KEY);
  return value && getLocality(value) ? value : null;
}

export function saveCity(storage: Pick<KeyValueStore, "setItem">, localityId: string): void {
  storage.setItem(CITY_KEY, localityId);
}
