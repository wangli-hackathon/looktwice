import type { Metadata } from "next";
import { ScanExperience } from "@/components/scan-experience";

export const metadata: Metadata = {
  title: "Decide",
  description: "Name an object, or give it a photo, and sort it with city rules before you log it.",
};

export default function HomePage() {
  return <ScanExperience />;
}
