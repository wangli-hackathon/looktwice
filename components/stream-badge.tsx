import { DECISION_LABEL } from "@/lib/format";
import type { Decision } from "@/lib/types";

const TONE: Record<Decision, string> = {
  reuse: "bg-primary text-primary-foreground",
  recycle: "bg-recycle text-white",
  compost: "bg-compost text-white",
  landfill: "bg-landfill text-white",
  special: "bg-special text-white",
};

export function StreamBadge({ decision }: { decision: Decision }) {
  return (
    <span
      className={`inline-flex h-7 items-center border-2 border-ink px-2 text-xs font-semibold tracking-wide uppercase ${TONE[decision]}`}
    >
      {DECISION_LABEL[decision]}
    </span>
  );
}
