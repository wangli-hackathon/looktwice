/**
 * Battery fire check — built during SafeSpace Hacks (Nov 2026).
 *
 * Objects that hide a battery. Every rule here is a drop-off: no cart,
 * in any city, for anything that has (or might have) a cell inside.
 * City wording is taken from the same city pages Looktwice already cites;
 * federal wording is from EPA's "Used Lithium-Ion Batteries" page.
 */
import type { Item } from "@/lib/items";
import type { CityRule, LocalityId } from "@/lib/types";

export type BatteryKind = "built-in" | "maybe";

export const BATTERY_SETOUT: Record<LocalityId, string> = {
  sf: "Not a cart. Take it to a battery or e-waste drop-off, or a store take-back.",
  seattle:
    "Banned from the garbage and from recycling. Use a battery drop-off or a transfer-station collection.",
  nyc: "Special-waste drop-off, a SAFE event, or a store that sells rechargeable batteries. Not trash and not recycling.",
  austin:
    "Recycle & Reuse Drop-off Center, a library or store battery bin, or an on-demand household-hazardous pickup. Not a cart.",
  baseline:
    "A battery or electronics drop-off, or a household hazardous waste site. Not the trash and not the recycling cart.",
};

export const BATTERY_NOTE: Record<LocalityId, string> = {
  sf: "Recology and SF Recycles keep batteries and electronics out of the blue, green, and black carts. A battery inside a device counts.",
  seattle:
    "Seattle bans batteries (as Washington’s Dangerous Waste Regulations define them) and covered electronics from the garbage.",
  nyc: "DSNY: lithium and rechargeable batteries are illegal in trash and recycling. Every store in New York State that sells rechargeable batteries, or products containing them, must take rechargeable batteries back.",
  austin:
    "Austin says batteries never go in trash, recycling, or compost carts. A battery left in a cart in summer heat can start a fire in the truck or at the facility.",
  baseline:
    "EPA: lithium-ion batteries, and devices containing them, should not go in household garbage or recycling bins. Take them to a battery recycler or household hazardous waste collection. Call2Recycle and Earth911 list locations.",
};

const BATTERY_PREP = [
  "Tape the terminals with non-conductive tape (electrical tape), or put it in its own plastic bag.",
  "Bag each battery or device by itself. Do not drop loose cells in a jar together.",
  "Do not crush, puncture, or squeeze it into a full bag.",
];

const SWOLLEN_PREP = "If it is swollen or warm, keep it away from paper and anything else that burns.";

export function batteryRule(locality: LocalityId, extra?: string): CityRule {
  return {
    stream: "special",
    setout: BATTERY_SETOUT[locality],
    note: extra ? `${BATTERY_NOTE[locality]} ${extra}` : BATTERY_NOTE[locality],
  };
}

function batteryRules(extra?: Partial<Record<LocalityId, string>> & { all?: string }) {
  const ids: LocalityId[] = ["sf", "seattle", "nyc", "austin", "baseline"];
  return Object.fromEntries(
    ids.map((id) => [id, batteryRule(id, extra?.[id] ?? extra?.all)]),
  ) as Record<LocalityId, CityRule>;
}

const NO_CLIMATE =
  "Batteries are not a WARM v16 material. The log counts the object as kept out of a cart and leaves CO2e blank.";

type BuiltIn = Omit<
  Item,
  "families" | "reuseColumn" | "specialColumn" | "rules" | "battery" | "materialId"
> & {
  families?: Item["families"];
  materialId?: string;
  rules?: Item["rules"];
  specialColumn?: Item["specialColumn"];
  reuseColumn?: Item["reuseColumn"];
};

function builtIn(spec: BuiltIn, extra?: Parameters<typeof batteryRules>[0]): Item {
  return {
    families: [],
    materialId: "none",
    reuseColumn: "none",
    specialColumn: "none",
    climateCaveat: NO_CLIMATE,
    rules: batteryRules(extra),
    battery: "built-in",
    ...spec,
  };
}

/**
 * `lookup` gives access to the base catalog so a "maybe" item can fall back to
 * the ordinary rule (shoes → textile, card → paper) only when the user says
 * there is no battery.
 */
