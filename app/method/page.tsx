import type { Metadata } from "next";
import { MethodArticle } from "@/components/method-article";

export const metadata: Metadata = {
  title: "Method",
  description: "How Looktwice measures diverted mass and CO2e with EPA WARM version 16.",
};

export default function MethodPage() {
  return <MethodArticle />;
}
