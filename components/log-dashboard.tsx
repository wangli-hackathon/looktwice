"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HazardStripe, SafeSpaceTag } from "@/components/battery-gate";
import { StreamBadge } from "@/components/stream-badge";
import { useWaste } from "@/components/waste-provider";
import { formatDelta, formatMassKg, formatMiles, DECISION_LABEL } from "@/lib/format";
import { milesEquivalent } from "@/lib/impact";
import { demoWeek, serializeLog, summarize, type LogEntry } from "@/lib/log";
import type { Decision } from "@/lib/types";

const press =
  "h-11 border-2 border-ink px-4 text-base shadow-[3px_3px_0_0_#1b1712]";

const ORDER: Decision[] = ["reuse", "recycle", "compost", "special", "landfill"];

export function LogDashboard() {
  const { entries, ready, addEntries, removeEntry, clearEntries, storageError } = useWaste();
  const [confirmClear, setConfirmClear] = useState(false);
  const summary = summarize(entries);
  const miles = milesEquivalent(summary.netKgCo2e);
  const anyEstimated = entries.some((entry) => entry.deltaKg !== null);
  const maxKg = Math.max(...ORDER.map((decision) => summary.byDecision[decision].kg), 0);

  function download() {
    const blob = new Blob(
      [serializeLog(entries, new Date().toISOString())],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "looktwice-log.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function addDemo() {
    const stamp = new Date().toISOString();
    const extras = demoWeek(stamp).map((entry, index) => ({
      ...entry,
      id: `${entry.id}-${stamp}-${index}`,
    }));
    addEntries(extras);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-primary">Your record</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">What you kept out.</h1>
      <p className="mt-3 max-w-2xl text-base leading-7">
        Stored in this browser only. Diverted mass is anything you did not landfill. CO2e is the
        WARM difference against landfilling, and blanks stay blank.
      </p>

      {!ready ? (
        <p className="mt-6 border-2 border-ink bg-card p-4" role="status">
          Reading this browser…
        </p>
      ) : null}

      {ready && entries.length === 0 ? (
        <div className="mt-6 border-2 border-ink bg-card p-5">
          <h2 className="font-serif text-3xl">The log is empty.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6">
            A decision lands here after you log it on the Decide page. The short version of the
            argument is a greasy pizza box in San Francisco, then a plate of leftovers you eat
            instead of compost.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className={press} render={<Link href="/" />}>
              Make a decision
            </Button>
            <Button type="button" variant="outline" className={press} onClick={addDemo}>
              Add a demo week
            </Button>
          </div>
        </div>
      ) : null}

      {ready && entries.length > 0 ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Figure label="Diverted" value={formatMassKg(summary.divertedKg)} detail={`${formatMassKg(summary.landfillKg)} landfilled`} />
            <Figure
              label="CO2e, net"
              value={anyEstimated ? formatDelta(summary.netKgCo2e).text : "Not estimated"}
              detail={
                summary.addedKgCo2e > 0
                  ? `${formatDelta(-summary.avoidedKgCo2e).text} gross avoided, ${formatDelta(summary.addedKgCo2e).text}`
                  : "Sum of estimated paths only"
              }
            />
            <Figure
              label="Car miles"
              value={miles === null ? "Not a reduction" : formatMiles(miles)}
              detail="EPA gasoline passenger vehicle, 0.393 kg CO2e per mile"
            />
          </div>

          {summary.unestimatedDivertedKg > 0 ? (
            <p className="mt-3 border-2 border-ink bg-background px-3 py-2 text-sm">
              {formatMassKg(summary.unestimatedDivertedKg)} diverted with no CO2e factor. Those
              kilograms are real. They are not in the climate total.
            </p>
          ) : null}
          {summary.unestimatedLandfillKg > 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {formatMassKg(summary.unestimatedLandfillKg)} landfilled with no WARM row, so that
              trash is not entered as a measured zero.
            </p>
          ) : null}

          <section
            aria-labelledby="battery-count-title"
            className="mt-4 border-2 border-ink bg-card"
            data-testid="battery-counter"
          >
            <HazardStripe />
            <div className="grid gap-3 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="border-2 border-ink bg-special px-4 py-3 text-white">
                <p className="font-mono text-xs uppercase tracking-wide">Batteries kept out of carts</p>
                <p className="mt-1 font-serif text-5xl leading-none" id="battery-count-title">
                  {summary.batteriesKeptOut}
                </p>
              </div>
              <div>
                <SafeSpaceTag />
                <p className="mt-2 text-sm leading-6">
                  Counted on its own, not as kilograms or CO2e. Each one is an ignition source that did
                  not ride in a garbage truck or a recycling sorter.
                </p>
                {summary.batteriesInCarts > 0 ? (
                  <p className="mt-1 text-sm font-medium text-special">
                    {summary.batteriesInCarts} battery-bearing{" "}
                    {summary.batteriesInCarts === 1 ? "object was" : "objects were"} logged into a cart.
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="mt-6 border-2 border-ink bg-card p-4">
            <h2 className="font-serif text-2xl">By path</h2>
            <ul className="mt-3 space-y-3">
              {ORDER.map((decision) => {
                const bucket = summary.byDecision[decision];
                const width = maxKg > 0 ? (bucket.kg / maxKg) * 100 : 0;
                return (
                  <li key={decision}>
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                      <span>{DECISION_LABEL[decision]}</span>
                      <span className="font-mono text-xs">
                        {bucket.count} · {formatMassKg(bucket.kg)}
                      </span>
                    </div>
                    <div className="h-3 border border-ink bg-background">
                      <div className="h-full bg-ink" style={{ width: `${width}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" className={press} onClick={addDemo}>
              Add a demo week
            </Button>
            <Button type="button" variant="outline" className={press} onClick={download}>
              Export JSON
            </Button>
            <Button type="button" variant="outline" className={press} onClick={() => setConfirmClear(true)}>
              Clear log
            </Button>
          </div>

          <ul className="mt-6 divide-y-2 divide-ink border-2 border-ink bg-card">
            {entries.map((entry) => (
              <LogRow key={entry.id} entry={entry} onRemove={() => removeEntry(entry.id)} />
            ))}
          </ul>
        </>
      ) : null}

      {storageError ? (
        <p className="mt-4 text-sm text-primary" role="alert">
          {storageError}
        </p>
      ) : null}

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear the log?</DialogTitle>
            <DialogDescription>
              This removes every decision stored in this browser. It does not affect anyone else.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" className={press} onClick={() => setConfirmClear(false)}>
              Keep it
            </Button>
            <Button
              type="button"
              className={press}
              onClick={() => {
                clearEntries();
                setConfirmClear(false);
              }}
            >
              Clear the log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Figure({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border-2 border-ink bg-ink p-4 text-card">
      <p className="font-mono text-xs uppercase tracking-wide text-background">{label}</p>
      <p className="mt-2 font-serif text-3xl leading-none">{value}</p>
      <p className="mt-2 text-sm text-background/80">{detail}</p>
    </div>
  );
}

function LogRow({ entry, onRemove }: { entry: LogEntry; onRemove: () => void }) {
  const when = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(entry.at));
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{entry.itemName}</p>
          <StreamBadge decision={entry.decision} />
          {entry.battery ? (
            <span className="border-2 border-ink bg-[#f2b705] px-1.5 py-0.5 font-mono text-[11px] uppercase">
              Battery
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {entry.localityName} · {formatMassKg(entry.weightKg)} · {when}
        </p>
        <p className="mt-1 text-sm">{formatDelta(entry.deltaKg).text}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{entry.shortBasis}</p>
      </div>
      <button type="button" className="self-start text-sm underline" onClick={onRemove}>
        Remove
      </button>
    </li>
  );
}
