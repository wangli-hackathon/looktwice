"use client";

import { useState } from "react";
import { StreamBadge } from "@/components/stream-badge";
import { useWaste } from "@/components/waste-provider";
import { items } from "@/lib/items";
import { localities } from "@/lib/localities";
import type { LocalityId } from "@/lib/types";

export function RulesExplorer() {
  const { localityId, setLocalityId } = useWaste();
  const [itemId, setItemId] = useState("pizza-box");
  const item = items.find((candidate) => candidate.id === itemId) ?? items[0];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-primary">Same object, different city</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">The cart is local.</h1>
      <p className="mt-3 max-w-2xl text-base leading-7">
        These are November 2026 snapshots of public pages, not a live feed from a hauler. Apartment
        setout can differ from a house cart. When the city page and this table disagree, believe the city.
      </p>

      <label htmlFor="rule-item" className="mt-6 block text-sm font-medium">
        Object
      </label>
      <select
        id="rule-item"
        value={item.id}
        onChange={(event) => setItemId(event.target.value)}
        className="mt-1 h-11 w-full max-w-md border-2 border-ink bg-card px-2 text-base"
      >
        {items.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name}
          </option>
        ))}
      </select>

      <p className="mt-4 max-w-2xl text-sm leading-6">{item.why}</p>

      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {localities.map((locality) => {
          const rule = item.rules[locality.id as LocalityId];
          const current = locality.id === localityId;
          return (
            <li
              key={locality.id}
              className={`border-2 border-ink bg-card p-4 ${current ? "shadow-[6px_6px_0_0_#c2410c]" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-2xl">{locality.city}</h2>
                <StreamBadge decision={rule.stream} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{locality.hauler}</p>
              <p className="mt-3 text-sm leading-6">{rule.setout}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{rule.note}</p>
              <button
                type="button"
                className="mt-3 text-sm font-medium underline"
                onClick={() => setLocalityId(locality.id)}
              >
                {current ? "Using this city" : "Use this city"}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 space-y-4">
        {localities.map((locality) => (
          <section key={locality.id} className="border-t-2 border-ink pt-4">
            <h2 className="font-serif text-2xl">{locality.city}</h2>
            <p className="mt-2 text-sm leading-6">{locality.summary}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{locality.limit}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {locality.sources.map((source) => (
                <li key={source.url}>
                  <a className="underline" href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
