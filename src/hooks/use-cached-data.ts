"use client";

import { useCallback, useEffect, useState } from "react";
import { CacheKeys, readCache, subscribeCacheInvalidation } from "@/lib/client-cache";

/**
 * Load data once from cache (localStorage + memory), fetch only on cache miss or force refresh.
 * Cache is read only after mount to avoid SSR/client hydration mismatches.
 */
export function useCachedData<T>(
  cacheKey: string,
  fetcher: (force: boolean) => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (force = false) => {
      if (!force) {
        const cached = readCache<T>(cacheKey);
        if (cached) {
          setData(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      setLoading(true);
      try {
        const result = await fetcher(force);
        setData(result);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, fetcher],
  );

  useEffect(() => {
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + deps from caller
  }, [load, ...deps]);

  useEffect(() => {
    return subscribeCacheInvalidation((keys) => {
      if (keys.includes(cacheKey)) void load(true);
    });
  }, [cacheKey, load]);

  return { data, loading, refresh: () => load(true), setData };
}

export { CacheKeys };