export function makeBatteryItems(lookup: (id: string) => Item): Item[] {
  const textile = lookup("textile");
  const paper = lookup("office-paper");

  return [
    builtIn(
      {
        id: "power-bank",
        name: "Power bank",
        aliases: [
          "power bank",
          "powerbank",
          "portable charger",
          "battery pack",
          "phone battery pack",
          "charging bank",
          "mophie",
          "anker",
        ],
        weightKg: 0.2,
        weightNote: "Default is 200 g, a 10,000 mAh pocket power bank. Edit it.",
        prep: [...BATTERY_PREP, SWOLLEN_PREP],
        why: "A power bank is a lithium battery pack in a plastic case. Crushed in a truck or at a sorting plant, it can short and ignite.",
        caution: "Never in a cart, in any city in this app.",
        reuse: {
          level: "medium",
          summary:
            "If it still holds a charge and is not swollen, someone can use it. A damaged pack does not get a second life.",
          actions: [
            { title: "Still works, not swollen", detail: "Give it to someone who will use it." },
            { title: "Dead or damaged", detail: "Tape the port contacts, bag it alone, drop it off." },
          ],
        },
      },
      { nyc: "A power bank is a rechargeable battery, so the store take-back applies." },
    ),
    builtIn(
      {
        id: "disposable-vape",
        name: "Disposable vape",
        aliases: [
          "disposable vape",
          "vape",
          "vape pen",
          "puff bar",
          "elf bar",
          "disposable e cigarette",
          "disposable ecig",
        ],
        weightKg: 0.04,
        weightNote: "Default is 40 g, a typical disposable vape. Edit it.",
        prep: [
          "Do not try to open it or pull the battery out.",
          "Bag it by itself, or tape over the charging port and any exposed metal.",
          "Not the trash, not the recycling, not a street litter bin.",
        ],
        why: "Disposable does not mean battery-free. EPA lists e-cigarettes among products with lithium-ion cells, and names e-cigarettes among the most common sources of battery fires it found in waste facilities.",
        caution: "Never in a cart. The cell is sealed inside.",
        reuse: {
          level: "low",
          summary: "There is no safe second life for a used disposable vape. The safe move is a drop-off.",
          actions: [{ title: "Drop it off", detail: "Bag it alone. Battery or hazardous-waste drop-off." }],
        },
      },
      { all: "A disposable vape still contains its battery." },
    ),
    builtIn(
      {
        id: "e-cigarette",
        name: "Rechargeable e-cigarette",
        aliases: ["e cigarette", "e-cigarette", "ecig", "e cig", "vape mod", "refillable vape", "pod vape"],
        weightKg: 0.06,
        weightNote: "Default is 60 g, a pod-style device. A box mod is heavier. Edit it.",
        prep: [
          "If the battery is removable, take it out, tape its terminals, and bag it.",
          "If it is sealed in, bag the whole device by itself.",
          "Do not put it in a cart.",
        ],
        why: "EPA lists e-cigarettes among products with rechargeable lithium-ion cells.",
        caution: "Never in a cart.",
        reuse: {
          level: "low",
          summary: "Keep using a working device you already own instead of buying a disposable. When it is done, drop it off.",
          actions: [{ title: "Drop it off", detail: "Battery taped or the device bagged alone." }],
        },
      },
    ),
    builtIn(
      {
        id: "wireless-earbuds",
        name: "Wireless earbuds or headphones",
        aliases: [
          "wireless earbuds",
          "earbuds",
          "airpods",
          "wireless headphones",
          "bluetooth headphones",
          "bluetooth earbuds",
          "headphones",
          "earphones",
          "charging case",
        ],
        weightKg: 0.05,
        weightNote: "Default is 50 g, earbuds with their charging case. Over-ear headphones are heavier. Edit it.",
        prep: [...BATTERY_PREP.slice(1), "The charging case has its own battery. It goes too."],
        why: "Every bud and the charging case hold a small lithium-ion cell. EPA lists wireless headphones among products with lithium-ion batteries.",
        caution: "Never in a cart, even one bud.",
        reuse: {
          level: "medium",
          summary: "Many brands sell single replacement buds or take old ones back. A working pair can be passed on.",
          actions: [
            { title: "One bud lost", detail: "Replace the bud before you replace the set." },
            { title: "Dead", detail: "Drop off the buds and the case together." },
          ],
        },
      },
    ),
    builtIn(
      {
        id: "light-up-toy",
        name: "Light-up or talking toy",
        aliases: [
          "light up toy",
          "light-up toy",
          "talking toy",
          "toy with batteries",
          "electronic toy",
          "musical toy",
          "toy that lights up",
          "remote control car",
          "rc car",
        ],
        weightKg: 0.25,
        weightNote: "Default is 250 g, a small electronic toy. Edit it.",
        prep: [
          "Open the battery door if there is one. Take the cells out, tape them, and drop them off.",
          "If the battery is sealed in, the whole toy goes to the drop-off.",
          "With the battery out, the toy itself follows your city’s rule for electronics.",
        ],
        why: "If it lights up, talks, or moves, it has a battery. EPA lists children’s toys among products with lithium-ion cells, and DSNY lists toys among the uses of button-cell batteries.",
        caution: "Button cells are also a swallowing danger for small children. Keep loose cells out of reach.",
        reuse: {
          level: "high",
          summary: "A working toy can be handed down or donated. Take the batteries out first if it will sit in storage.",
          actions: [
            { title: "Still works", detail: "Pass it on." },
            { title: "Broken", detail: "Batteries out and taped. Drop off the toy as electronics." },
          ],
        },
      },
      { nyc: "DSNY: do not put button-cell or coin batteries in the trash or recycling." },
    ),
    {
      ...textile,
      id: "light-up-shoes",
      name: "Shoes with lights",
      aliases: [
        "light up sneakers",
        "light-up sneakers",
        "light up shoes",
        "light-up shoes",
        "shoes with lights",
        "led shoes",
        "led sneakers",
        "kids light up shoes",
      ],
      battery: "maybe",
      weightKg: 0.4,
      weightNote: "Default is 400 g, a pair of kids’ shoes. Edit it.",
      prep: [
        "Look inside the heel or under the insole for a battery or a charging port.",
        "If you cannot remove it, the whole pair goes to the battery drop-off.",
      ],
      why: "Shoes are a donation item. Shoes with lights carry a sealed battery in the sole, and that changes the answer to a battery drop-off.",
      caution: undefined,
      reuse: {
        level: "high",
        summary: "If the lights are dead but the shoes still fit someone, ask a donation site whether it takes them. If not, they go with the batteries.",
        actions: [
          { title: "Still wearable", detail: "Pass them on. The battery is sealed in the sole." },
          { title: "Worn out", detail: "Battery drop-off, not the trash." },
        ],
      },
    },
    {
      ...paper,
      id: "musical-greeting-card",
      name: "Greeting card with sound",
      aliases: [
        "musical greeting card",
        "greeting card with sound",
        "singing card",
        "sound card",
        "musical card",
        "birthday card that plays music",
        "card that plays music",
        "greeting card",
        "birthday card",
      ],
      battery: "maybe",
      reuseColumn: "none",
      climateCaveat:
        "Greeting cards with a sound module are not a WARM v16 material as a whole. CO2e is left blank.",
      weightKg: 0.06,
      weightNote: "Default is 60 g, a card with a sound module. A plain card is about 20 g. Edit it.",
      prep: [
        "Find the sound module, usually a flat plastic pod behind the back panel.",
        "Cut it out. The module, with its button cells, goes to a battery drop-off.",
        "Only the plain paper part follows the paper rule.",
      ],
      why: "A card that plays music has a button-cell battery inside. DSNY lists musical greeting cards among the uses of button cells and says they never go in trash or recycling.",
      caution: "Button cells are a swallowing danger for small children.",
      reuse: {
        level: "low",
        summary: "Keep the card if it matters to you. If it goes, the battery part and the paper part leave separately.",
        actions: [{ title: "Separate it", detail: "Sound module to a battery drop-off. Paper to recycling." }],
      },
    },
    builtIn(
      {
        id: "battery-gadget",
        name: "Gadget with a battery",
        aliases: [
          "gadget",
          "bluetooth speaker",
          "speaker",
          "electric toothbrush",
          "smartwatch",
          "smart watch",
          "fitness tracker",
          "game controller",
          "controller",
          "cordless drill",
          "cordless tool",
          "electric shaver",
          "shaver",
          "e reader",
          "kindle",
          "digital camera",
          "camera",
          "flashlight",
          "hoverboard",
          "handheld fan",
          "rechargeable",
          "cordless",
        ],
        weightKg: 0.3,
        weightNote: "Default is 300 g, a small rechargeable gadget. Edit it.",
        prep: [...BATTERY_PREP, SWOLLEN_PREP],
        why: "If it charges, it has a battery. EPA lists cell phones, power tools, digital cameras, laptops, toys, e-cigarettes, appliances, tablets and e-readers among products with lithium-ion cells.",
        caution: "Never in a cart.",
        reuse: {
          level: "high",
          summary: "A working gadget is worth more in someone’s hand than in a drop-off bin. Sell it, trade it in, or give it away.",
          actions: [
            { title: "Still works", detail: "Pass it on." },
            { title: "Dead", detail: "Battery drop-off or e-waste collection." },
          ],
        },
      },
    ),
    builtIn(
      {
        id: "swollen-battery",
        name: "Swollen phone or battery",
        aliases: [
          "swollen battery",
          "swollen phone",
          "bulging battery",
          "puffy battery",
          "battery swelling",
          "swollen laptop battery",
          "hot battery",
          "battery is hot",
          "spicy pillow",
          "damaged battery",
        ],
        weightKg: 0.2,
        weightNote: "Default is 200 g, a phone with a swollen battery. Edit it.",
        prep: [
          "Stop using and charging it.",
          "Do not press on it, puncture it, or try to flatten it.",
          SWOLLEN_PREP,
          "Ask the battery or device maker for handling instructions before you move it to a drop-off.",
        ],
        why: "A swollen lithium battery is a damaged battery. EPA tells consumers to contact the battery or device manufacturer for specific handling information when a lithium-ion battery is damaged.",
        caution: "This is the stop-handling path. Read the red card first.",
        reuse: {
          level: "low",
          summary: "A swollen battery has no second life. The device may be repairable after the battery is replaced by a repair shop.",
          actions: [{ title: "Do not reuse the cell", detail: "Repair shop or drop-off, after you have handling instructions." }],
        },
      },
      { all: "A damaged cell needs handling instructions first (EPA: contact the manufacturer)." },
    ),
  ];
}
