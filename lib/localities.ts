import type { LocalityId } from "@/lib/types";

export interface LocalitySource {
  label: string;
  url: string;
}

export interface Locality {
  id: LocalityId;
  city: string;
  region: string;
  hauler: string;
  summary: string;
  limit: string;
  snapshot: string;
  sources: LocalitySource[];
}

export const LOCALITY_IDS: LocalityId[] = [
  "sf",
  "seattle",
  "nyc",
  "austin",
  "baseline",
];

export const localities: Locality[] = [
  {
    id: "sf",
    city: "San Francisco",
    region: "California",
    hauler: "Recology",
    summary:
      "Three carts. Food and soiled paper go in the green compost cart. Rigid plastic, glass, metal, and clean paper go in the blue cart, loose. Film, foam, batteries, and electronics stay out of all three.",
    limit:
      "Written for residential carts. Larger buildings use the same three streams; the setout is different. Rules were read from Recology and SF Recycles in November 2026.",
    snapshot: "November 2026",
    sources: [
      {
        label: "Recology San Francisco — What Goes Where",
        url: "https://www.recology.com/recology-san-francisco/what-goes-where/",
      },
      {
        label: "SF Recycles — where recyclables go",
        url: "https://sfrecycles.org/WhereRecyclablesGo",
      },
    ],
  },
  {
    id: "seattle",
    city: "Seattle",
    region: "Washington",
    hauler: "Seattle Public Utilities",
    summary:
      "Recycling has to be empty, clean, dry, and generally larger than 3 inches. Food and food-soiled paper go in the compost cart. Plastic bags go in the garbage. Batteries and covered electronics are banned from the garbage.",
    limit:
      "Cart rules, not transfer-station rules. The 3-inch note is about the sort line: small pieces fall through. Snapshot of Seattle Public Utilities pages, November 2026.",
    snapshot: "November 2026",
    sources: [
      {
        label: "Seattle Public Utilities — How to sort at home",
        url: "https://seattle.gov/utilities/your-services/collection-and-disposal/how-to-sort-at-home",
      },
      {
        label: "Seattle — ban on batteries and electronics in the garbage",
        url: "https://www.seattle.gov/utilities/your-services/collection-and-disposal/ban-on-batteries-and-electronics-in-garbage",
      },
    ],
  },
  {
    id: "nyc",
    city: "New York City",
    region: "New York",
    hauler: "Department of Sanitation",
    summary:
      "Metal, glass, rigid plastic, and cartons are set out together. Paper and cardboard are a second setout. Food scraps and food-soiled paper are mandatory compost as of April 2025. Soft plastics are trash. Household alkaline batteries may go in the trash; lithium and rechargeable batteries may not.",
    limit:
      "What goes in is not the same rule as setout time or the official NYC Bin. Apartment storage rules differ. Snapshot of DSNY pages, November 2026.",
    snapshot: "November 2026",
    sources: [
      {
        label: "DSNY — Recycling",
        url: "https://www.nyc.gov/site/dsny/collection/residents/recycling.page",
      },
      {
        label: "DSNY — Curbside composting",
        url: "https://www.nyc.gov/site/dsny/collection/residents/curbside-composting.page",
      },
      {
        label: "DSNY — Trash",
        url: "https://www.nyc.gov/site/dsny/collection/residents/trash.page",
      },
      {
        label: "DSNY — Batteries",
        url: "https://www.nyc.gov/site/dsny/collection/get-rid-of/batteries.page",
      },
      {
        label: "DSNY — Electronics",
        url: "https://www.nyc.gov/site/dsny/collection/get-rid-of/electronics.page",
      },
    ],
  },
  {
    id: "austin",
    city: "Austin",
    region: "Texas",
    hauler: "Austin Resource Recovery",
    summary:
      "Blue cart takes mixed paper, hard plastic, metal, glass, and coated paper cups. Green cart takes food and food-soiled paper, including pizza boxes. Bags, batteries, and electronics are not cart materials. Batteries have a drop-off and an on-demand pickup.",
    limit:
      "Curbside compost and recycling here describe residential carts up to four-plexes. Apartments may differ — Austin tells residents to follow the property manager. Snapshot of Austin Resource Recovery pages, November 2026.",
    snapshot: "November 2026",
    sources: [
      {
        label: "Austin Resource Recovery — residential recycling",
        url: "https://www.austintexas.gov/resource-recovery/programs/residential-recycling-collection",
      },
      {
        label: "Austin Resource Recovery — curbside composting",
        url: "https://www.austintexas.gov/resource-recovery/curbside-composting-guide",
      },
      {
        label: "Austin — batteries and other hard-to-recycle items",
        url: "https://www.austintexas.gov/resource-recovery/road-zero-waste/what-do-batteries-and-other-hard-recycle-items",
      },
    ],
  },
  {
    id: "baseline",
    city: "No city picked",
    region: "United States",
    hauler: "No hauler assumed",
    summary:
      "A conservative stand-in, not a law. Bottles, cans, glass jars, and clean paper are treated as curbside recycling because most US programs take them. No organics cart is assumed. Film, foam, batteries, and electronics are not assumed to be cart recycling.",
    limit:
      "Pick a real city before you treat this as a rule. Some cities have dropped glass. Some have added compost. This profile exists so the demo still runs if you have not chosen one.",
    snapshot: "November 2026",
    sources: [
      {
        label: "EPA Waste Reduction Model",
        url: "https://www.epa.gov/warm",
      },
    ],
  },
];

const BY_ID = new Map(localities.map((locality) => [locality.id, locality]));

export function getLocality(id: string): Locality | undefined {
  return BY_ID.get(id as LocalityId);
}

export function isLocalityId(id: string): id is LocalityId {
  return BY_ID.has(id as LocalityId);
}
