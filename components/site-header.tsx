"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localities } from "@/lib/localities";
import type { LocalityId } from "@/lib/types";
import { useWaste } from "@/components/waste-provider";

const LINKS = [
  { href: "/", label: "Decide" },
  { href: "/log", label: "Log" },
  { href: "/rules", label: "Rules" },
  { href: "/method", label: "Method" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { localityId, setLocalityId, ready } = useWaste();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="min-w-0">
          <span className="font-serif text-2xl leading-none tracking-tight">Looktwice</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            The bin is the last resort.
          </span>
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center border-2 px-3 text-sm font-medium ${
                  active
                    ? "border-ink bg-ink text-card"
                    : "border-transparent hover:border-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <select
            id="city"
            value={ready ? localityId : "sf"}
            disabled={!ready}
            onChange={(event) => setLocalityId(event.target.value as LocalityId)}
            className="h-10 max-w-[14rem] border-2 border-ink bg-card px-2 text-sm"
          >
            {localities.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
