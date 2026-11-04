export type LocalityId = "sf" | "seattle" | "nyc" | "austin" | "baseline";

export type Stream = "recycle" | "compost" | "landfill" | "special";

export type Decision = Stream | "reuse";

export type PixelFamily =
  | "leafy"
  | "kraft"
  | "yellow"
  | "white"
  | "metallic"
  | "blue"
  | "dark";

export type ClassifyMethod =
  | "sample"
  | "search"
  | "filename"
  | "vision"
  | "heuristic"
  | "unknown";

export interface CityRule {
  stream: Stream;
  setout: string;
  note: string;
}

export const DECISIONS: Decision[] = [
  "reuse",
  "recycle",
  "compost",
  "landfill",
  "special",
];
