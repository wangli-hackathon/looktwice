# Looktwice — Devpost draft

Arbiter Hacks V1 · Rethinking Waste · solo student project

**Live demo:** https://wangli-hackathon.github.io/looktwice/

The GitHub Pages build has the core sorter, city rules, on-device log, and WARM math. The optional LLM wording rewrite needs a server deploy and is not in the static demo.

## What it does

Looktwice is the pause before the bin. You type an object, pick one from a sample tray, or give it a photo. The app asks whether it should stay in use, then names the cart for the city you actually live in: San Francisco, Seattle, New York, Austin, or a conservative US baseline that assumes no organics program.

A greasy pizza box is compost in all four cities and trash under the baseline. A single-serve yogurt cup is recycling in San Francisco and garbage in Seattle, because Seattle’s sort line drops pieces under 3 inches. An alkaline battery may go in the trash in New York and is banned from the garbage in Seattle. A lithium cell is a drop-off everywhere in the catalog, because it starts fires.

The choice is logged on the device. The log shows kilograms diverted from the landfill and a CO2e figure only when EPA’s Waste Reduction Model, version 16, has a factor for that material and that path. Composted cardboard, plastic film, clothing, ceramics, and household batteries count as mass and leave the climate cell blank. Eating leftovers uses WARM’s source-reduction factor and is several times the credit for composting the same plate. Composting mixed yard trimmings is allowed to show as a small increase versus landfilling, because that is what WARM says.

No account. No paid key. The photo never leaves the browser.

## How we built it

Next.js, TypeScript, and a small set of shadcn/ui controls. The catalog, the city rules, the classifier, and the climate math are plain TypeScript with Vitest on top.

Classification is a cascade that fails closed. A sample or a typed name is certain. A file name can match an alias. An optional MobileNet model runs in the browser and is mapped through a fixed ImageNet table. A color guess from downsampled pixels always asks for confirmation. If nothing matches, the app does not invent a bin.

Impact math subtracts WARM’s landfilling factor from the factor for the path you logged, then converts metric tons of CO2e per short ton into kilograms with 907.18474 kg per short ton. Source reduction uses the current-mix column. The mile line uses the EPA equivalency of 0.393 kg CO2e per mile for a gasoline passenger vehicle.

An optional `POST /api/enhance` route calls an OpenAI-compatible model when `LLM_API_KEY` is set. The prompt forbids a different stream. The badge on screen is still the rule table.

## How impact is measured

Looktwice measures impact as mass diverted from the landfill and as greenhouse-gas emissions relative to landfilling, using the US Environmental Protection Agency Waste Reduction Model, version 16 (December 2023). For a logged decision, the app takes the WARM net emission factor for the path actually chosen — source reduction at the current mix of inputs when reuse avoids a new purchase, recycling, or composting — subtracts that material’s WARM landfilling factor, and converts the difference from metric tons of CO2e per short ton into kilograms of CO2e with the factor 1 short ton = 907.18474 kg. A negative result is reported as emissions avoided. Kilograms still count as diverted when you reuse, recycle, compost, or use a real drop-off even if WARM has no factor: plastic film, composted cardboard, clothing, ceramics, and household batteries are in that group on purpose, so the climate total cannot be inflated with a borrowed number. Food is entered on a wet-weight basis, which is how WARM states it, and the default grams are editable reference weights rather than measurements. The mile comparison divides avoided kilograms by 0.393 kg CO2e per mile, the EPA equivalency for a gasoline passenger vehicle in the November 2024 calculator update. The arithmetic is there to keep the order of operations honest: eating edible food or keeping a phone in use moves the WARM numbers more than parking the same object in the right cart, and composting mixed yard trimmings does not even win on greenhouse gases against landfilling. Diversion and climate are both shown because they are not the same claim.

## What's next

- More cities, read from the same kind of primary page, with the snapshot date on the card.
- A way to point the log at a building’s actual hauler instead of a citywide default. Apartments already diverge, and the Rules page says so.
- A textile emission factor only if a citable one shows up. Until then the shirt stays blank.
- A Node deploy of the optional language-model rewrite when a key is available. The static GitHub Pages demo keeps the rule-table wording; the bin will still come from the table either way.

Built for a deadline of December 21, 2026. The rule snapshot is November 2026. Re-read the city pages before submitting.
