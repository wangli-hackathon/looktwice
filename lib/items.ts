import type { CityRule, LocalityId, PixelFamily } from "@/lib/types";

/**
 * Earlier items win when a color guess ties.
 * Produce before yard, cardboard before pizza, aluminum before steel,
 * office paper before other white objects.
 */
export interface Item {
  id: string;
  name: string;
  aliases: string[];
  families: PixelFamily[];
  materialId: string;
  weightKg: number;
  weightNote: string;
  prep: string[];
  why: string;
  caution?: string;
  reuse: {
    level: "high" | "medium" | "low";
    summary: string;
    actions: { title: string; detail: string }[];
  };
  reuseColumn: "source-reduction" | "none";
  specialColumn: "recycling" | "none";
  climateCaveat?: string;
  rules: Record<LocalityId, CityRule>;
}

const sfBlue =
  "Blue recycling cart. Loose, empty, and dry. No plastic bag around it.";
const sfGreen = "Green compost cart. Keep plastic out of it.";
const sfBlack = "Black landfill cart.";
const sfDrop = "Not a cart. Take it to a drop-off or a store take-back.";

const seaRecycle =
  "Recycling cart. Empty, clean, dry, and generally larger than 3 inches.";
const seaCompost = "Food and yard cart. Food in, plastic out.";
const seaGarbage = "Garbage cart.";
const seaDrop =
  "Banned from the garbage and from recycling. Use a drop-off or a transfer-station collection.";

const nycMgp =
  "Metal, glass, plastic, and cartons. Labeled bin or a clear bag, separate from paper.";
const nycPaper =
  "Mixed paper and cardboard. Labeled bin or a clear bag, separate from metal, glass, and plastic.";
const nycCompost =
  "Brown compost bin, or any labeled bin with a lid, 55 gallons or less.";
const nycTrash = "Trash setout. Not the recycling bags.";
const nycDrop =
  "Special-waste drop-off, a SAFE event, or a store that is required to take it back. Not trash and not recycling.";

const ausBlue = "Blue recycling cart. Loose. Do not bag it.";
const ausGreen = "Green compost cart. No plastic.";
const ausTrash = "Trash cart.";
const ausDrop =
  "Recycle & Reuse Drop-off Center, a store bin, or an on-demand Austin Resource Recovery pickup. Not a cart.";

const baseRecycle =
  "Curbside recycling if your hauler lists it. Loose, empty, and dry. This is not a city ordinance.";
const baseTrash =
  "Trash, under this baseline. Confirm with your hauler before you assume a cart wants it.";
const baseDrop =
  "A drop-off you confirm locally. Do not put it in a recycling cart just in case.";

