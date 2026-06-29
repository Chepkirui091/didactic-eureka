"use client";

import { useEffect } from "react";

/** Refetch data on interval, tab focus, and visibility change (live feel on Vercel). */
export function useLiveRefresh(
  callback: () => void | Promise<void>,
  deps: React.DependencyList,
  intervalMs = 20_000,
) {
  useEffect(() => {
    let active = true;

    const run = () => {
      if (active) void callback();
    };

    run();
    const timer = setInterval(run, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
    };
    const onFocus = () => run();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
}
