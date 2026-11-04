/**
 * EPA Waste Reduction Model (WARM) version 16 net emission factors.
 *
 * Source: "Documentation for Greenhouse Gas Emission and Energy Factors Used
 * in the Waste Reduction Model (WARM) — Management Practices Chapters",
 * Version 16, December 2023.
 * https://www.epa.gov/system/files/documents/2024-01/warm_management_practices_v16_dec.pdf
 *
 * Values are metric tons of CO2e per wet short ton of material as managed.
 * Parentheses in the WARM exhibit are negatives. NA cells are null here.
 * Source reduction is the "current mix of inputs" column, the more
 * conservative of WARM's two source-reduction columns.
 */

export const WARM_VERSION = "16";

export const WARM_SOURCE = {
  title:
    "EPA WARM v16 management-practice emission factors (December 2023)",
  url: "https://www.epa.gov/system/files/documents/2024-01/warm_management_practices_v16_dec.pdf",
  versionsUrl: "https://www.epa.gov/waste-reduction-model/versions-waste-reduction-model",
} as const;

/** 2000 lb × 0.45359237 kg/lb. EPA reports WARM per US short ton. */
export const SHORT_TON_KG = 907.18474;

/**
 * EPA Greenhouse Gas Equivalencies Calculator, updated November 2024.
 * Gasoline-powered passenger vehicle: 3.93 × 10^-4 metric tons CO2e per mile
 * = 0.393 kg CO2e per mile. 2022 fleet, 22.8 mpg, including CH4 and N2O.
 * https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references
 */
export const KG_CO2E_PER_VEHICLE_MILE = 0.393;

export const EQUIVALENCY_SOURCE = {
  title:
    "EPA GHG Equivalencies Calculator — miles driven by a gasoline passenger vehicle",
  url: "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references",
} as const;

export interface WarmRow {
  id: string;
  warmName: string;
  /** MTCO2e per short ton. Null means the exhibit cell is NA. */
  sourceReduction: number | null;
  recycling: number | null;
  composting: number | null;
  landfilling: number | null;
  caveat?: string;
}

export const WARM_ROWS: WarmRow[] = [
  {
    id: "aluminum-cans",
    warmName: "Aluminum Cans",
    sourceReduction: -4.8,
    recycling: -9.13,
    composting: null,
    landfilling: 0.02,
    caveat:
      "Source reduction uses the current-mix column, not 100% virgin. For aluminum cans that current-mix figure is smaller than the recycling factor, because can sheet already contains a lot of recycled metal.",
  },
  {
    id: "steel-cans",
    warmName: "Steel Cans",
    sourceReduction: -3.03,
    recycling: -1.83,
    composting: null,
    landfilling: 0.02,
  },
  {
    id: "glass",
    warmName: "Glass",
    sourceReduction: -0.53,
    recycling: -0.28,
    composting: null,
    landfilling: 0.02,
  },
  {
    id: "corrugated",
    warmName: "Corrugated Containers",
    sourceReduction: -5.58,
    recycling: -3.14,
    composting: null,
    landfilling: 0.18,
  },
  {
    id: "newspaper",
    warmName: "Newspaper",
    sourceReduction: -4.68,
    recycling: -2.71,
    composting: null,
    landfilling: -0.85,
    caveat:
      "The newspaper landfilling factor is already negative because of landfill carbon storage. Recycling is still lower. The number Looktwice stores is the difference, not the raw recycling cell.",
  },
  {
    id: "office-paper",
    warmName: "Office Paper",
    sourceReduction: -7.95,
    recycling: -2.86,
    composting: null,
    landfilling: 1.13,
  },
  {
    id: "mixed-paper",
    warmName: "Mixed Paper (primarily residential)",
    sourceReduction: -6.0,
    recycling: -3.55,
    composting: null,
    landfilling: 0.02,
  },
  {
    id: "pet",
    warmName: "PET",
    sourceReduction: -2.17,
    recycling: -1.04,
    composting: null,
    landfilling: 0.02,
  },
  {
    id: "hdpe",
    warmName: "HDPE",
    sourceReduction: -1.42,
    recycling: -0.76,
    composting: null,
    landfilling: 0.02,
    caveat:
      "The HDPE recycling factor is for rigid HDPE, not film. Film is the LDPE row.",
  },
  {
    id: "ldpe",
    warmName: "LDPE",
    sourceReduction: -1.8,
    recycling: null,
    composting: null,
    landfilling: 0.02,
    caveat:
      "WARM v16 has no recycling factor for LDPE. The rigid HDPE recycling factor is not used as a stand-in for bags and wrap.",
  },
  {
    id: "pp",
    warmName: "PP",
    sourceReduction: -1.52,
    recycling: -0.79,
    composting: null,
    landfilling: 0.02,
  },
  {
    id: "ps",
    warmName: "PS",
    sourceReduction: -2.5,
    recycling: null,
    composting: null,
    landfilling: 0.02,
    caveat: "WARM v16 has no recycling factor for polystyrene.",
  },
  {
    id: "food",
    warmName: "Food Waste",
    sourceReduction: -3.66,
    recycling: null,
    composting: -0.15,
    landfilling: 0.5,
    caveat:
      "Food factors are per wet short ton. Source reduction is only fair when the food was eaten or otherwise never became waste. This row includes meat; scraps that are only fruit and vegetables use a different row.",
  },
  {
    id: "produce",
    warmName: "Fruits and Vegetables",
    sourceReduction: -0.44,
    recycling: null,
    composting: -0.15,
    landfilling: 0.23,
    caveat:
      "Upstream emissions here are lower than mixed food waste, which includes beef. A peel is not source reduction. Log compost for a peel and reuse only if someone ate the food.",
  },
  {
    id: "yard",
    warmName: "Yard Trimmings",
    sourceReduction: null,
    recycling: null,
    composting: -0.11,
    landfilling: -0.2,
    caveat:
      "For mixed yard trimmings, WARM v16's landfilling factor is more negative than composting because of landfill carbon storage. Composting can show as a small increase versus the landfill baseline. Cities still collect yard waste for reasons this one number does not capture.",
  },
  {
    id: "mixed-electronics",
    warmName: "Mixed Electronics",
    sourceReduction: -20.79,
    recycling: -0.9,
    composting: null,
    landfilling: 0.02,
    caveat:
      "Mixed electronics is a WARM blend of devices, applied here per kilogram. It is not a phone-specific life-cycle assessment.",
  },
];

const BY_ID = new Map(WARM_ROWS.map((row) => [row.id, row]));

export function getWarmRow(id: string): WarmRow | undefined {
  return BY_ID.get(id);
}

/** kg CO2e per kg of material, for (alternative − landfilling). Negative avoids emissions. */
export function deltaKgPerKg(alternativeMt: number, landfillMt: number): number {
  return ((alternativeMt - landfillMt) * 1000) / SHORT_TON_KG;
}
