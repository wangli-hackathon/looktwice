import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { WasteProvider } from "@/components/waste-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: {
    default: "Looktwice",
    template: "%s — Looktwice",
  },
  description:
    "Reuse first, then sort by the city you are in, and log the kilograms and CO2e with EPA WARM v16 factors.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} ${plex.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <WasteProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t-2 border-ink">
            <p className="mx-auto max-w-6xl px-4 py-4 text-sm leading-6 text-muted-foreground">
              Looktwice is a student project for Arbiter Hacks V1, track Rethinking Waste. It is
              decision support from a November 2026 snapshot of public rules, not an instruction from
              your hauler. When the cart and the app disagree, believe the cart and the city page.
            </p>
          </footer>
        </WasteProvider>
      </body>
    </html>
  );
}
