"use client";

import { useEffect } from "react";

export default function RoadmapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-xl font-semibold">Projects didn’t load</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        The saved project list on this device was out of date. Reload to fetch a fresh copy.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg px-4 py-2 text-sm font-medium"
        style={{ background: "hsl(var(--accent))", color: "white" }}
      >
        Reload projects
      </button>
    </div>
  );
}
