import { getItem, items, type Item } from "@/lib/items";
import type { ClassifyMethod, PixelFamily } from "@/lib/types";

export interface PixelSummary {
  leafy: number;
  kraft: number;
  yellow: number;
  white: number;
  metallic: number;
  blue: number;
  dark: number;
  mixed: number;
  samples: number;
}

export interface VisionHit {
  label: string;
  probability: number;
}

export interface ClassifyInput {
  sampleItemId?: string | null;
  selectedItemId?: string | null;
  filename?: string | null;
  query?: string | null;
  pixels?: PixelSummary | null;
  vision?: VisionHit[] | null;
}

export interface ClassifyAlternate {
  itemId: string;
  score: number;
}

export interface ClassifyResult {
  itemId: string | null;
  method: ClassifyMethod;
  confidence: number;
  alternates: ClassifyAlternate[];
  notes: string[];
}

const FAMILIES: PixelFamily[] = [
  "leafy",
  "kraft",
  "yellow",
  "white",
  "metallic",
  "blue",
  "dark",
];

export function summarizeRgba(data: ArrayLike<number>): PixelSummary {
  const counts: Record<PixelFamily | "mixed", number> = {
    leafy: 0,
    kraft: 0,
    yellow: 0,
    white: 0,
    metallic: 0,
    blue: 0,
    dark: 0,
    mixed: 0,
  };
  let samples = 0;
  for (let i = 0; i + 3 < data.length; i += 4) {
    const alpha = data[i + 3] ?? 255;
    if (alpha < 16) continue;
    counts[bucket(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0)] += 1;
    samples += 1;
  }
  const summary = emptySummary();
  summary.samples = samples;
  if (samples === 0) return summary;
  for (const family of FAMILIES) summary[family] = counts[family] / samples;
  summary.mixed = counts.mixed / samples;
  return summary;
}

function emptySummary(): PixelSummary {
  return {
    leafy: 0,
    kraft: 0,
    yellow: 0,
    white: 0,
    metallic: 0,
    blue: 0,
    dark: 0,
    mixed: 0,
    samples: 0,
  };
}

function bucket(r: number, g: number, b: number): PixelFamily | "mixed" {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (g > r + 18 && g > b + 12 && g > 45 && g >= max) return "leafy";
  if (r > 150 && g > 110 && b < 100 && r > b + 40 && g > b + 20 && sat < 0.75) {
    return "kraft";
  }
  if (r > 190 && g > 160 && b < 90 && r > b + 80) return "yellow";
  if (r > 225 && g > 225 && b > 225) return "white";
  if (sat < 0.14 && max > 120 && max < 210 && min > 90) return "metallic";
  if (b > r + 25 && b > g + 5 && b > 80 && sat > 0.25) return "blue";
  if (max < 55) return "dark";
  return "mixed";
}

export function dominantFamily(summary: PixelSummary): {
  family: PixelFamily | "mixed";
  share: number;
} {
  let family: PixelFamily | "mixed" = "mixed";
  let share = summary.mixed;
  for (const candidate of FAMILIES) {
    if (summary[candidate] > share) {
      family = candidate;
      share = summary[candidate];
    }
  }
  return { family, share };
}

const VISION_TO_ITEM: Record<string, string> = {
  "water bottle": "pet-bottle",
  "pop bottle": "pet-bottle",
  "pill bottle": "pet-bottle",
  "beer bottle": "glass-container",
  "wine bottle": "glass-container",
  "red wine": "glass-container",
  "beer glass": "glass-container",
  banana: "produce",
  orange: "produce",
  lemon: "produce",
  strawberry: "produce",
  pineapple: "produce",
  "granny smith": "produce",
  pomegranate: "produce",
  fig: "produce",
  cucumber: "produce",
  "bell pepper": "produce",
  "head cabbage": "produce",
  zucchini: "produce",
  pizza: "food-scraps",
  cheeseburger: "food-scraps",
  hotdog: "food-scraps",
  burrito: "food-scraps",
  "ice cream": "food-scraps",
  bagel: "food-scraps",
  pretzel: "food-scraps",
  "plastic bag": "plastic-film",
  mailbag: "plastic-film",
  carton: "cardboard-box",
  envelope: "office-paper",
  "comic book": "office-paper",
  "book jacket": "office-paper",
  "toilet tissue": "paper-napkin",
  "paper towel": "paper-napkin",
  jersey: "textile",
  sweatshirt: "textile",
  cardigan: "textile",
  suit: "textile",
  "jean, blue jean, denim": "textile",
  "running shoe": "textile",
  "coffee mug": "ceramic",
  cup: "ceramic",
  plate: "ceramic",
  vase: "ceramic",
  "soup bowl": "ceramic",
  "water jug": "hdpe-jug",
  "milk can": "steel-can",
  "cellular telephone": "phone",
  "hand-held computer": "phone",
  laptop: "phone",
  "notebook, notebook computer": "phone",
  notebook: "phone",
  "desktop computer": "phone",
  monitor: "phone",
  "computer keyboard": "phone",
  "mouse, computer mouse": "phone",
};

