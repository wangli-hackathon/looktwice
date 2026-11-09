"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Glyph } from "@/components/glyphs";
import { StreamBadge } from "@/components/stream-badge";
import { METHOD_LABEL, type ClassifyResult } from "@/lib/classify";
import { formatCo2eMagnitude, formatDelta, formatMiles, DECISION_LABEL } from "@/lib/format";
import { climateFor, milesEquivalent } from "@/lib/impact";
import { getItem } from "@/lib/items";
import { getLocality } from "@/lib/localities";
import type { ClassifyMethod, Decision } from "@/lib/types";

const press =
  "h-11 border-2 border-ink px-4 text-base shadow-[3px_3px_0_0_#1b1712]";

export function ResultCard({
  localityId,
  result,
  confirmedId,
  method,
  decision,
  gramsText,
  logged,
  guidance,
  modelState,
  ready,
  storageError,
  onConfirm,
  onDecision,
  onGrams,
  onLog,
}: {
  localityId: string;
  result: ClassifyResult;
  confirmedId: string | null;
  method: ClassifyMethod;
  decision: Decision | null;
  gramsText: string;
  logged: boolean;
  guidance: string | null;
  modelState: "idle" | "checking" | "rules" | "model" | "static";
  ready: boolean;
  storageError: string | null;
  onConfirm: (id: string, asSearch: boolean) => void;
  onDecision: (decision: Decision) => void;
  onGrams: (value: string) => void;
  onLog: () => void;
}) {
  const locality = getLocality(localityId);
  const guessed = result.itemId ? getItem(result.itemId) : undefined;
  const item = confirmedId ? getItem(confirmedId) : undefined;
  const grams = Number(gramsText);
  const gramsValid = Number.isFinite(grams) && grams > 0 && grams <= 50000;
  const weightKg = gramsValid ? grams / 1000 : item?.weightKg ?? 0;

  const rule = item && locality ? item.rules[locality.id] : null;
  const activeDecision = decision ?? rule?.stream ?? null;
  const climate =
    item && activeDecision && gramsValid ? climateFor(item, activeDecision, weightKg) : null;

  const reuseClimate =
    item && gramsValid ? climateFor(item, "reuse", weightKg) : null;
  const streamClimate =
    item && rule && gramsValid ? climateFor(item, rule.stream, weightKg) : null;
  const showCompare = Boolean(
    reuseClimate &&
      streamClimate &&
      rule &&
      rule.stream !== "landfill" &&
      (reuseClimate.deltaKg !== null || streamClimate.deltaKg !== null) &&
      reuseClimate.deltaKg !== null &&
      streamClimate.deltaKg !== null,
  );

  return (
    <article aria-live="polite" className="border-2 border-ink bg-card p-4 shadow-[6px_6px_0_0_#1b1712] sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="border-2 border-ink bg-background px-2 py-1 font-mono text-xs uppercase tracking-wide">
          {METHOD_LABEL[method]}
        </span>
        {result.confidence > 0 ? (
          <span className="font-mono text-xs text-muted-foreground">
            confidence {Math.round(result.confidence * 100)}%
          </span>
        ) : null}
      </div>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {result.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      {!item && guessed ? (
        <div className="mt-4">
          <h2 className="font-serif text-3xl tracking-tight">{guessed.name}</h2>
          <p className="mt-2 text-sm">
            This is a guess. Confirm it, or pick a nearer object, before anything is logged.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className={press} type="button" onClick={() => onConfirm(guessed.id, false)}>
              Yes, this is it
            </Button>
            {result.alternates.map((alternate) => {
              const alt = getItem(alternate.itemId);
              if (!alt) return null;
              return (
                <Button
                  key={alternate.itemId}
                  type="button"
                  variant="outline"
                  className={press}
                  onClick={() => onConfirm(alternate.itemId, true)}
                >
                  {alt.name}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!item && !guessed ? (
        <p className="mt-4 text-base">
          No catalog match. Type the object, or pick a sample. A photo that the rules cannot name should not invent a bin.
        </p>
      ) : null}

      {item && locality && rule ? (
        <div className="mt-4">
          <div className="flex items-start gap-3">
            <Glyph id={item.id} />
            <div>
              <h2 className="font-serif text-3xl leading-none tracking-tight">{item.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {locality.city} · {locality.hauler} · {locality.snapshot} snapshot
              </p>
            </div>
          </div>

          <section className="mt-5 border-2 border-ink bg-background p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-primary">Before a bin</p>
            <h3 className="mt-1 font-serif text-2xl">
              {item.reuse.level === "low" ? "Reuse will not do much here" : "Keep it in use if you can"}
            </h3>
            <p className="mt-2 text-sm leading-6">{item.reuse.summary}</p>
            <ul className="mt-3 space-y-2">
              {item.reuse.actions.map((action) => (
                <li key={action.title} className="text-sm">
                  <span className="font-medium">{action.title}. </span>
                  {action.detail}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4 border-2 border-ink p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs uppercase tracking-wide">If it leaves</p>
              <StreamBadge decision={rule.stream} />
            </div>
            <p className="mt-3 text-base leading-6">{rule.setout}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{rule.note}</p>
            {item.caution ? (
              <p className="mt-3 border-l-4 border-primary pl-3 text-sm">{item.caution}</p>
            ) : null}
            <p className="mt-3 text-sm leading-6">{item.why}</p>
            {item.prep.length > 0 ? (
              <div className="mt-3">
                <p className="text-sm font-medium">Prep</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {item.prep.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant={item.reuse.level === "low" ? "outline" : "default"}
              aria-pressed={decision === "reuse"}
              className={press}
              onClick={() => onDecision("reuse")}
            >
              Keep it in use
            </Button>
            <Button
              type="button"
              variant={item.reuse.level === "low" ? "default" : "outline"}
              aria-pressed={decision === rule.stream}
              className={press}
              onClick={() => onDecision(rule.stream)}
            >
              {rule.stream === "landfill"
                ? "Log it as trash"
                : `Log ${DECISION_LABEL[rule.stream].toLowerCase()}`}
            </Button>
            {rule.stream !== "landfill" ? (
              <Button
                type="button"
                variant="outline"
                aria-pressed={decision === "landfill"}
                className={press}
                onClick={() => onDecision("landfill")}
              >
                Trash it anyway
              </Button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr] sm:items-end">
            <div>
              <Label htmlFor="weight">Weight in grams</Label>
              <Input
                id="weight"
                className="mt-1 h-11 border-2 border-ink bg-background text-base"
                inputMode="decimal"
                value={gramsText}
                onChange={(event) => onGrams(event.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">{item.weightNote}</p>
          </div>
          {!gramsValid ? (
            <p className="mt-2 text-sm text-primary" role="alert">
              Enter a weight between a fraction of a gram and 50 kilograms.
            </p>
          ) : null}

          {climate ? (
            <section className="mt-4 bg-ink px-4 py-3 text-card">
              <p className="font-mono text-xs uppercase tracking-wide text-background">
                {decision ? "This decision" : "Preview if you follow the snapshot"}
              </p>
              <p className="mt-1 font-serif text-2xl">{formatDelta(climate.deltaKg).text}</p>
              {climate.perKg !== null && Math.abs(climate.perKg) > 0 ? (
                <p className="mt-1 font-mono text-xs">
                  {formatCo2eMagnitude(climate.perKg)} kg CO2e per kg of material, relative to landfill
                </p>
              ) : null}
              {climate.deltaKg !== null && climate.deltaKg < 0 ? (
                <p className="mt-1 text-sm">
                  About {formatMiles(milesEquivalent(climate.deltaKg) ?? 0)} in a gasoline car, using the EPA equivalency.
                </p>
              ) : null}
              {climate.deltaKg !== null && climate.deltaKg > 0 ? (
                <p className="mt-2 text-sm">
                  On greenhouse gases, WARM rates this path worse than landfilling. The city may still want the cart. The log records the increase.
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-background/90">{climate.shortBasis}</p>
            </section>
          ) : null}

          {showCompare && reuseClimate && streamClimate && rule ? (
            <div className="mt-3 border-2 border-ink">
              <p className="border-b-2 border-ink px-3 py-2 font-mono text-xs uppercase">
                Same weight, two paths
              </p>
              <CompareRow label="Keep in use" climateText={formatDelta(reuseClimate.deltaKg).text} active={decision === "reuse"} />
              <CompareRow
                label={DECISION_LABEL[rule.stream]}
                climateText={formatDelta(streamClimate.deltaKg).text}
                active={decision === rule.stream || decision === null}
              />
            </div>
          ) : null}

          {decision && gramsValid && guidance ? (
            <div className="mt-4 border-t-2 border-ink pt-3">
              <p className="text-sm leading-6">{guidance}</p>
              <p className="mt-2 font-mono text-xs uppercase text-muted-foreground">
                {modelState === "checking"
                  ? "Checking for a language model. The bin already comes from the rule table."
                  : modelState === "model"
                    ? "A language model rewrote the wording. The bin did not change."
                    : modelState === "static"
                      ? "Rules wrote this. Optional LLM enhance unavailable in static demo."
                      : "Rules wrote this. No API key required."}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Choose what you actually did. The log stores that, not the recommendation.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className={press}
              disabled={!ready || !decision || !gramsValid}
              onClick={onLog}
            >
              {ready ? "Add to my log" : "Reading this browser…"}
            </Button>
            {logged ? (
              <Link href="/log" className="text-sm font-medium underline">
                Saved on this device. Open the log.
              </Link>
            ) : null}
          </div>
          {storageError ? (
            <p className="mt-2 text-sm text-primary" role="alert">
              {storageError}
            </p>
          ) : null}

          <ul className="mt-4 space-y-1 text-sm">
            {locality.sources.map((source) => (
              <li key={source.url}>
                <a className="underline" href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function CompareRow({
  label,
  climateText,
  active,
}: {
  label: string;
  climateText: string;
  active: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-3 px-3 py-2 text-sm ${active ? "bg-background" : ""}`}>
      <span className="font-medium">{label}</span>
      <span className="text-right font-mono text-xs">{climateText}</span>
    </div>
  );
}
