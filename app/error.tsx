"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="border-2 border-ink bg-card p-5">
      <h1 className="font-serif text-3xl">This page broke.</h1>
      <p className="mt-2 max-w-xl text-sm leading-6">
        {error.message || "Something unexpected failed while rendering. The log in this browser is still there."}
      </p>
      <Button
        type="button"
        className="mt-4 h-11 border-2 border-ink px-4 text-base shadow-[3px_3px_0_0_#1b1712]"
        onClick={reset}
      >
        Try again
      </Button>
    </div>
  );
}
