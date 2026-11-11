"use client";

import {
  BATTERY_ANSWERS,
  BATTERY_CONDITIONS,
  BATTERY_SOURCES,
  SAFESPACE_LABEL,
  stopCard,
  type BatteryAnswer,
  type BatteryCondition,
  type GateResult,
} from "@/lib/battery";
import type { Item } from "@/lib/items";
import type { LocalityId } from "@/lib/types";

const segment =
  "min-h-11 border-2 border-ink px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function HazardStripe({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-2 w-full bg-[repeating-linear-gradient(135deg,#1b1712_0_10px,#f2b705_10px_20px)] ${className}`}
    />
  );
}

export function SafeSpaceTag() {
  return (
    <span className="inline-flex items-center border-2 border-ink bg-[#f2b705] px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-ink">
      {SAFESPACE_LABEL}
    </span>
  );
}

export function BatteryGate({
  item,
  localityId,
  answer,
  condition,
  gate,
  onAnswer,
  onCondition,
}: {
  item: Item;
  localityId: LocalityId;
  answer: BatteryAnswer | null;
  condition: BatteryCondition;
  gate: GateResult;
  onAnswer: (answer: BatteryAnswer) => void;
  onCondition: (condition: BatteryCondition) => void;
}) {
  const builtIn = item.battery === "built-in";
  const card = gate.hasBattery ? stopCard(condition, localityId) : null;

  return (
    <section
      aria-labelledby="battery-gate-title"
      className="mt-5 border-2 border-ink bg-card shadow-[4px_4px_0_0_#1b1712]"
      data-testid="battery-gate"
    >
      <HazardStripe />
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-wide text-special">Battery fire check</p>
          <SafeSpaceTag />
        </div>
        <h3 id="battery-gate-title" className="mt-2 font-serif text-2xl">
          Does it have a battery?
        </h3>

        {builtIn ? (
          <p className="mt-2 border-2 border-ink bg-background px-3 py-2 text-sm">
            <span className="font-semibold">Yes, always.</span> A {item.name.toLowerCase()} has a cell
            inside. There is nothing to answer.
          </p>
        ) : (
          <div role="radiogroup" aria-label="Does it have a battery?" className="mt-3 grid grid-cols-3 gap-2">
            {BATTERY_ANSWERS.map((option) => {
              const selected = (answer ?? "unsure") === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onAnswer(option.value)}
                  className={`${segment} ${selected ? "bg-ink text-card" : "bg-background hover:bg-paper"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        <div
          className={`mt-4 flex items-start gap-3 border-2 border-ink px-3 py-3 ${
            gate.hasBattery ? "bg-special text-white" : "bg-background"
          }`}
          data-testid="battery-outcome"
        >
          <BatteryIcon crossed={gate.hasBattery} />
          <div>
            <p className="font-serif text-2xl leading-tight">
              {gate.hasBattery ? "Never in a cart." : "No battery. The usual rule applies."}
            </p>
            <p className={`mt-1 text-sm leading-6 ${gate.hasBattery ? "text-white/90" : "text-muted-foreground"}`}>
              {gate.reason}
            </p>
          </div>
        </div>

        {gate.hasBattery ? (
          <>
            <p className="mt-4 text-sm font-medium" id="battery-condition-label">
              Any warning signs?
            </p>
            <div
              role="radiogroup"
              aria-labelledby="battery-condition-label"
              className="mt-2 grid gap-2 sm:grid-cols-3"
            >
              {BATTERY_CONDITIONS.map((option) => {
                const selected = condition === option.value;
                const danger = option.value !== "normal";
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onCondition(option.value)}
                    className={`${segment} ${
                      selected
                        ? danger
                          ? "bg-[#b91c1c] text-white"
                          : "bg-ink text-card"
                        : "bg-background hover:bg-paper"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {card ? (
          <div
            role="alert"
            className="mt-4 border-4 border-[#b91c1c] bg-[#fff5f5] p-4 text-ink"
            data-testid="stop-card"
          >
            <p className="font-mono text-xs uppercase tracking-wide text-[#b91c1c]">Safety first</p>
            <p className="mt-1 font-serif text-3xl leading-tight text-[#b91c1c]">{card.title}</p>
            <p className="mt-1 text-sm">{card.lead}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6">
              {card.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 border-l-4 border-[#b91c1c] pl-3 text-sm font-semibold">{card.emergency}</p>
            <p className="mt-2 text-sm leading-6">{card.localLine}</p>
            <p className="mt-2 font-mono text-[11px] uppercase text-muted-foreground">{card.limit}</p>
          </div>
        ) : null}

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium underline">Why this gate exists</summary>
          <p className="mt-2 leading-6">
            Batteries hidden in everyday objects get crushed in trucks and sorting plants and start
            fires. EPA found 245 fires at 64 waste facilities from 2013 to 2020 that were caused, or
            likely caused, by lithium batteries, and says that count misses many incidents. The gate
            runs before every bin rule, and “Not sure” counts as yes.
          </p>
          <ul className="mt-2 space-y-1">
            {BATTERY_SOURCES.map((source) => (
              <li key={source.url}>
                <a className="underline" href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}

function BatteryIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className="mt-1 h-9 w-9 shrink-0">
      <rect x="8" y="12" width="22" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="30" y="17" width="4" height="6" fill="currentColor" />
      <path d="M17 15l-3 6h5l-3 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {crossed ? <path d="M4 4l32 32" stroke="currentColor" strokeWidth="3" /> : null}
    </svg>
  );
}
