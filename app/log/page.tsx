import type { Metadata } from "next";
import { LogDashboard } from "@/components/log-dashboard";

export const metadata: Metadata = {
  title: "Log",
  description: "Kilograms diverted and CO2e avoided, with the unestimated mass called out.",
};

export default function LogPage() {
  return <LogDashboard />;
}
