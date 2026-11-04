import { IMPACT_PARAGRAPH } from "@/lib/copy";
import {
  EQUIVALENCY_SOURCE,
  KG_CO2E_PER_VEHICLE_MILE,
  SHORT_TON_KG,
  WARM_ROWS,
  WARM_SOURCE,
} from "@/lib/factors";
import { formatDelta } from "@/lib/format";
import { climateFor } from "@/lib/impact";
import { requireItem } from "@/lib/items";

function cell(value: number | null): string {
  if (value === null) return "NA";
  return value.toFixed(2);
}

export function MethodArticle() {
  const can = climateFor(requireItem("aluminum-can"), "recycle", 0.0149);
  const eaten = climateFor(requireItem("food-scraps"), "reuse", 0.25);
  const composted = climateFor(requireItem("food-scraps"), "compost", 0.25);
  const yard = climateFor(requireItem("yard-trimmings"), "compost", 1);
  const pizza = climateFor(requireItem("pizza-box"), "compost", 0.2);

  return (
    <article className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-wide text-primary">How the number is made</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Impact, with the blanks left blank.</h1>

      <h2 className="mt-8 font-serif text-2xl">How impact is measured</h2>
      <p className="mt-3 text-base leading-7">{IMPACT_PARAGRAPH}</p>

      <h2 className="mt-8 font-serif text-2xl">The formula</h2>
      <p className="mt-3 font-mono text-sm leading-6">
        kg CO2e = weightKg × (factor_path − factor_landfill) × 1000 / {SHORT_TON_KG}
      </p>
      <p className="mt-3 text-sm leading-6">
        Factors are metric tons of CO2e per short ton from {WARM_SOURCE.title}. Source reduction
        uses the current-mix column, not the 100% virgin column. A negative result is emissions
        avoided. Landfilling a material that has a WARM row is the zero line. The mile line divides
        an avoided total by {KG_CO2E_PER_VEHICLE_MILE} kg CO2e per mile (
        <a className="underline" href={EQUIVALENCY_SOURCE.url}>
          {EQUIVALENCY_SOURCE.title}
        </a>
        ).
      </p>

      <h2 className="mt-8 font-serif text-2xl">Worked examples</h2>
      <ul className="mt-3 space-y-3 text-sm leading-6">
        <li>
          A 14.9 g aluminum can, recycled: {formatDelta(can.deltaKg).text}. Per kilogram the
          recycling credit is large. Per can it is small. Both are shown so neither gets to pretend.
        </li>
        <li>
          250 g of leftovers, eaten: {formatDelta(eaten.deltaKg).text}. The same plate composted:{" "}
          {formatDelta(composted.deltaKg).text}. Eating it is the bigger WARM credit because source
          reduction includes producing the food.
        </li>
        <li>
          1 kg of mixed yard trimmings, composted: {formatDelta(yard.deltaKg).text}. The landfilling
          factor is more negative than composting because of carbon storage. The log does not flip
          that sign.
        </li>
        <li>
          A 200 g greasy pizza box, composted where the city asks for it: {formatDelta(pizza.deltaKg).text}.{" "}
          {pizza.shortBasis}
        </li>
      </ul>

      <h2 className="mt-8 font-serif text-2xl">Factors in use</h2>
      <p className="mt-3 text-sm leading-6">
        MTCO2e per short ton. Parentheses in the EPA exhibit are the negatives below. Full
        documentation:{" "}
        <a className="underline" href={WARM_SOURCE.url}>
          WARM v16 management practices (PDF)
        </a>
        . Version notes:{" "}
        <a className="underline" href={WARM_SOURCE.versionsUrl}>
          EPA WARM versions
        </a>
        .
      </p>
      <div className="mt-3 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="bg-ink text-card">
            <tr>
              <th className="px-3 py-2 font-medium">WARM material</th>
              <th className="px-3 py-2 font-medium">Source reduction</th>
              <th className="px-3 py-2 font-medium">Recycling</th>
              <th className="px-3 py-2 font-medium">Composting</th>
              <th className="px-3 py-2 font-medium">Landfilling</th>
            </tr>
          </thead>
          <tbody>
            {WARM_ROWS.map((row) => (
              <tr key={row.id} className="border-t border-ink bg-card">
                <th className="px-3 py-2 font-medium">{row.warmName}</th>
                <td className="px-3 py-2 font-mono">{cell(row.sourceReduction)}</td>
                <td className="px-3 py-2 font-mono">{cell(row.recycling)}</td>
                <td className="px-3 py-2 font-mono">{cell(row.composting)}</td>
                <td className="px-3 py-2 font-mono">{cell(row.landfilling)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 font-serif text-2xl">What is refused</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
        <li>No apparel factor. Carpet is not a shirt.</li>
        <li>No battery factor. Alkaline and lithium cells are not WARM rows.</li>
        <li>No ceramic factor. Glass is not borrowed for a mug.</li>
        <li>No LDPE recycling factor. Rigid HDPE is not a plastic bag.</li>
        <li>No polystyrene recycling factor for a foam clamshell.</li>
        <li>No composting factor for corrugated cardboard or mixed paper. A pizza box does not inherit the food-waste number.</li>
        <li>No phone-specific life-cycle assessment. A device uses the mixed-electronics row per kilogram, and the screen says so.</li>
      </ul>

      <h2 className="mt-8 font-serif text-2xl">Weights</h2>
      <p className="mt-3 text-sm leading-6">
        Defaults are reference empty weights, or wet weights for food, and every one of them can be
        edited before it is logged. A 14.9 g aluminum can is a long-used reference for a 12 fl oz can,
        and newer cans are often lighter. Food includes water because WARM’s food factors are per wet
        short ton. The stored entry keeps the grams you confirmed.
      </p>

      <h2 className="mt-8 font-serif text-2xl">What this is not</h2>
      <p className="mt-3 text-sm leading-6">
        Not a hauler. Not a fine schedule. Not a claim that the right cart is the highest use. The
        waste hierarchy in this app is reuse, then the city’s stream, then landfill, and the climate
        math is allowed to disagree with the cart when WARM says so. Rules were read in November 2026
        and will go stale. Check the city page linked from the result.
      </p>
    </article>
  );
}
