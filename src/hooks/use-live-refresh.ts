"use client";

import { useEffect } from "react";

/** Run fetch once on mount — no polling. Use cache + invalidate for updates. */
export function useMountFetch(
  callback: () => void | Promise<void>,
  deps: React.DependencyList,
) {
  useEffect(() => {
    void callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
}
