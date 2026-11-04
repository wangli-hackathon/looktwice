import type { Metadata } from "next";
import { RulesExplorer } from "@/components/rules-explorer";

export const metadata: Metadata = {
  title: "Rules",
  description: "The same object across San Francisco, Seattle, New York, Austin, and a national baseline.",
};

export default function RulesPage() {
  return <RulesExplorer />;
}