export function itemIdForVisionLabel(label: string): string | null {
  const full = label.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (VISION_TO_ITEM[full]) return VISION_TO_ITEM[full];
  const head = full.split(",")[0]?.trim() ?? full;
  return VISION_TO_ITEM[head] ?? null;
}

export function filenameToQuery(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const withoutExt = base.replace(/\.[a-z0-9]{1,5}$/i, "");
  return withoutExt.replace(/[_+-]+/g, " ");
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function scoreItemQuery(query: string, item: Item): number {
  const q = normalizeText(query);
  if (!q) return 0;
  const names = [item.name, ...item.aliases].map(normalizeText);
  if (names.some((name) => name === q)) return 1;

  let best = 0;
  const qTokens = q.split(" ").filter((token) => token.length > 1);
  for (const name of names) {
    if (!name) continue;
    if (q.includes(name) || name.includes(q)) {
      const coverage = Math.min(q.length, name.length) / Math.max(q.length, name.length);
      best = Math.max(best, 0.7 + 0.25 * coverage + name.length * 0.001);
    }
    const tokens = name.split(" ").filter((token) => token.length > 1);
    if (!tokens.length || !qTokens.length) continue;
    const hit = tokens.filter((token) => qTokens.includes(token)).length;
    if (hit === 0) continue;
    const recall = hit / tokens.length;
    const precision = hit / qTokens.length;
    best = Math.max(best, (recall * 0.6 + precision * 0.4) * 0.95);
  }
  return best;
}

export function searchItems(query: string, limit = 5): ClassifyAlternate[] {
  return items
    .map((item) => ({ itemId: item.id, score: scoreItemQuery(query, item) }))
    .filter((hit) => hit.score > 0.3)
    .sort((a, b) => b.score - a.score || a.itemId.localeCompare(b.itemId))
    .slice(0, limit);
}

const FAMILY_NOTE: Record<PixelFamily, string> = {
  leafy: "Mostly green. This guess is food scraps or yard trimmings, and it needs a confirmation.",
  kraft: "Mostly brown paper. This guess is cardboard. Say if it is greasy — that is a different cart.",
  yellow: "Mostly yellow. This is a weak guess at produce.",
  white: "Mostly white. Color cannot tell paper from a jug, a cup, or a bag. Confirm it.",
  metallic: "Mostly gray metal. Aluminum and steel both look like this. Confirm which can.",
  blue: "Mostly blue. A drink bottle is the guess, not a sure ID.",
  dark: "Mostly dark. A phone or laptop is the guess. Confirm it before you log it.",
};

function heuristicFromSummary(summary: PixelSummary): {
  itemId: string | null;
  confidence: number;
  alternates: ClassifyAlternate[];
  note: string;
} | null {
  const { family, share } = dominantFamily(summary);
  if (family === "mixed" || share < 0.38) return null;
  const ranked = items
    .map((item, index) => {
      if (!item.families.includes(family)) return null;
      const weight = item.families[0] === family ? 0.62 : 0.48;
      return { itemId: item.id, score: share * weight, index };
    })
    .filter((row): row is { itemId: string; score: number; index: number } => row !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const top = ranked[0];
  if (!top) return null;
  return {
    itemId: top.itemId,
    confidence: Math.min(0.55, top.score),
    alternates: ranked.slice(1, 4).map(({ itemId, score }) => ({ itemId, score })),
    note: FAMILY_NOTE[family],
  };
}

function bestVision(vision: VisionHit[] | null | undefined): {
  itemId: string;
  probability: number;
  label: string;
} | null {
  if (!vision?.length) return null;
  let best: { itemId: string; probability: number; label: string } | null = null;
  for (const hit of vision) {
    const itemId = itemIdForVisionLabel(hit.label);
    if (!itemId || !getItem(itemId)) continue;
    if (!best || hit.probability > best.probability) {
      best = { itemId, probability: hit.probability, label: hit.label };
    }
  }
  return best;
}

function uniqAlternates(rows: ClassifyAlternate[], primary: string | null): ClassifyAlternate[] {
  const seen = new Set<string>();
  if (primary) seen.add(primary);
  const result: ClassifyAlternate[] = [];
  for (const row of rows) {
    if (seen.has(row.itemId) || !getItem(row.itemId)) continue;
    seen.add(row.itemId);
    result.push(row);
    if (result.length === 3) break;
  }
  return result;
}

export function classify(input: ClassifyInput): ClassifyResult {
  if (input.sampleItemId && getItem(input.sampleItemId)) {
    return {
      itemId: input.sampleItemId,
      method: "sample",
      confidence: 1,
      alternates: [],
      notes: ["Opened from the sample tray. No model involved."],
    };
  }

  if (input.selectedItemId && getItem(input.selectedItemId)) {
    return {
      itemId: input.selectedItemId,
      method: "search",
      confidence: 1,
      alternates: [],
      notes: ["You chose this item."],
    };
  }

  const notes: string[] = [];
  const queryHits = input.query?.trim() ? searchItems(input.query, 4) : [];
  const fileQuery = input.filename ? filenameToQuery(input.filename) : "";
  const fileHits = fileQuery ? searchItems(fileQuery, 4) : [];
  const visionHit = bestVision(input.vision);
  const pixel = input.pixels ? heuristicFromSummary(input.pixels) : null;

  if (queryHits[0] && queryHits[0].score >= 0.8) {
    return {
      itemId: queryHits[0].itemId,
      method: "search",
      confidence: queryHits[0].score,
      alternates: uniqAlternates(
        [...queryHits.slice(1), ...(pixel?.alternates ?? [])],
        queryHits[0].itemId,
      ),
      notes: ["Matched the words you typed."],
    };
  }

  if (fileHits[0] && fileHits[0].score >= 0.8) {
    notes.push("Matched the file name.");
    if (visionHit && visionHit.itemId === fileHits[0].itemId) {
      notes.push("The on-device vision model agreed with the file name.");
    }
    return {
      itemId: fileHits[0].itemId,
      method: "filename",
      confidence: Math.min(1, fileHits[0].score),
      alternates: uniqAlternates(
        [...fileHits.slice(1), ...(pixel?.alternates ?? [])],
        fileHits[0].itemId,
      ),
      notes,
    };
  }

  if (visionHit && visionHit.probability >= 0.2) {
    notes.push(
      `MobileNet said “${visionHit.label}”. ImageNet classes are everyday objects, not waste categories. The mapping is a table in this app.`,
    );
    return {
      itemId: visionHit.itemId,
      method: "vision",
      confidence: Math.min(0.9, visionHit.probability),
      alternates: uniqAlternates(pixel?.alternates ?? [], visionHit.itemId),
      notes,
    };
  }

  if (pixel?.itemId) {
    return {
      itemId: pixel.itemId,
      method: "heuristic",
      confidence: pixel.confidence,
      alternates: pixel.alternates,
      notes: [pixel.note],
    };
  }

  if (queryHits[0]) {
    return {
      itemId: queryHits[0].itemId,
      method: "search",
      confidence: queryHits[0].score,
      alternates: uniqAlternates(queryHits.slice(1), queryHits[0].itemId),
      notes: ["Partial word match. Confirm it before you log it."],
    };
  }

  return {
    itemId: null,
    method: "unknown",
    confidence: 0,
    alternates: [],
    notes: ["No rule fired. Type what the object is, or pick a sample."],
  };
}

export function needsConfirmation(result: ClassifyResult): boolean {
  if (!result.itemId) return true;
  if (result.method === "heuristic") return true;
  if (result.method === "vision" && result.confidence < 0.75) return true;
  if (result.confidence < 0.8) return true;
  return false;
}

export const METHOD_LABEL: Record<ClassifyMethod, string> = {
  sample: "Sample",
  search: "You named it",
  filename: "File name",
  vision: "On-device vision",
  heuristic: "Color guess",
  unknown: "No match",
};