export const items: Item[] = [
  {
    id: "produce",
    name: "Fruit or vegetable",
    aliases: [
      "banana",
      "banana peel",
      "apple",
      "orange",
      "fruit",
      "vegetable",
      "peel",
      "produce",
    ],
    families: ["leafy", "yellow"],
    materialId: "produce",
    weightKg: 0.12,
    weightNote:
      "Default is 120 g, about one piece of fruit or the peel and core from one. Food factors are wet weight. Edit it.",
    prep: [
      "If someone can still eat it, that comes first.",
      "A peel or core can go in with food scraps where the city composts.",
      "No stickers in the compost if you can get them off. No plastic bag.",
    ],
    why: "Edible food and a peel are different decisions. Eating the food avoids growing a replacement. A peel cannot be eaten, and the fruits-and-vegetables row is the honest WARM match, not the mixed-food row that includes beef.",
    reuse: {
      level: "high",
      summary:
        "If it is still food, eat it, freeze it, or give it away. A peel does not get that credit. Compost is what you do with the part nobody can eat.",
      actions: [
        {
          title: "Still edible",
          detail: "Eat it, freeze it, or share it. That is source reduction, not compost.",
        },
        {
          title: "Only a peel or a core",
          detail: "Log the city’s organics path. Do not call a peel reuse.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "compost",
        setout: sfGreen,
        note: "Recology takes fruit and vegetable scraps, including pits and shells, in the green cart.",
      },
      seattle: {
        stream: "compost",
        setout: seaCompost,
        note: "If you could have eaten it, Seattle treats it as compost. Peels go with it. No plastic produce bag.",
      },
      nyc: {
        stream: "compost",
        setout: nycCompost,
        note: "Food scraps are mandatory to separate citywide. Fruit and vegetables go in the compost setout.",
      },
      austin: {
        stream: "compost",
        setout: ausGreen,
        note: "Fruit and vegetable scraps go in the green cart. Plastic stays out, including the produce bag.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "No organics cart is assumed. If you have a home pile or a real program, log compost instead. Until then the baseline is trash.",
      },
    },
  },
  {
    id: "yard-trimmings",
    name: "Yard trimmings",
    aliases: ["leaves", "grass", "yard", "branches", "yard waste", "trimmings"],
    families: ["leafy"],
    materialId: "yard",
    weightKg: 0.5,
    weightNote: "Default is 500 g, a small armful, wet basis. A full cart is much more. Edit it.",
    prep: [
      "Keep plastic bags, plant ties, and pet waste out.",
      "Check length limits before you set out branches.",
    ],
    why: "Cities collect yard waste so it does not take landfill space and so residents have a legal place to put it. On greenhouse gases alone, WARM v16 does not give mixed yard trimmings a composting win over landfilling, because woody carbon storage in a landfill is large. Looktwice shows that instead of flipping the sign.",
    reuse: {
      level: "low",
      summary:
        "Leave the leaves in a bed if you want mulch. That is a yard choice, not a second life for a product. The cart question is still compost versus trash.",
      actions: [
        {
          title: "Mulch a bed",
          detail: "Dry leaves can stay on site. Log reuse only if they never entered a cart.",
        },
      ],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "compost",
        setout: sfGreen,
        note: "Plant debris goes in the green cart. Branches have size limits on the Recology list.",
      },
      seattle: {
        stream: "compost",
        setout: seaCompost,
        note: "Yard waste, plants, and clean wood go in the food and yard cart.",
      },
      nyc: {
        stream: "compost",
        setout: nycCompost,
        note: "Leaf and yard waste are part of the mandatory organics separation. Extra leaves can be bundled or bagged as DSNY describes.",
      },
      austin: {
        stream: "compost",
        setout: ausGreen,
        note: "Grass, leaves, and small branches go in the green cart.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "No yard cart is assumed. A home pile can be logged as compost. Read the climate line first: WARM may not call compost the lower-carbon path.",
      },
    },
  },
  {
    id: "cardboard-box",
    name: "Clean cardboard box",
    aliases: ["cardboard", "shipping box", "box", "mailer", "corrugated"],
    families: ["kraft"],
    materialId: "corrugated",
    weightKg: 0.18,
    weightNote: "Default is 180 g, a small mailer. A large shipping box is heavier. Edit it.",
    prep: [
      "Flatten it.",
      "Pull out plastic liners, foam, and packing pillows.",
      "Tape and labels are usually fine. Food grease is not — that is the pizza-box item.",
    ],
    why: "Clean corrugated is one of the materials recycling actually wants. A greasy pizza box is a different item in this app because the cart changes.",
    reuse: {
      level: "medium",
      summary:
        "A sound box can ship or store something else. That only counts as source reduction if it stands in for a new box. A crushed, worn-out box should be recycled.",
      actions: [
        {
          title: "Ship or store with it",
          detail: "Keep it in use if it still has structure. Log reuse.",
        },
        {
          title: "It is worn out",
          detail: "Flatten it and recycle it dry.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    climateCaveat:
      "Source reduction applies only if this box replaces a new one. Recycling a worn-out box uses the recycling column, not source reduction.",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Non-waxed cardboard goes in the blue cart. Waxed cardboard is a compost item, not this one.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Flatten cardboard. Labels and tape are okay. Food-soiled cardboard is compost, not this item.",
      },
      nyc: {
        stream: "recycle",
        setout: nycPaper,
        note: "Cardboard is mixed paper setout. Flatten it. It can be bundled and tied. Do not use the box as a bin for other recycling.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Clean cardboard goes in the blue cart, loose, or beside it if it does not fit, following Austin’s extra-recycling rules.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Clean, dry corrugated is accepted in most US curbside programs. Grease changes the answer.",
      },
    },
  },
  {
    id: "pizza-box",
    name: "Greasy pizza box",
    aliases: ["pizza box", "greasy box", "pizza"],
    families: ["kraft"],
    materialId: "corrugated",
    weightKg: 0.2,
    weightNote: "Default is 200 g for a typical corrugated pizza box. Edit it if you have a scale.",
    prep: [
      "Remove the plastic pizza saver and any liners.",
      "If the lid is truly clean, you can tear that piece off and recycle it where clean cardboard is accepted.",
      "The greasy part follows the compost or trash rule for your city.",
    ],
    why: "Grease is a contaminant at a paper mill and a feedstock at a compost site. Cities that take food-soiled paper want the box in organics. Cities without that cart do not want it in the recycling.",
    caution:
      "Do not apply a recycling climate credit to a greasy box. Mills usually reject it, and WARM’s composting cell for corrugated cardboard is blank.",
    reuse: {
      level: "low",
      summary:
        "A greasy box is a poor second container. Reuse was the decision to buy fewer pizzas in boxes, and that moment has passed. Sort the box you have.",
      actions: [
        {
          title: "Nothing left to reuse",
          detail: "Follow the city. Do not store food in a greasy box.",
        },
      ],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "compost",
        setout: sfGreen,
        note: "Recology lists greasy pizza boxes with soiled paper in the green cart, not the blue cart.",
      },
      seattle: {
        stream: "compost",
        setout: seaCompost,
        note: "Seattle composts food-soiled pizza boxes. A clean cardboard box is recycling. This item is the greasy one.",
      },
      nyc: {
        stream: "compost",
        setout: nycCompost,
        note: "DSNY lists greasy uncoated pizza boxes with food-soiled paper in the compost setout.",
      },
      austin: {
        stream: "compost",
        setout: ausGreen,
        note: "Austin’s green cart takes pizza boxes. Remove plastic and metal.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "No compost cart is assumed. Do not put a greasy box in recycling under this baseline. Tear off a clean lid only if your real hauler wants clean cardboard.",
      },
    },
  },
  {
    id: "aluminum-can",
    name: "Aluminum can",
    aliases: ["aluminum can", "soda can", "beer can", "can"],
    families: ["metallic"],
    materialId: "aluminum-cans",
    weightKg: 0.0149,
    weightNote:
      "Default is 14.9 g, a long-used reference empty weight for a 12 fl oz aluminum can. Newer cans can be lighter. Edit it.",
    prep: [
      "Empty it.",
      "You do not need to crush it.",
      "Foil is a different shape. Ball a wad of clean foil only where the city lists foil.",
    ],
    why: "Aluminum is the high-intensity recycling credit in WARM. Per kilogram it dwarfs glass. Per can it is still a small object, which is why the log shows both the can and the per-kilogram factor.",
    reuse: {
      level: "low",
      summary:
        "A drink can is a poor second container. Under WARM’s current-mix source reduction, keeping it is a smaller climate credit than recycling it, because can sheet is already mostly recycled metal. Recycle the can.",
      actions: [
        {
          title: "Recycle it",
          detail: "This is the larger WARM credit for this object.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Aluminum cans go in the blue cart. Empty them. Recology also takes balled foil; that is not this item.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Aluminum cans are recycling. Empty, clean, and dry.",
      },
      nyc: {
        stream: "recycle",
        setout: nycMgp,
        note: "Cans go with metal, glass, plastic, and cartons. Not with the paper.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Metal cans go in the blue cart, loose.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Aluminum cans are accepted in nearly every US curbside program.",
      },
    },
  },
  {
    id: "steel-can",
    name: "Steel food can",
    aliases: ["steel can", "tin can", "food can", "soup can"],
    families: ["metallic"],
    materialId: "steel-cans",
    weightKg: 0.055,
    weightNote: "Default is 55 g, an empty steel food can around the 15 oz size. Edit it.",
    prep: ["Empty it and give it a quick rinse.", "The paper label can stay.", "No full cans."],
    why: "Steel cans are a standard curbside metal. The climate credit is real and much smaller per kilogram than aluminum.",
    reuse: {
      level: "low",
      summary: "A used food can is rarely worth keeping. Rinse it and recycle it.",
      actions: [{ title: "Recycle it", detail: "Empty and rinsed is enough." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Steel cans go in the blue cart. Empty them. Lids can go too.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Steel cans are recycling when they are empty, clean, and dry.",
      },
      nyc: {
        stream: "recycle",
        setout: nycMgp,
        note: "Steel cans are metal setout, with glass and rigid plastic.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Metal cans go in the blue cart.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Steel food cans are standard curbside recycling.",
      },
    },
  },
  {
    id: "pet-bottle",
    name: "PET drink bottle",
    aliases: ["plastic bottle", "water bottle", "soda bottle", "pet bottle", "bottle"],
    families: ["blue", "white"],
    materialId: "pet",
    weightKg: 0.018,
    weightNote:
      "Default is 18 g, a mid-range empty single-serve PET bottle. A heavier reusable bottle is a different object. Edit it.",
    prep: [
      "Empty it.",
      "In these four cities the cap can stay on.",
      "Do not bag bottles inside a plastic bag.",
    ],
    why: "A thin water bottle is recycling, not a keepsake. A sturdier bottle that you actually refill is source reduction, and only if it replaces another purchase.",
    reuse: {
      level: "medium",
      summary:
        "Refill it only if the bottle is sturdy enough to be used again. Most thin water bottles are a one-time PET container. The climate credit for refilling counts only when you do not buy the next drink in another bottle.",
      actions: [
        {
          title: "Refill a sturdy one",
          detail: "Log reuse if this bottle replaces a purchase.",
        },
        {
          title: "It is a thin single-use bottle",
          detail: "Empty it and recycle it.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Bottles go in the blue cart. Recology says to leave caps on. No plastic bag.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Plastic bottles are recycling when empty, clean, and dry. A bottle is large enough to clear the 3-inch rule.",
      },
      nyc: {
        stream: "recycle",
        setout: nycMgp,
        note: "Rigid plastic bottles go with metal, glass, plastic, and cartons.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Beverage bottles are hard plastic for the blue cart. No bags.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "PET bottles are accepted by most US curbside programs. Caps-on rules vary.",
      },
    },
  },
  {
    id: "office-paper",
    name: "Office paper",
    aliases: ["paper", "office paper", "printer paper", "copy paper", "envelope", "mail"],
    families: ["white"],
    materialId: "office-paper",
    weightKg: 0.05,
    weightNote: "Default is 50 g, about ten letter sheets. One sheet is about 5 g. Edit it.",
    prep: [
      "Keep it dry and free of food.",
      "Window envelopes are accepted in the cities that list them.",
      "Soiled napkins are a different item.",
    ],
    why: "Clean office paper is recycling. Using the blank side is a small reuse. Once it is crumpled and done, the mill wants it clean.",
    reuse: {
      level: "medium",
      summary:
        "Use the blank side for notes before you recycle the sheet. That is a modest source reduction only if it avoids a new sheet. Do not store a stack you will never use.",
      actions: [
        {
          title: "Use the other side",
          detail: "Scratch paper counts if it replaces a new sheet.",
        },
        {
          title: "It is spent",
          detail: "Recycle it clean and dry.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Office paper, mail, and envelopes go in the blue cart when they are clean and dry. Shredded paper goes in a sealed paper bag labeled shredded paper.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Office paper is on Seattle’s paper list. Empty, clean, and dry.",
      },
      nyc: {
        stream: "recycle",
        setout: nycPaper,
        note: "Office paper is mixed paper. Keep it out of the metal, glass, and plastic setout.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Office paper and mail go in the blue cart.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Clean office paper is standard curbside recycling.",
      },
    },
  },
  {
    id: "newspaper",
    name: "Newspaper",
    aliases: ["newspaper", "newsprint", "magazine"],
    families: ["kraft", "white"],
    materialId: "newspaper",
    weightKg: 0.1,
    weightNote: "Default is 100 g, a thin daily section, not a Sunday paper. Edit it.",
    prep: ["Keep it dry.", "No plastic sleeve in the recycling.", "Food-soiled paper is the napkin or pizza item."],
    why: "Newspaper is recycling in all four cities. WARM’s landfill factor for newspaper is already negative because of carbon storage. Recycling is still lower, and the log uses the difference.",
    reuse: {
      level: "low",
      summary: "Wrapping a glass or lining a bed with yesterday’s paper is minor. The reliable path is recycling it dry.",
      actions: [{ title: "Recycle it dry", detail: "Do not bag it in plastic." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Newspapers and magazines go in the blue cart, clean and dry.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Newspaper and magazines are on the paper list.",
      },
      nyc: {
        stream: "recycle",
        setout: nycPaper,
        note: "Newspaper is mixed paper, set out separate from metal, glass, and plastic.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Newspapers go in the blue cart.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Dry newspaper is standard curbside paper recycling.",
      },
    },
  },
  {
    id: "phone",
    name: "Phone or laptop",
    aliases: ["phone", "iphone", "laptop", "computer", "tablet", "electronic", "e-waste"],
    families: ["dark"],
    materialId: "mixed-electronics",
    weightKg: 0.19,
    weightNote:
      "Default is 190 g, about a recent phone without a case. A laptop is closer to 1.3–1.8 kg. Edit it. The factor is per kilogram.",
    prep: [
      "Sign out, then wipe the device if you can.",
      "Do not put it in a cart.",
      "Tape or bag a loose lithium battery. A battery still inside a device follows the e-waste path.",
    ],
    why: "Covered electronics are illegal or banned in the trash in these cities, and they are a fire and toxics problem in a truck. The higher climate number is keeping the device in use, not shredding it.",
    caution: "A cart is the wrong landing even if a drop-off is inconvenient.",
    reuse: {
      level: "high",
      summary:
        "Sell it, trade it in, or give it to someone who will use it. WARM’s source-reduction factor for mixed electronics is large because making devices is carbon-heavy. Recycling a dead device is the fallback, and its credit per kilogram is much smaller.",
      actions: [
        {
          title: "Keep it in use",
          detail: "Trade-in, sale, or a person who will turn it on.",
        },
        {
          title: "It is dead",
          detail: "E-waste drop-off. Not the trash and not the recycling cart.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "recycling",
    rules: {
      sf: {
        stream: "special",
        setout: sfDrop,
        note: "Electronics do not go in the blue, green, or black cart. Use an e-waste drop-off. SF Recycles lists batteries and electronics as common blue-bin contaminants.",
      },
      seattle: {
        stream: "special",
        setout: seaDrop,
        note: "Seattle bans covered electronics from the garbage, including computers, tablets, e-readers, TVs, and monitors.",
      },
      nyc: {
        stream: "special",
        setout: nycDrop,
        note: "It is illegal to set out covered e-waste with trash or recycling. Use a drop-off, a retailer, a SAFE event, or a manufacturer take-back. Phones and laptops are on the list.",
      },
      austin: {
        stream: "special",
        setout: ausDrop,
        note: "Electronics do not go in the blue cart. Schedule a bulk collection or use a drop-off.",
      },
      baseline: {
        stream: "special",
        setout: baseDrop,
        note: "Do not assume a curbside cart takes electronics. Use a retailer, a municipal drop-off, or a manufacturer take-back.",
      },
    },
  },
  {
    id: "food-scraps",
    name: "Leftovers",
    aliases: ["leftovers", "food waste", "food scraps", "plate", "meal", "scraps"],
    families: [],
    materialId: "food",
    weightKg: 0.25,
    weightNote:
      "Default is 250 g wet, a small plate. WARM food factors are per wet short ton, so water counts. Edit it.",
    prep: [
      "Eat what can be eaten.",
      "No plastic wrap, no condiment packets, no liquids poured into the cart where the city forbids liquids.",
      "Meat and bones are accepted in the organics carts of these four cities.",
    ],
    why: "The largest WARM credit on a plate of mixed food is not wasting it. Composting avoids landfill methane and is still several times smaller than source reduction, because source reduction includes the emissions of producing the food.",
    reuse: {
      level: "high",
      summary:
        "For food, reuse means it got eaten. Freeze it, pack it, or give it to a person. Compost is the highest use left for what nobody can eat — not the highest use of the food.",
      actions: [
        {
          title: "Eat it or share it",
          detail: "Log reuse. This uses WARM source reduction for mixed food waste.",
        },
        {
          title: "Nobody can eat it",
          detail: "Compost it where the city takes food. That is a smaller credit, and it is the right cart.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "compost",
        setout: sfGreen,
        note: "Recology’s green cart takes leftovers, spoiled food, meat, bones, and seafood. No liquids.",
      },
      seattle: {
        stream: "compost",
        setout: seaCompost,
        note: "All food scraps go in the food and yard cart, including meat and dairy. Plastic stays out.",
      },
      nyc: {
        stream: "compost",
        setout: nycCompost,
        note: "All food scraps, including meat, bones, and dairy, go in the compost setout. Separation is mandatory.",
      },
      austin: {
        stream: "compost",
        setout: ausGreen,
        note: "Cooked food, meat, dairy, and scraps go in the green cart. No plastic.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "No organics cart is assumed. A home pile or a real program can be logged as compost. Trash is the baseline until you know.",
      },
    },
  },
  {
    id: "glass-container",
    name: "Glass jar or bottle",
    aliases: ["glass jar", "glass bottle", "jar", "wine bottle", "beer bottle"],
    families: ["white"],
    materialId: "glass",
    weightKg: 0.3,
    weightNote:
      "Default is 300 g, an empty everyday jar. A 750 mL wine bottle is often 400–500 g. Edit it.",
    prep: [
      "Empty it and rinse it.",
      "Metal lids can be recycled as metal.",
      "Drinking glasses, windows, and Pyrex are not this item. Those are trash or the ceramic path.",
    ],
    why: "A jar that still seals is a container you do not have to buy. Recycling glass saves less carbon per kilogram than almost any other curbside material, so reuse matters more here than it does for an aluminum can.",
    reuse: {
      level: "high",
      summary:
        "Wash it and keep it for leftovers or dry goods. Log reuse if it replaces another container. Recycle it when it is cracked or you truly have enough jars.",
      actions: [
        {
          title: "Keep the jar",
          detail: "A sealing jar is a container. That is the reuse.",
        },
        {
          title: "Recycle the glass",
          detail: "Bottles and jars only. Not a drinking glass.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    climateCaveat:
      "Glass source reduction applies if the jar replaces a container you would have bought. Recycling uses the smaller glass recycling factor.",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Glass bottles and jars only, in the blue cart. Not mirrors, windows, or drinkware.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Glass bottles and jars are recycling. Drink glasses and window glass are not.",
      },
      nyc: {
        stream: "recycle",
        setout: nycMgp,
        note: "Glass jars and bottles go with metal and rigid plastic. Ceramic dishes and drinking glasses are trash.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Glass bottles and jars go in the blue cart.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Many US programs still take bottles and jars. Some cities have dropped glass. Confirm if you are not in one of the four cities.",
      },
    },
  },
  {
    id: "hdpe-jug",
    name: "HDPE jug",
    aliases: ["milk jug", "detergent jug", "hdpe", "laundry jug", "jug"],
    families: ["white", "blue"],
    materialId: "hdpe",
    weightKg: 0.06,
    weightNote: "Default is 60 g, an empty gallon HDPE jug. Edit it.",
    prep: ["Empty it.", "A quick rinse is enough.", "The cap can stay on in these four cities.", "No bag."],
    why: "Rigid HDPE is a normal curbside plastic. This row is not a shopping bag. Film has its own item because the factor and the cart both change.",
    reuse: {
      level: "low",
      summary: "A milk jug is a weak refill. Empty it and recycle the rigid plastic.",
      actions: [{ title: "Recycle the jug", detail: "Rigid HDPE only. Bags are the film item." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Jugs and detergent bottles go in the blue cart. Leave the cap on.",
      },
      seattle: {
        stream: "recycle",
        setout: seaRecycle,
        note: "Jugs are on the plastic bottle, jug, and tub list.",
      },
      nyc: {
        stream: "recycle",
        setout: nycMgp,
        note: "Rigid HDPE jugs go with metal, glass, plastic, and cartons.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Hard plastic jugs go in the blue cart.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Rigid HDPE jugs are standard curbside recycling. Film is not.",
      },
    },
  },
  {
    id: "pp-tub",
    name: "Yogurt cup",
    aliases: ["yogurt", "yogurt cup", "tub", "margarine tub", "pp tub"],
    families: ["white"],
    materialId: "pp",
    weightKg: 0.012,
    weightNote: "Default is 12 g, an empty single-serve PP tub. A large family tub is heavier and may clear Seattle’s size rule. Edit it.",
    prep: ["Empty it and rinse it.", "The foil lid is not the tub.", "Check the size if you are in Seattle."],
    why: "A single-serve yogurt cup is rigid PP, which several cities recycle, and it is also small enough to fall through Seattle’s sort. The same plastic is not the same cart.",
    reuse: {
      level: "low",
      summary: "A yogurt cup is a weak container once it is empty. The useful question is whether your city can sort something this small.",
      actions: [{ title: "Check the size", detail: "Seattle’s 3-inch rule sends a typical single-serve cup to the garbage." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Recology lists tubs and lids, including yogurt containers, in the blue cart.",
      },
      seattle: {
        stream: "landfill",
        setout: seaGarbage,
        note: "Seattle wants recycling larger than 3 inches because smaller pieces fall through the equipment. A typical single-serve yogurt cup is garbage. A tub larger than 3 inches can be recycling — if yours is, log recycle and edit the weight.",
      },
      nyc: {
        stream: "recycle",
        setout: nycMgp,
        note: "Rigid plastic tubs go with metal, glass, plastic, and cartons.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Jars and tubs are listed as hard plastic for the blue cart.",
      },
      baseline: {
        stream: "recycle",
        setout: baseRecycle,
        note: "Many programs take PP tubs. Some reject small cups. Seattle is the worked example in this app.",
      },
    },
  },
  {
    id: "plastic-utensil",
    name: "Plastic utensil",
    aliases: ["fork", "spoon", "plastic fork", "utensil", "plastic spoon"],
    families: [],
    materialId: "pp",
    weightKg: 0.005,
    weightNote: "Default is 5 g, one polypropylene fork. Edit it.",
    prep: ["Scrape food off.", "Do not bag a handful of them inside a plastic bag."],
    why: "A fork is a few grams of rigid plastic. San Francisco lists plastic utensils as recycling. Seattle’s size rule and Austin’s published examples do not. The object is identical. The cart is not.",
    reuse: {
      level: "low",
      summary: "Washing a disposable fork for one more meal is a weak reuse. The better upstream move is a metal fork. This fork still has to land somewhere.",
      actions: [{ title: "Sort the one you have", detail: "The city list decides. A metal fork would have been the reuse." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Recology lists plastic utensils in the blue cart. Not compostable-plastic claims, and not foam.",
      },
      seattle: {
        stream: "landfill",
        setout: seaGarbage,
        note: "Pieces smaller than 3 inches fall through the recycling sort. A fork is garbage in Seattle.",
      },
      nyc: {
        stream: "recycle",
        setout: nycMgp,
        note: "Rigid plastic is set out with metal, glass, plastic, and cartons. This is not a soft plastic wrapper.",
      },
      austin: {
        stream: "landfill",
        setout: ausTrash,
        note: "Austin’s hard-plastic examples are bottles, jars, tubs, and larger items. A utensil is not on that list, so the conservative landing is the trash cart.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "Plastic utensils are not universally accepted. Many programs reject them as too small. Trash is the baseline.",
      },
    },
  },
  {
    id: "plastic-film",
    name: "Plastic bag or wrap",
    aliases: ["plastic bag", "grocery bag", "film", "wrap", "chip bag", "bubble wrap", "mailer"],
    families: ["white", "blue"],
    materialId: "ldpe",
    weightKg: 0.006,
    weightNote: "Default is 6 g, one grocery bag. A mailer or a handful of film weighs more. Edit it.",
    prep: [
      "Never put loose film in a curbside recycling cart. It wraps the sorting equipment.",
      "A store bin wants film that is clean and dry.",
      "A chip bag with a metal lining is a worse candidate than a grocery bag. When unsure, trash beats the blue cart.",
    ],
    why: "Film is the most common cart contaminant. WARM does not publish a recycling factor for LDPE, so a store drop-off counts as kilograms and not as CO2e.",
    reuse: {
      level: "medium",
      summary:
        "Use the bag again as a bag if it is clean. That is a small source reduction only when it replaces a new bag. A dirty wrap has no second life.",
      actions: [
        {
          title: "Use the bag again",
          detail: "Log reuse if it replaces a new bag.",
        },
        {
          title: "It is spent",
          detail: "Store bin where the city points you there. Otherwise trash. Not the blue cart.",
        },
      ],
    },
    reuseColumn: "source-reduction",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "special",
        setout: sfDrop,
        note: "Clean, dry bags and wrap go back to a supermarket. California stores that sell bags take them. A bag in the blue or green cart is contamination.",
      },
      seattle: {
        stream: "landfill",
        setout: seaGarbage,
        note: "Seattle Public Utilities puts plastic bags, wraps, and wrappers in the garbage. In the recycling cart they jam the sort.",
      },
      nyc: {
        stream: "landfill",
        setout: nycTrash,
        note: "DSNY lists soft plastics — bags, bubble wrap, mailers, wrappers — as trash.",
      },
      austin: {
        stream: "special",
        setout: ausDrop,
        note: "Not the blue cart and not the green cart. Austin points film to participating stores or the Recycle & Reuse Center.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "Film is a top curbside contaminant. Some grocery chains offer a film bin. Log drop-off if you use one. Do not use the rigid-plastic factor for a bag.",
      },
    },
  },
  {
    id: "coffee-cup",
    name: "Paper coffee cup",
    aliases: ["coffee cup", "paper cup", "hot cup", "to-go cup"],
    families: ["white", "kraft"],
    materialId: "mixed-paper",
    weightKg: 0.015,
    weightNote: "Default is 15 g, an empty lined paper hot cup, lid off. Edit it.",
    prep: [
      "Empty it.",
      "The plastic lid is a separate rigid plastic in cities that take lids.",
      "A ceramic mug is the reuse. This cup is already used.",
    ],
    why: "The plastic lining is why cities disagree. San Francisco’s list includes empty coffee cups in recycling. Austin lists coated paper cups. Seattle and New York do not treat that lining as paper.",
    reuse: {
      level: "low",
      summary:
        "The reuse happened before you bought this cup. A ceramic mug is a different item. This cup is a used cup, and the city decides whether the lining is recycling or trash.",
      actions: [
        {
          title: "Sort the used cup",
          detail: "Do not call a single-use cup reuse after the fact.",
        },
      ],
    },
    reuseColumn: "none",
    specialColumn: "none",
    climateCaveat:
      "Where a city recycles this cup, the factor is WARM mixed paper (primarily residential). The polyethylene lining is not a separate row, so the number is an approximation.",
    rules: {
      sf: {
        stream: "recycle",
        setout: sfBlue,
        note: "Recology lists empty, clean coffee cups in recycling, and plastic coffee-cup lids with rigid plastic. Empty it first.",
      },
      seattle: {
        stream: "landfill",
        setout: seaGarbage,
        note: "Seattle keeps plastic-coated food packaging out of compost and does not list coffee cups with paper recycling. Garbage is the landing.",
      },
      nyc: {
        stream: "landfill",
        setout: nycTrash,
        note: "A plastic-lined hot cup is not on DSNY’s mixed-paper list. Trash is the conservative landing. Do not put it in the compost — the lining is plastic.",
      },
      austin: {
        stream: "recycle",
        setout: ausBlue,
        note: "Austin lists coated paper cups with blue-cart paper. Empty it. The sleeve, if it is plain paper, can go with it.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "Lined paper cups are not universal recycling. Trash is the baseline until your hauler lists them.",
      },
    },
  },
  {
    id: "paper-napkin",
    name: "Soiled napkin or paper towel",
    aliases: ["napkin", "paper towel", "tissue", "paper plate", "soiled paper"],
    families: ["white"],
    materialId: "mixed-paper",
    weightKg: 0.008,
    weightNote: "Default is 8 g, a few soiled napkins. Edit it.",
    prep: [
      "No plastic coating and no foil.",
      "Food on the paper is fine where the city composts soiled paper.",
      "Do not recycle a greasy napkin. It contaminates clean paper.",
    ],
    why: "Soiled paper is compost in the four cities and trash under the baseline. WARM has no composting factor for paper grades, so the kilograms count and the CO2e stays blank.",
    reuse: {
      level: "low",
      summary: "A used napkin is not a second product. Compost it where the city takes soiled paper.",
      actions: [{ title: "Compost or trash", detail: "Clean office paper is the other item. This one is soiled." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "compost",
        setout: sfGreen,
        note: "Paper napkins, tissues, and towels are soiled paper for the green cart.",
      },
      seattle: {
        stream: "compost",
        setout: seaCompost,
        note: "Food-soiled paper, napkins, and paper towels go in the compost cart. No plastic coating.",
      },
      nyc: {
        stream: "landfill",
        setout: nycTrash,
        note: "DSNY’s trash list includes soft tissues, napkins, and paper towels. Greasy pizza boxes are compost; a napkin is not given that same sentence. Trash is the landing used here.",
      },
      austin: {
        stream: "compost",
        setout: ausGreen,
        note: "Napkins, paper towels, and tissues are listed with food-soiled paper for the green cart when they are paper, not plastic-coated.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "No organics cart is assumed. Do not put soiled paper in recycling.",
      },
    },
  },
  {
    id: "foam-container",
    name: "Foam clamshell",
    aliases: ["styrofoam", "foam", "clamshell", "polystyrene", "packing peanut"],
    families: ["white"],
    materialId: "ps",
    weightKg: 0.01,
    weightNote: "Default is 10 g, a foam takeout clamshell. Peanuts weigh less per piece. Edit it.",
    prep: [
      "Do not put foam in a recycling cart.",
      "Clean packing peanuts can go back to a shipping store. A food clamshell generally cannot.",
    ],
    why: "Foam is trash in these four curbside programs. WARM has no recycling factor for polystyrene, so there is no climate credit to invent.",
    reuse: {
      level: "low",
      summary:
        "A food clamshell is spent. Clean packing peanuts are the exception: a shipping store may reuse them. That is a drop-off, and it still has no WARM recycling factor.",
      actions: [
        {
          title: "Trash the clamshell",
          detail: "Not the blue cart.",
        },
      ],
    },
    reuseColumn: "none",
    specialColumn: "none",
    rules: {
      sf: {
        stream: "landfill",
        setout: sfBlack,
        note: "Styrofoam is on Recology’s do-not-recycle list. Peanuts can go to a shipping store for reuse. A food clamshell is the black cart.",
      },
      seattle: {
        stream: "landfill",
        setout: seaGarbage,
        note: "Foam trays, cups, and blocks are garbage. Seattle has a separate optional setout for bagged foam blocks at the curb in some guides; a food clamshell is still garbage.",
      },
      nyc: {
        stream: "landfill",
        setout: nycTrash,
        note: "DSNY lists foam and packing peanuts as trash.",
      },
      austin: {
        stream: "landfill",
        setout: ausTrash,
        note: "Foam is called out as a hard-to-recycle contaminant, not a blue-cart material.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "Polystyrene food packaging is trash in most curbside programs.",
      },
    },
  },
  {
    id: "alkaline-battery",
    name: "Alkaline battery",
    aliases: ["alkaline", "aa battery", "aaa battery", "household battery", "battery"],
    families: [],
    materialId: "none",
    weightKg: 0.023,
    weightNote: "Default is 23 g, about one alkaline AA cell. Edit it.",
    prep: [
      "Do not put any battery in a recycling cart. They start fires.",
      "Tape the terminals of 9-volt and D cells if your city tells you to.",
      "Lithium and rechargeable cells are the other battery item. Do not mix the advice.",
    ],
    why: "Alkaline cells are the rare battery a city may allow in the trash. New York does. Seattle bans them from the garbage. The safe universal mistake to avoid is the recycling cart.",
    caution: "If the cell is lithium, rechargeable, or swollen, stop and use the lithium item. The trash advice does not apply.",
    reuse: {
      level: "low",
      summary: "A spent alkaline cell is not reusable. The decision is drop-off versus the trash rule in your city.",
      actions: [{ title: "Do not recharge it", detail: "Single-use alkaline cells are not a second-life product." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    climateCaveat:
      "Household batteries are not a WARM v16 material. Kilograms kept out of a cart are counted. CO2e is left blank.",
    rules: {
      sf: {
        stream: "special",
        setout: sfDrop,
        note: "Batteries do not go in the blue, green, or black cart. Recology and SF Environment point households to pharmacies, hardware stores, and battery drop-offs.",
      },
      seattle: {
        stream: "special",
        setout: seaDrop,
        note: "Seattle bans alkaline batteries from the garbage, along with rechargeable and button cells. Use a battery drop-off or a transfer station.",
      },
      nyc: {
        stream: "landfill",
        setout: nycTrash,
        note: "DSNY allows household alkaline batteries (AA, AAA, C, D, 9-volt) in the trash. Tape D and 9-volt terminals. Drop-off sites also accept them. Lithium and rechargeable batteries are illegal in the trash — that is the other item.",
      },
      austin: {
        stream: "special",
        setout: ausDrop,
        note: "Austin says batteries never go in trash, recycling, or compost carts. Use a library branch, the Recycle & Reuse Center, or on-demand household-hazardous pickup.",
      },
      baseline: {
        stream: "special",
        setout: baseDrop,
        note: "Many places allow alkaline cells in the trash. Looktwice’s baseline still points you to a battery bin and tells you to confirm. Never the recycling cart.",
      },
    },
  },
  {
    id: "lithium-battery",
    name: "Lithium or rechargeable battery",
    aliases: ["lithium", "lithium-ion", "rechargeable battery", "li-ion", "lithium battery"],
    families: [],
    materialId: "none",
    weightKg: 0.045,
    weightNote: "Default is 45 g, about one 18650 cell. A phone battery is lighter. A power-tool pack is heavier. Edit it.",
    prep: [
      "Tape the terminals or bag the cell by itself.",
      "Do not put it in trash or recycling.",
      "Do not toss a swollen cell in a drawer full of paper.",
    ],
    why: "These cells cause truck and facility fires. Every city in this app keeps them out of carts. New York State also makes retailers that sell rechargeable batteries take them back.",
    caution: "This is a safety rule, not a style of recycling. The climate factor is blank on purpose.",
    reuse: {
      level: "low",
      summary: "Use the charge it still has, then take the cell to a drop-off. Do not invent a second life for a damaged cell.",
      actions: [{ title: "Drop it off", detail: "Tape the terminals. Not a cart." }],
    },
    reuseColumn: "none",
    specialColumn: "none",
    climateCaveat:
      "Lithium and rechargeable batteries are not a WARM v16 material. The log counts the mass diverted from a cart and does not estimate CO2e.",
    rules: {
      sf: {
        stream: "special",
        setout: sfDrop,
        note: "Lithium and rechargeable batteries stay out of every cart. Use a battery drop-off. Tape terminals.",
      },
      seattle: {
        stream: "special",
        setout: seaDrop,
        note: "Banned from garbage and recycling. Drop-off or transfer station. Tape terminals.",
      },
      nyc: {
        stream: "special",
        setout: nycDrop,
        note: "Illegal in the trash and in recycling. Stores that sell rechargeable batteries must take them back. Special-waste sites and SAFE events take them too. Tape or bag each cell.",
      },
      austin: {
        stream: "special",
        setout: ausDrop,
        note: "Never a cart. On-demand hazardous pickup, the Recycle & Reuse Center, or a battery drop-off.",
      },
      baseline: {
        stream: "special",
        setout: baseDrop,
        note: "Do not trash lithium or rechargeable cells. Use Call2Recycle or a municipal hazardous-waste site. Tape the terminals.",
      },
    },
  },
  {
    id: "textile",
    name: "Clothing or textile",
    aliases: ["shirt", "t-shirt", "clothes", "clothing", "textile", "jacket", "jeans", "towel"],
    families: [],
    materialId: "none",
    weightKg: 0.18,
    weightNote: "Default is 180 g, a typical adult cotton T-shirt. Jeans and coats weigh more. Edit it.",
    prep: [
      "Clean enough to handle. Stained and torn is still usually donatable.",
      "Wet, moldy, hazardous, or insect-infested textiles should be trashed so they do not ruin a donation bale.",
      "Not the recycling cart.",
    ],
    why: "Clothes are not curbside recycling in these cities. Donation is the path, including a lot of damaged clothing. WARM has no apparel row, so the climate cell stays blank instead of borrowing carpet.",
    reuse: {
      level: "high",
      summary:
        "Wear it, mend it, or donate it. King County’s textile guidance, which Seattle points people toward, accepts ripped and stained clothes. The cart is the wrong ending for a dry shirt.",
      actions: [
        {
          title: "Wear, mend, or donate",
          detail: "Log reuse. Mass counts. CO2e stays blank.",
        },
        {
          title: "Wet, moldy, or infested",
          detail: "Trash it so it does not contaminate a donation.",
        },
      ],
    },
    reuseColumn: "none",
    specialColumn: "none",
    climateCaveat:
      "WARM v16 has no apparel row. Carpet is a different product and is not used as a proxy. Donated clothing counts as kilograms diverted, with CO2e left blank.",
    rules: {
      sf: {
        stream: "special",
        setout: sfDrop,
        note: "Recology tells residents to donate clothing and fabric, not to cart it. Shoes have separate reuse and recycling options on the city’s eco-finder.",
      },
      seattle: {
        stream: "special",
        setout: "Donate. Threadcycle drop boxes, thrift stores, or a collection truck. Not a cart.",
        note: "Seattle and King County treat nearly all dry clothing, shoes, and linens as donation, including damaged items. Wet, mildewed, hazardous, or infested textiles are garbage.",
      },
      nyc: {
        stream: "special",
        setout: "Donate to a thrift or textile collector. Not the paper recycling and not the metal, glass, and plastic setout.",
        note: "Clothing is not DSNY curbside recycling. Donation is the path for anything dry enough to handle.",
      },
      austin: {
        stream: "special",
        setout: ausDrop,
        note: "Textiles are not blue-cart material. Donate what a person or a textile collector will take. The Recycle & Reuse Center is the municipal backstop for hard-to-recycle goods.",
      },
      baseline: {
        stream: "special",
        setout: baseDrop,
        note: "Do not put clothes in curbside recycling. Donate dry textiles. Trash only what would contaminate a donation.",
      },
    },
  },
  {
    id: "ceramic",
    name: "Ceramic mug or dish",
    aliases: ["mug", "ceramic", "plate", "bowl", "dish", "pyrex"],
    families: ["white"],
    materialId: "none",
    weightKg: 0.35,
    weightNote: "Default is 350 g, a mug. A dinner plate is often heavier. Edit it.",
    prep: [
      "If it still holds food or coffee, it is not waste.",
      "Broken ceramic is trash. It is not glass recycling.",
      "A chipped mug that still works can stay in the cupboard.",
    ],
    why: "Glass bottles and ceramic mugs look related and are sorted nothing alike. Putting a mug in the glass bin contaminates glass. Keeping the mug is the actual waste decision.",
    reuse: {
      level: "high",
      summary:
        "A mug that holds coffee is already doing its job. Drink from it. Recycle-shaped thinking is how intact dishes become trash. Broken shards are landfill, and there is no WARM row for them.",
      actions: [
        {
          title: "Keep using it",
          detail: "Log reuse. The climate factor is blank. The mass is real.",
        },
        {
          title: "It is in pieces",
          detail: "Trash. Not the glass bin.",
        },
      ],
    },
    reuseColumn: "none",
    specialColumn: "none",
    climateCaveat:
      "Ceramics are not a WARM v16 material. Glass factors are not borrowed. A mug you keep is counted in kilograms only.",
    rules: {
      sf: {
        stream: "landfill",
        setout: sfBlack,
        note: "Ceramic dishware is on the do-not-recycle list. The black cart is for the broken piece, not for a mug you are tired of.",
      },
      seattle: {
        stream: "landfill",
        setout: seaGarbage,
        note: "Broken dishes are garbage. Bottles and jars are the only glass in the recycling cart.",
      },
      nyc: {
        stream: "landfill",
        setout: nycTrash,
        note: "DSNY lists dishes, cups, and mugs — ceramics and glassware — as trash.",
      },
      austin: {
        stream: "landfill",
        setout: ausTrash,
        note: "Drinkware and dishes are not the glass bottles and jars in the blue cart.",
      },
      baseline: {
        stream: "landfill",
        setout: baseTrash,
        note: "Ceramics are trash when they are truly broken. They are not glass recycling.",
      },
    },
  },
];

const BY_ID = new Map(items.map((item) => [item.id, item]));

export function getItem(id: string): Item | undefined {
  return BY_ID.get(id);
}

export function requireItem(id: string): Item {
  const item = BY_ID.get(id);
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}

export const FEATURED_SAMPLE_IDS = [
  "pizza-box",
  "produce",
  "food-scraps",
  "alkaline-battery",
  "coffee-cup",
  "plastic-film",
  "textile",
  "phone",
] as const;

export function resolveRule(itemId: string, localityId: string) {
  const item = getItem(itemId);
  const localityOk = item?.rules[localityId as LocalityId];
  if (!item || !localityOk) return null;
  return { item, rule: localityOk };
}
